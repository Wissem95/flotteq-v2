import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Maintenance, MaintenanceType, MaintenanceStatus } from '../types/maintenance.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const exportMaintenancesToPDF = (maintenances: Maintenance[], month?: Date) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Planning des Maintenances', 14, 20);

  if (month) {
    doc.setFontSize(12);
    doc.text(format(month, 'MMMM yyyy', { locale: fr }), 14, 30);
  }

  // Date d'export
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exporté le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 40);

  // Vérification: aucune maintenance
  if (maintenances.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Aucune maintenance trouvée pour cette période', 14, 60);

    const filename = month
      ? `maintenances-${format(month, 'yyyy-MM')}.pdf`
      : `maintenances-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
    return;
  }

  const getTypeLabel = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.PREVENTIVE: return 'Préventive';
      case MaintenanceType.CORRECTIVE: return 'Corrective';
      case MaintenanceType.INSPECTION: return 'Contrôle';
      case MaintenanceType.TIRE_CHANGE: return 'Pneus';
      case MaintenanceType.OIL_CHANGE: return 'Vidange';
    }
  };

  const getStatusLabel = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.SCHEDULED: return 'Planifiée';
      case MaintenanceStatus.IN_PROGRESS: return 'En cours';
      case MaintenanceStatus.COMPLETED: return 'Terminée';
      case MaintenanceStatus.CANCELLED: return 'Annulée';
    }
  };

  // Préparer les données
  const tableData = maintenances.map(m => [
    format(new Date(m.scheduledDate), 'dd/MM/yyyy'),
    m.vehicle?.registration || m.vehicleId.substring(0, 8),
    getTypeLabel(m.type),
    m.description.length > 40 ? m.description.substring(0, 37) + '...' : m.description,
    `${m.estimatedCost.toFixed(2)} €`,
    m.actualCost ? `${m.actualCost.toFixed(2)} €` : '-',
    getStatusLabel(m.status),
  ]);

  // Table
  autoTable(doc, {
    head: [['Date', 'Véhicule', 'Type', 'Description', 'Coût estimé', 'Coût réel', 'Statut']],
    body: tableData,
    startY: 50,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 45 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
    },
  });

  // Statistiques
  const finalY = (doc as any).lastAutoTable.finalY || 50;

  const totalEstimated = maintenances.reduce((sum, m) => sum + m.estimatedCost, 0);
  const totalActual = maintenances.reduce((sum, m) => sum + (m.actualCost || 0), 0);
  const completedCount = maintenances.filter(m => m.status === MaintenanceStatus.COMPLETED).length;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Statistiques', 14, finalY + 15);

  doc.setFontSize(9);
  doc.text(`Total maintenances: ${maintenances.length}`, 14, finalY + 23);
  doc.text(`Terminées: ${completedCount}`, 14, finalY + 30);
  doc.text(`Coût total estimé: ${totalEstimated.toFixed(2)} €`, 14, finalY + 37);
  doc.text(`Coût total réel: ${totalActual.toFixed(2)} €`, 14, finalY + 44);

  if (totalActual > 0) {
    const difference = totalActual - totalEstimated;
    const color = difference > 0 ? [231, 76, 60] : [46, 204, 113];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(
      `Différence: ${difference > 0 ? '+' : ''}${difference.toFixed(2)} €`,
      14,
      finalY + 51
    );
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} sur ${pageCount} - FlotteQ`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Sauvegarder
  const filename = month
    ? `maintenances-${format(month, 'yyyy-MM')}.pdf`
    : `maintenances-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

  doc.save(filename);
};

export const exportMonthlyCalendarPDF = (maintenances: Maintenance[], month: Date) => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFontSize(22);
  doc.text('Calendrier des Maintenances', 14, 20);

  doc.setFontSize(14);
  doc.text(format(month, 'MMMM yyyy', { locale: fr }).toUpperCase(), 14, 30);

  // Date d'export
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Exporté le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 38);

  // Vérification: aucune maintenance
  if (maintenances.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Aucune maintenance trouvée pour ce mois', 14, 50);
    doc.save(`calendrier-${format(month, 'yyyy-MM')}.pdf`);
    return;
  }

  // Grouper par date
  const maintenancesByDate = new Map<string, Maintenance[]>();
  maintenances.forEach(m => {
    const dateKey = format(new Date(m.scheduledDate), 'yyyy-MM-dd');
    if (!maintenancesByDate.has(dateKey)) {
      maintenancesByDate.set(dateKey, []);
    }
    maintenancesByDate.get(dateKey)!.push(m);
  });

  // Créer les données du calendrier
  const sortedDates = Array.from(maintenancesByDate.keys()).sort();
  const calendarData = sortedDates.map(dateKey => {
    const date = new Date(dateKey);
    const dayMaintenances = maintenancesByDate.get(dateKey)!;

    return [
      format(date, 'EEEE dd', { locale: fr }),
      dayMaintenances.length.toString(),
      dayMaintenances.map(m => {
        const vehicle = m.vehicle?.registration || m.vehicleId.substring(0, 8);
        const type = m.type.substring(0, 10);
        return `${vehicle} - ${type}`;
      }).join('\n'),
      dayMaintenances.reduce((sum, m) => sum + m.estimatedCost, 0).toFixed(2) + ' €',
    ];
  });

  autoTable(doc, {
    head: [['Date', 'Nb', 'Maintenances', 'Coût estimé']],
    body: calendarData,
    startY: 45,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 160 },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'FlotteQ - Gestion de Flotte',
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );

  doc.save(`calendrier-${format(month, 'yyyy-MM')}.pdf`);
};
