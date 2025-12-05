import { useState } from 'react';
import { ShoppingBag, List, Map } from 'lucide-react';
import SearchFilters from '@/components/marketplace/SearchFilters';
import PartnerCard from '@/components/marketplace/PartnerCard';
import PartnersMap from '@/components/marketplace/PartnersMap';
import { useSearchPartners } from '@/hooks/useMarketplace';
import type { SearchPartnersParams } from '@/types/marketplace.types';

type ViewMode = 'list' | 'map';

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useState<SearchPartnersParams | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data, isLoading, error } = useSearchPartners(searchParams!, searchParams !== null);

  const handleSearch = (params: SearchPartnersParams) => {
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-6 sm:h-7 w-6 sm:w-7 text-flotteq-blue" />
            Marketplace Partenaires
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Trouvez et réservez des services près de chez vous
          </p>
        </div>

        {/* Toggle Vue Liste/Carte */}
        {data && data.data.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-2 bg-white border border-gray-200 rounded-lg p-1 self-center sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-flotteq-blue text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">Liste</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-flotteq-blue text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="h-4 sm:h-5 w-4 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">Carte</span>
            </button>
          </div>
        )}
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

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.data.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>

              {/* Pagination (simple) */}
              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSearchParams({ ...searchParams!, page: (searchParams!.page || 1) - 1 })}
                    disabled={!data.meta.hasPreviousPage}
                    className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Précédent
                  </button>
                  <span className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm sm:text-base">
                    Page {data.meta.page} / {data.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setSearchParams({ ...searchParams!, page: (searchParams!.page || 1) + 1 })}
                    disabled={!data.meta.hasNextPage}
                    className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}

          {/* Vue Carte */}
          {viewMode === 'map' && searchParams && (
            <PartnersMap
              partners={data.data}
              center={[searchParams.latitude, searchParams.longitude]}
              zoom={12}
            />
          )}
        </div>
      )}
    </div>
  );
}
