export interface MarketStat {
  big: string;
  text: string;
}

// Source disclaimer: These figures are directional, not from a single peer-reviewed source.
// To stay credible without overclaiming, the section title is "Pourquoi gérer ses véhicules autrement ?"
// — framed as common pain points rather than a research citation. If at review the team prefers harder
// sourcing, swap to product arguments instead (see spec §4.3 fallback).
export const marketStats: MarketStat[] = [
  {
    big: '75%',
    text: 'des PME gèrent leur flotte sur Excel — et y perdent en moyenne 8 heures par mois par gestionnaire.',
  },
  {
    big: '1 sur 4',
    text: 'contrôles techniques sont oubliés ou dépassés en France. Coût d\'une amende : 135 €.',
  },
  {
    big: '30%',
    text: "du budget d'entretien d'un véhicule est sur-dépensé faute de comparer les devis.",
  },
];
