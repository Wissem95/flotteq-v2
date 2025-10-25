import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../../entities/rating.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { Partner } from '../../entities/partner.entity';
import { Tenant } from '../../entities/tenant.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto, RatingListResponseDto } from './dto/rating-response.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../entities/audit-log.entity';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private auditService: AuditService,
  ) {}

  async create(createRatingDto: CreateRatingDto, tenantId: number, userId: string): Promise<Rating> {
    // Validate booking exists and belongs to tenant
    const booking = await this.bookingRepository.findOne({
      where: { id: createRatingDto.bookingId },
      relations: ['partner'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.tenantId !== tenantId) {
      throw new BadRequestException('This booking does not belong to your organization');
    }

    // Validate booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed bookings');
    }

    // Check if booking already rated
    const existingRating = await this.ratingRepository.findOne({
      where: { bookingId: createRatingDto.bookingId },
    });

    if (existingRating) {
      throw new ConflictException('This booking has already been rated');
    }

    // Create rating
    const rating = this.ratingRepository.create({
      bookingId: createRatingDto.bookingId,
      tenantId,
      partnerId: booking.partnerId,
      score: createRatingDto.score,
      comment: createRatingDto.comment || null,
    });

    const savedRating = await this.ratingRepository.save(rating);

    // Log audit
    await this.auditService.create({
      userId,
      tenantId,
      action: AuditAction.CREATE,
      entityType: 'rating',
      entityId: savedRating.id,
      newValue: {
        bookingId: savedRating.bookingId,
        score: savedRating.score,
      },
    });

    // Update partner rating
    await this.updatePartnerRating(booking.partnerId);

    this.logger.log(`Rating created for booking ${createRatingDto.bookingId} by tenant ${tenantId}`);

    return savedRating;
  }

  async updatePartnerRating(partnerId: string): Promise<void> {
    // Get all ratings for this partner
    const ratings = await this.ratingRepository.find({
      where: { partnerId },
    });

    if (ratings.length === 0) {
      // No ratings yet, set to 0
      await this.partnerRepository.update(partnerId, {
        rating: 0,
        totalReviews: 0,
      });
      return;
    }

    // Calculate average score
    const totalScore = ratings.reduce((sum, rating) => sum + Number(rating.score), 0);
    const avgScore = totalScore / ratings.length;

    // Round to 2 decimal places
    const roundedAvg = Math.round(avgScore * 100) / 100;

    // Update partner
    await this.partnerRepository.update(partnerId, {
      rating: roundedAvg,
      totalReviews: ratings.length,
    });

    this.logger.log(
      `Partner ${partnerId} rating updated: ${roundedAvg} (${ratings.length} reviews)`,
    );
  }

  async findByPartner(
    partnerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<RatingListResponseDto> {
    const query = this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.tenant', 'tenant')
      .leftJoinAndSelect('rating.partner', 'partner')
      .where('rating.partner_id = :partnerId', { partnerId })
      .orderBy('rating.created_at', 'DESC');

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    query.skip((page - 1) * limit).take(limit);

    const ratings = await query.getMany();

    const data: RatingResponseDto[] = ratings.map((rating) => this.toResponseDto(rating));

    // Calculate average score
    let averageScore = 0;
    if (ratings.length > 0) {
      const totalScore = ratings.reduce((sum, r) => sum + Number(r.score), 0);
      averageScore = Math.round((totalScore / ratings.length) * 100) / 100;
    }

    return {
      ratings: data,
      total,
      page,
      limit,
      totalPages,
      averageScore,
    };
  }

  async findByTenant(
    tenantId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<RatingListResponseDto> {
    const query = this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.partner', 'partner')
      .leftJoinAndSelect('rating.tenant', 'tenant')
      .where('rating.tenant_id = :tenantId', { tenantId })
      .orderBy('rating.created_at', 'DESC');

    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    query.skip((page - 1) * limit).take(limit);

    const ratings = await query.getMany();

    const data: RatingResponseDto[] = ratings.map((rating) => this.toResponseDto(rating));

    return {
      ratings: data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, tenantId: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id, tenantId },
      relations: ['partner', 'tenant', 'booking'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  async canRateBooking(bookingId: string, tenantId: number): Promise<boolean> {
    // Check if booking exists and belongs to tenant
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, tenantId },
    });

    if (!booking) {
      return false;
    }

    // Check if booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      return false;
    }

    // Check if already rated
    const existingRating = await this.ratingRepository.findOne({
      where: { bookingId },
    });

    return !existingRating;
  }

  private toResponseDto(rating: Rating): RatingResponseDto {
    return {
      id: rating.id,
      bookingId: rating.bookingId,
      tenantId: rating.tenantId,
      tenantName: rating.tenant?.name || 'Unknown',
      partnerId: rating.partnerId,
      partnerName: rating.partner?.companyName || 'Unknown',
      score: Number(rating.score),
      comment: rating.comment,
      createdAt: rating.createdAt,
    };
  }
}
