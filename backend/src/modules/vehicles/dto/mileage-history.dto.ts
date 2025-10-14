export class MileageHistoryItemDto {
  date: Date;
  mileage: number;
  source: 'maintenance' | 'creation' | 'current';
  change: number;
  description?: string;
}
