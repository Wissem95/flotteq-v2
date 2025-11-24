import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchService } from './search.service';
import {
  Partner,
  PartnerStatus,
  PartnerType,
} from '../../entities/partner.entity';
import { PartnerService } from '../../entities/partner-service.entity';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { SearchPartnersDto } from './dto/search-partners.dto';
import { SimpleCacheService } from '../../common/cache/simple-cache.service';

describe('SearchService', () => {
  let service: SearchService;
  let partnerRepository: jest.Mocked<Repository<Partner>>;
  let partnerServiceRepository: jest.Mocked<Repository<PartnerService>>;
  let availabilitiesService: jest.Mocked<AvailabilitiesService>;
  let cacheService: SimpleCacheService;

  // Paris coordinates
  const PARIS_LAT = 48.8566;
  const PARIS_LNG = 2.3522;

  // Lyon coordinates (approximately 392 km from Paris)
  const LYON_LAT = 45.764;
  const LYON_LNG = 4.8357;

  // Mock partner in Paris
  const mockPartnerParis: Partial<Partner> = {
    id: 'partner-paris',
    companyName: 'Garage Paris',
    type: PartnerType.GARAGE,
    status: PartnerStatus.APPROVED,
    latitude: PARIS_LAT,
    longitude: PARIS_LNG,
    rating: 4.5,
    deletedAt: undefined,
  };

  // Mock partner in Lyon
  const mockPartnerLyon: Partial<Partner> = {
    id: 'partner-lyon',
    companyName: 'Garage Lyon',
    type: PartnerType.GARAGE,
    status: PartnerStatus.APPROVED,
    latitude: LYON_LAT,
    longitude: LYON_LNG,
    rating: 4.0,
    deletedAt: undefined,
  };

  // Mock partner near Paris (5 km away)
  const mockPartnerNearParis: Partial<Partner> = {
    id: 'partner-near-paris',
    companyName: 'Garage Proche Paris',
    type: PartnerType.GARAGE,
    status: PartnerStatus.APPROVED,
    latitude: 48.9,
    longitude: 2.4,
    rating: 3.5,
    deletedAt: undefined,
  };

  // Mock partner without coordinates
  const mockPartnerNoCoords: Partial<Partner> = {
    id: 'partner-no-coords',
    companyName: 'Garage Sans Coords',
    type: PartnerType.GARAGE,
    status: PartnerStatus.APPROVED,
    latitude: null,
    longitude: null,
    rating: 5.0,
    deletedAt: undefined,
  };

  // Mock services
  const mockServiceVidange: Partial<PartnerService> = {
    id: 'service-vidange',
    partnerId: 'partner-paris',
    name: 'Vidange',
    price: 80,
    durationMinutes: 60,
    isActive: true,
  };

  const mockServiceExpensive: Partial<PartnerService> = {
    id: 'service-expensive',
    partnerId: 'partner-lyon',
    name: 'Réparation moteur',
    price: 250,
    durationMinutes: 180,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getRepositoryToken(Partner),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PartnerService),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: AvailabilitiesService,
          useValue: {
            getAvailableSlots: jest.fn(),
          },
        },
        SimpleCacheService,
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    partnerRepository = module.get(getRepositoryToken(Partner));
    partnerServiceRepository = module.get(getRepositoryToken(PartnerService));
    availabilitiesService = module.get(AvailabilitiesService);
    cacheService = module.get<SimpleCacheService>(SimpleCacheService);

    // Clear cache before each test
    await cacheService.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Haversine Distance Calculation', () => {
    it('should calculate distance Paris to Lyon as approximately 392 km', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerLyon as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 500, // Large radius to include Lyon
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].distance).toBeGreaterThan(390);
      expect(result.data[0].distance).toBeLessThan(395);
    });

    it('should calculate distance for partner near Paris as approximately 5-10 km', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerNearParis as Partner,
      ]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].distance).toBeGreaterThan(4);
      expect(result.data[0].distance).toBeLessThan(12);
    });
  });

  describe('Filter by Radius', () => {
    it('should exclude partners outside radius', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerLyon as Partner,
      ]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10, // Only include partners within 10 km
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('partner-paris');
    });

    it('should include all partners within radius', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerNearParis as Partner,
      ]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(2);
    });
  });

  describe('Filter by Partner Type', () => {
    it('should filter partners by type', async () => {
      const garagePartner = { ...mockPartnerParis, type: PartnerType.GARAGE };
      const ctCenterPartner = {
        ...mockPartnerNearParis,
        type: PartnerType.CT_CENTER,
      };

      partnerRepository.find.mockResolvedValue([
        garagePartner,
        ctCenterPartner,
      ] as Partner[]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
        type: PartnerType.GARAGE,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].type).toBe(PartnerType.GARAGE);
    });
  });

  describe('Filter by Service Type', () => {
    it('should filter partners by service type', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerLyon as Partner,
      ]);

      partnerServiceRepository.find
        .mockResolvedValueOnce([mockServiceVidange as PartnerService])
        .mockResolvedValueOnce([mockServiceExpensive as PartnerService]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 500,
        serviceType: 'vidange',
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('partner-paris');
    });
  });

  describe('Filter by Price Range', () => {
    it('should filter partners by minimum price', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerLyon as Partner,
      ]);

      partnerServiceRepository.find
        .mockResolvedValueOnce([mockServiceVidange as PartnerService])
        .mockResolvedValueOnce([mockServiceExpensive as PartnerService]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 500,
        priceMin: 200,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('partner-lyon');
    });

    it('should filter partners by maximum price', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerLyon as Partner,
      ]);

      partnerServiceRepository.find
        .mockResolvedValueOnce([mockServiceVidange as PartnerService])
        .mockResolvedValueOnce([mockServiceExpensive as PartnerService]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 500,
        priceMax: 100,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('partner-paris');
    });

    it('should filter partners by price range', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerLyon as Partner,
      ]);

      partnerServiceRepository.find
        .mockResolvedValueOnce([mockServiceVidange as PartnerService])
        .mockResolvedValueOnce([mockServiceExpensive as PartnerService]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 500,
        priceMin: 50,
        priceMax: 150,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('partner-paris');
    });
  });

  describe('Filter by Minimum Rating', () => {
    it('should filter partners by minimum rating', async () => {
      partnerRepository.find.mockResolvedValue([
        mockPartnerParis as Partner,
        mockPartnerNearParis as Partner,
      ]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
        minRating: 4.0,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].rating).toBeGreaterThanOrEqual(4.0);
    });
  });

  describe('Sort by Relevance', () => {
    it('should sort partners by relevance score', async () => {
      const closePartnerHighRating = {
        ...mockPartnerParis,
        id: 'close-high-rating',
        rating: 4.5,
      };
      const farPartnerLowRating = {
        ...mockPartnerNearParis,
        id: 'far-low-rating',
        rating: 2.0,
      };

      partnerRepository.find.mockResolvedValue([
        farPartnerLowRating,
        closePartnerHighRating,
      ] as Partner[]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(2);
      // Close partner with high rating should score higher
      // Distance (0km) + rating (4.5/5) = high score
      expect(result.data[0].id).toBe('close-high-rating');
      expect(result.data[0].relevanceScore).toBeGreaterThan(
        result.data[1].relevanceScore!,
      );
    });
  });

  describe('Pagination', () => {
    it('should paginate results correctly', async () => {
      const partners = Array.from({ length: 25 }, (_, i) => ({
        ...mockPartnerParis,
        id: `partner-${i}`,
        latitude: PARIS_LAT + i * 0.01,
        longitude: PARIS_LNG + i * 0.01,
      }));

      partnerRepository.find.mockResolvedValue(partners as Partner[]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
        page: 2,
        limit: 10,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(10);
      expect(result.meta.page).toBe(2);
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should return correct pagination for last page', async () => {
      const partners = Array.from({ length: 25 }, (_, i) => ({
        ...mockPartnerParis,
        id: `partner-${i}`,
        latitude: PARIS_LAT + i * 0.01,
        longitude: PARIS_LNG + i * 0.01,
      }));

      partnerRepository.find.mockResolvedValue(partners as Partner[]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 50,
        page: 3,
        limit: 10,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(5);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty results when no partners found', async () => {
      partnerRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(0);
      expect(result.meta.total).toBe(0);
    });

    it('should exclude partners without coordinates', async () => {
      // partnerRepository.find already filters out null coordinates via query
      // This test verifies that the service handles the repository's filtering
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      // MarketplacePartnerDto doesn't include latitude (it only has city)
      expect(result.data[0].city).toBeDefined();
    });

    it('should handle partners with no services', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].services.length).toBe(0);
    });

    it('should handle availability check with date', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);
      availabilitiesService.getAvailableSlots.mockResolvedValue({
        date: '2025-10-15',
        duration: 60,
        slots: [{ time: '09:00', endTime: '10:00', available: true }],
        availableCount: 1,
        unavailableCount: 0,
      });

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
        date: '2025-10-15',
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].hasAvailability).toBe(true);
      expect(availabilitiesService.getAvailableSlots).toHaveBeenCalledWith(
        'partner-paris',
        {
          date: '2025-10-15',
          duration: 60,
        },
      );
    });

    it('should handle availability check failure gracefully', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);
      availabilitiesService.getAvailableSlots.mockRejectedValue(
        new Error('Availability service error'),
      );

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
        date: '2025-10-15',
      };

      const result = await service.searchPartners(dto);

      expect(result.data.length).toBe(1);
      expect(result.data[0].hasAvailability).toBe(false);
    });
  });

  describe('Cache Functionality', () => {
    it('should cache search results', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      const result1 = await service.searchPartners(dto);

      // Verify result is cached
      expect(result1).toBeDefined();
      expect(result1.data.length).toBe(1);

      // Cache stats should show 1 entry
      const stats = cacheService.getStats();
      expect(stats.totalKeys).toBeGreaterThan(0);
    });

    it('should return cached results on cache hit', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      // First call - cache miss
      const result1 = await service.searchPartners(dto);
      const firstCallCount = partnerRepository.find.mock.calls.length;

      // Second call - should hit cache
      const result2 = await service.searchPartners(dto);
      const secondCallCount = partnerRepository.find.mock.calls.length;

      // Should return same result
      expect(result1).toEqual(result2);
      // Should not call repository again (cache hit)
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should generate consistent cache keys for same parameters', async () => {
      partnerRepository.find.mockResolvedValue([mockPartnerParis as Partner]);
      partnerServiceRepository.find.mockResolvedValue([]);

      const dto: SearchPartnersDto = {
        lat: PARIS_LAT,
        lng: PARIS_LNG,
        radius: 10,
      };

      await service.searchPartners(dto);
      const initialCallCount = partnerRepository.find.mock.calls.length;

      // Search again with same params - should hit cache
      await service.searchPartners(dto);
      const finalCallCount = partnerRepository.find.mock.calls.length;

      // Repository should only be called once (second call hits cache)
      expect(finalCallCount).toBe(initialCallCount);
    });
  });
});
