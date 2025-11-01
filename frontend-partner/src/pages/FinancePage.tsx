import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatsCard from '../components/dashboard/StatsCard';
import { Pagination } from '../components/common/Pagination';
import {
  useDailyRevenue,
  useWeeklyRevenue,
  useMonthlyRevenue as useMonthlyRevenueStats,
  useMonthlyRevenueChart,
  useRevenueByPeriod
} from '../hooks/useRevenueStats';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export default function FinancePage() {
  const user = useAuthStore((state) => state.user);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'paid' | 'cancelled',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    page: 1,
    limit: 20,
  });

  // Fetch revenue data (revenus partenaire, pas commissions)
  const dailyStats = useDailyRevenue();
  const weeklyStats = useWeeklyRevenue();
  const monthlyStats = useMonthlyRevenueStats();
  const monthlyRevenue = useMonthlyRevenueChart();

  const { data, isLoading, error } = useRevenueByPeriod(
    filters.startDate,
    filters.endDate
  );

  const bookings = data?.data || [];
  const total = data?.total || 0;
  const totalPages = 1; // Pagination côté frontend si nécessaire

  // Filtrer par status si nécessaire
  const filteredBookings = filters.status === 'all'
    ? bookings
    : bookings.filter((b: any) => {
        if (filters.status === 'paid') return b.paymentStatus === 'paid' || b.status === 'completed';
        if (filters.status === 'pending') return b.status === 'confirmed' && b.paymentStatus !== 'paid';
        if (filters.status === 'cancelled') return b.status === 'cancelled';
        return true;
      });

  const paginatedBookings = filteredBookings;

  // Calculate KPIs (Revenus partenaire)
  const dailyTotal = dailyStats.data?.find(s => s.status === 'paid')?.total || 0;
  const weeklyTotal = weeklyStats.data?.find(s => s.status === 'paid')?.total || 0;
  const monthlyTotal = monthlyStats.data?.find(s => s.status === 'paid')?.total || 0;
  const pendingTotal = monthlyStats.data?.find(s => s.status === 'pending')?.total || 0;

  // Export PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // En-tête
      doc.setFontSize(16);
      doc.text(`Revenus - ${user?.partner?.companyName || 'Partenaire'}`, 14, 20);
      doc.setFontSize(10);
      doc.text(
        `Période: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} - ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`,
        14, 30
      );

      // Table data - Revenus partenaire
      const tableData = paginatedBookings.map((b: any) => [
        format(new Date(b.scheduledDate), 'dd/MM/yyyy'),
        b.id.slice(0, 8),
        b.tenant?.name || 'N/A',
        `${Number(b.partnerRevenue).toFixed(2)}€`,
        b.paymentStatus === 'paid' || b.status === 'completed' ? 'Payée' :
        b.status === 'confirmed' ? 'En attente' : 'Annulée'
      ]);

      const totalAmount = paginatedBookings.reduce((s: number, b: any) => s + Number(b.partnerRevenue), 0);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Réservation', 'Client', 'Revenu Partenaire', 'Status']],
        body: tableData,
        foot: [['', '', 'TOTAL', `${totalAmount.toFixed(2)}€`, '']],
        footStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      });

      doc.save(`revenus_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success(`${paginatedBookings.length} réservations exportées`);
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || paginatedBookings.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-flotteq-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Export...' : 'Exporter PDF'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="CA Aujourd'hui"
          value={`${Number(dailyTotal).toFixed(2)}€`}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />
        <StatsCard
          title="CA Semaine"
          value={`${Number(weeklyTotal).toFixed(2)}€`}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatsCard
          title="CA Mois"
          value={`${Number(monthlyTotal).toFixed(2)}€`}
          icon={CheckCircle}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
        <StatsCard
          title="En Attente"
          value={`${Number(pendingTotal).toFixed(2)}€`}
          icon={Clock}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Évolution Mensuelle (12 mois)</h2>
        {monthlyRevenue.isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flotteq-blue" />
          </div>
        ) : monthlyRevenue.data && monthlyRevenue.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(v) => `${v}€`}
              />
              <Tooltip
                formatter={(v: number) => [`${v.toFixed(2)}€`, 'Revenus']}
                labelStyle={{ color: '#111827' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar
                dataKey="amount"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">Aucun revenu pour le moment</p>
            <p className="text-gray-500 text-sm">Complétez vos premières réservations pour voir vos statistiques ici</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-flotteq-blue"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flotteq-blue" />
            <p className="mt-2 text-gray-500">Chargement...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Erreur lors du chargement des revenus
          </div>
        ) : paginatedBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune réservation trouvée
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenu Partenaire</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(new Date(b.scheduledDate), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-xs text-gray-600">
                        {b.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {b.tenantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {Number(b.partnerRevenue).toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.paymentStatus === 'paid' || b.status === 'completed' ? 'bg-green-100 text-green-800' :
                          b.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.paymentStatus === 'paid' || b.status === 'completed' ? 'Payée' :
                           b.status === 'confirmed' ? 'En attente' : 'Annulée'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {b.paidAt ? format(new Date(b.paidAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {paginatedBookings.map((b: any) => (
                <div key={b.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(b.scheduledDate), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.paymentStatus === 'paid' || b.status === 'completed' ? 'bg-green-100 text-green-800' :
                      b.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {b.paymentStatus === 'paid' || b.status === 'completed' ? 'Payée' :
                       b.status === 'confirmed' ? 'En attente' : 'Annulée'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {b.tenant?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Réservation: {b.id.slice(0, 8)}
                  </div>
                  <div className="text-lg font-bold text-flotteq-blue">
                    {Number(b.partnerRevenue).toFixed(2)}€
                  </div>
                  {b.paidAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Payé le {format(new Date(b.paidAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
                hasNextPage={filters.page < totalPages}
                hasPreviousPage={filters.page > 1}
                total={total}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
