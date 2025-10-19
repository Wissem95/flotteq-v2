import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Partner, PartnerStatus } from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { SearchPartnersDto } from './dto/search-partners.dto';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { SimpleCacheService } from '../../common/cache/simple-cache.service';
import * as crypto from 'crypto';

/**
 * PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
 *
 * 1. ✅ In-Memory Cache (TTL 5 minutes):
 *    - Cache search results to avoid repeated calculations
 *    - Cache key: hash(lat,lng,radius,filters)
 *    - Automatic cache invalidation after 5 minutes
 *
 * 2. PostGIS Alternative (if > 1000 partners):
 *    - PostgreSQL extension for geospatial queries
 *    - Replace Haversine with ST_Distance for better performance
 *    - Migration effort: ~2 hours
 *
 * 3. Performance Metrics:
 *    - All major operations are logged via Logger.debug
 *    - Monitor execution time, filter counts, and Haversine calculations
 *    - Cache hit/miss logging
 */

type PartnerSearchResult = Omit<Partner, 'isApproved' | 'canOfferServices'> & {
  distance: number;
  relevanceScore: number;
  hasAvailability: boolean;
  services: PartnerService[];
};

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(PartnerService)
    private partnerServiceRepository: Repository<PartnerService>,
    private availabilitiesService: AvailabilitiesService,
    private cacheService: SimpleCacheService,
  ) {}

  async searchPartners(dto: SearchPartnersDto): Promise<PaginatedResponse<PartnerSearchResult>> {
    const startTime = Date.now();

    // Generate cache key from search parameters
    const cacheKey = this.generateCacheKey(dto);

    // Try to get from cache first
    const cached = await this.cacheService.get<PaginatedResponse<PartnerSearchResult>>(cacheKey);
    if (cached) {
      const cacheTime = Date.now() - startTime;
      this.logger.debug(`Cache HIT for key ${cacheKey} (${cacheTime}ms)`);
      return cached;
    }

    this.logger.debug(`Cache MISS for key ${cacheKey}. Computing results...`);

    // Step 1: Get all approved partners with coordinates
    const partners = await this.partnerRepository.find({
      where: {
        status: PartnerStatus.APPROVED,
        deletedAt: IsNull(),
        latitude: Not(IsNull()),
        longitude: Not(IsNull()),
      },
    });

    this.logger.debug(`Found ${partners.length} approved partners with coordinates`);

    // Step 2: Filter by type if provided
    let filteredPartners = partners;
    if (dto.type) {
      filteredPartners = filteredPartners.filter((p) => p.type === dto.type);
      this.logger.debug(`Filtered by type ${dto.type}: ${filteredPartners.length} partners`);
    }

    // Step 3: Calculate distance and filter by radius
    const partnersWithDistance = filteredPartners
      .map((partner) => ({
        ...partner,
        distance: this.calculateDistance(
          dto.lat,
          dto.lng,
          Number(partner.latitude),
          Number(partner.longitude),
        ),
      }))
      .filter((p) => p.distance <= dto.radius);

    this.logger.debug(
      `Filtered by radius ${dto.radius}km: ${partnersWithDistance.length} partners`,
    );

    // Step 4: Filter by rating if provided
    let ratedPartners = partnersWithDistance;
    if (dto.minRating !== undefined) {
      ratedPartners = ratedPartners.filter((p) => Number(p.rating) >= dto.minRating!);
      this.logger.debug(`Filtered by rating >=${dto.minRating}: ${ratedPartners.length} partners`);
    }

    // Step 5: Get services and filter by service type and price
    const partnersWithServices = await Promise.all(
      ratedPartners.map(async (partner) => {
        const services = await this.partnerServiceRepository.find({
          where: {
            partnerId: partner.id,
            isActive: true,
          },
        });

        return {
          ...partner,
          services,
        };
      }),
    );

    // Filter by service type
    let serviceFilteredPartners = partnersWithServices;
    if (dto.serviceType) {
      serviceFilteredPartners = serviceFilteredPartners.filter((p) =>
        p.services.some((s) => s.name.toLowerCase().includes(dto.serviceType!.toLowerCase())),
      );
      this.logger.debug(
        `Filtered by service type "${dto.serviceType}": ${serviceFilteredPartners.length} partners`,
      );
    }

    // Filter by price range
    if (dto.priceMin !== undefined || dto.priceMax !== undefined) {
      serviceFilteredPartners = serviceFilteredPartners.filter((p) => {
        if (p.services.length === 0) return false;

        const prices = p.services.map((s) => Number(s.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (dto.priceMin !== undefined && maxPrice < dto.priceMin) return false;
        if (dto.priceMax !== undefined && minPrice > dto.priceMax) return false;

        return true;
      });

      this.logger.debug(
        `Filtered by price range [${dto.priceMin ?? 0}, ${dto.priceMax ?? '∞'}]: ${serviceFilteredPartners.length} partners`,
      );
    }

    // Step 6: Check availability if date is provided
    const partnersWithAvailability = await Promise.all(
      serviceFilteredPartners.map(async (partner) => {
        let hasAvailability = false;

        if (dto.date) {
          try {
            // Use default duration of 60 minutes for availability check
            const slots = await this.availabilitiesService.getAvailableSlots(partner.id, {
              date: dto.date,
              duration: 60,
            });

            hasAvailability = slots.availableCount > 0;
          } catch (error) {
            this.logger.warn(
              `Failed to check availability for partner ${partner.id}: ${error.message}`,
            );
          }
        } else {
          // If no date specified, assume partner has availability
          hasAvailability = true;
        }

        return {
          ...partner,
          hasAvailability,
        };
      }),
    );

    // Step 7: Calculate relevance score and sort
    const partnersWithScore = partnersWithAvailability.map((partner) => {
      const avgPrice =
        partner.services.length > 0
          ? partner.services.reduce((sum, s) => sum + Number(s.price), 0) / partner.services.length
          : 0;

      const relevanceScore = this.calculateRelevanceScore(
        partner,
        partner.distance,
        avgPrice,
        dto.radius,
      );

      return {
        ...partner,
        relevanceScore,
      };
    });

    // Sort by relevance score (highest first)
    const sortedPartners = partnersWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Step 8: Apply pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedPartners = sortedPartners.slice(startIndex, endIndex);

    const executionTime = Date.now() - startTime;
    this.logger.debug(
      `Search completed in ${executionTime}ms. Found ${sortedPartners.length} partners. Returning page ${page} with ${paginatedPartners.length} results.`,
    );

    const result = {
      data: paginatedPartners as PartnerSearchResult[],
      meta: {
        total: sortedPartners.length,
        page,
        limit,
        totalPages: Math.ceil(sortedPartners.length / limit),
        hasNextPage: endIndex < sortedPartners.length,
        hasPreviousPage: page > 1,
      },
    };

    // Store in cache (TTL 5 minutes)
    await this.cacheService.set(cacheKey, result);
    this.logger.debug(`Cached search results with key ${cacheKey}`);

    return result;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lng1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lng2 Longitude of point 2
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculate relevance score based on multiple criteria
   * @param partner Partner entity with availability
   * @param distance Distance in km
   * @param avgPrice Average price of services
   * @param maxRadius Maximum search radius
   * @returns Relevance score (0-100)
   */
  private calculateRelevanceScore(
    partner: { rating: number; hasAvailability: boolean },
    distance: number,
    avgPrice: number,
    maxRadius: number,
  ): number {
    // Distance score (40%): Closer is better
    const distanceScore = Math.max(0, 100 - (distance / maxRadius) * 100) * 0.4;

    // Rating score (30%): Higher rating is better
    const ratingScore = (Number(partner.rating) / 5) * 100 * 0.3;

    // Price score (20%): Lower price is better (assuming max price of 200€)
    const priceScore = avgPrice > 0 ? Math.max(0, (1 - Math.min(avgPrice / 200, 1)) * 100) * 0.2 : 20;

    // Availability score (10%): Available partners get bonus
    const availabilityScore = partner.hasAvailability ? 10 : 0;

    const totalScore = distanceScore + ratingScore + priceScore + availabilityScore;

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate cache key from search parameters
   * Uses MD5 hash for consistent, short keys
   */
  private generateCacheKey(dto: SearchPartnersDto): string {
    const keyData = {
      lat: dto.lat.toFixed(4), // Round to 4 decimals for cache efficiency
      lng: dto.lng.toFixed(4),
      radius: dto.radius,
      type: dto.type || 'all',
      serviceType: dto.serviceType || 'all',
      date: dto.date || 'any',
      priceMin: dto.priceMin ?? 0,
      priceMax: dto.priceMax ?? 999999,
      minRating: dto.minRating ?? 0,
      page: dto.page || 1,
      limit: dto.limit || 20,
    };

    const keyString = JSON.stringify(keyData);
    const hash = crypto.createHash('md5').update(keyString).digest('hex');

    return `partner_search:${hash}`;
  }
}
