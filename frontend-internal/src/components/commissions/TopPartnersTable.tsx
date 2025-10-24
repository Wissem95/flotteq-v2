import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import type { TopPartner } from '@/api/types/commission.types';

interface TopPartnersTableProps {
  partners: TopPartner[];
}

export const TopPartnersTable = ({ partners }: TopPartnersTableProps) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Top 10 Partenaires
        </CardTitle>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun partenaire pour le moment
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rang</TableHead>
                <TableHead>Partenaire</TableHead>
                <TableHead className="text-right">CA généré</TableHead>
                <TableHead className="text-right">Commissions</TableHead>
                <TableHead className="text-right">Réservations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => (
                <TableRow key={partner.partnerId}>
                  <TableCell className="font-bold text-lg">
                    {getRankIcon(partner.rank)}
                  </TableCell>
                  <TableCell className="font-medium">{partner.partnerName}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    €{Number(partner.revenue).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-blue-600">
                    €{Number(partner.commissions).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {partner.bookingsCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
