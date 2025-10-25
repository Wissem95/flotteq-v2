import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import SearchFilters from '@/components/marketplace/SearchFilters';
import PartnerCard from '@/components/marketplace/PartnerCard';
import { useSearchPartners } from '@/hooks/useMarketplace';
import type { SearchPartnersParams } from '@/types/marketplace.types';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useState<SearchPartnersParams | null>(null);

  const { data, isLoading, error } = useSearchPartners(searchParams!, searchParams !== null);

  const handleSearch = (params: SearchPartnersParams) => {
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-flotteq-blue" />
            Marketplace Partenaires
          </h1>
          <p className="text-gray-600 mt-1">
            Trouvez et réservez des services près de chez vous
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <SearchFilters onSearch={handleSearch} isLoading={isLoading} />

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Erreur lors de la recherche : {(error as any).response?.data?.message || 'Erreur inconnue'}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue mx-auto"></div>
          <p className="text-gray-600 mt-4">Recherche en cours...</p>
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun partenaire trouvé</h3>
          <p className="text-gray-600">
            Essayez d'élargir votre rayon de recherche ou de modifier vos filtres
          </p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {data.meta.total} partenaire(s) trouvé(s)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>

          {/* Pagination (simple) */}
          {data.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setSearchParams({ ...searchParams!, page: (searchParams!.page || 1) - 1 })}
                disabled={!data.meta.hasPreviousPage}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                Page {data.meta.page} / {data.meta.totalPages}
              </span>
              <button
                onClick={() => setSearchParams({ ...searchParams!, page: (searchParams!.page || 1) + 1 })}
                disabled={!data.meta.hasNextPage}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
