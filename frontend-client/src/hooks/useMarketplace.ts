import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '@/api/services/marketplace.service';
import type { SearchPartnersParams } from '@/types/marketplace.types';

export function useSearchPartners(params: SearchPartnersParams, enabled = true) {
  return useQuery({
    queryKey: ['partners', 'search', params],
    queryFn: () => marketplaceService.searchPartners(params),
    enabled,
  });
}

export function usePartnerDetails(partnerId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['partners', partnerId],
    queryFn: () => marketplaceService.getPartnerDetails(partnerId!),
    enabled: enabled && !!partnerId,
  });
}

export function usePartnerServices(partnerId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['partners', partnerId, 'services'],
    queryFn: () => marketplaceService.getPartnerServices(partnerId!),
    enabled: enabled && !!partnerId,
  });
}

export function useAvailableSlots(
  partnerId: string | undefined,
  serviceId: string | undefined,
  date: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ['availabilities', partnerId, serviceId, date],
    queryFn: () =>
      marketplaceService.getAvailableSlots(partnerId!, serviceId!, date!),
    enabled: enabled && !!partnerId && !!serviceId && !!date,
  });
}
