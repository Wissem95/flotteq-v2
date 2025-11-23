import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Trip } from '../../types/trip.types';

interface ExportTripsParams {
  trips: Trip[];
  totalKm: number;
  totalTrips: number;
  totalHours: number;
  filters?: {
    startDate?: Date | null;
    endDate?: Date | null;
    status?: string;
    search?: string;
  };
}

const STATUS_LABELS = {
  completed: 'Terminé',
  in_progress: 'En cours',
  cancelled: 'Annulé',
};

export const exportTripsToPDF = ({
  trips,
  totalKm,
  totalTrips,
  totalHours,
  filters,
}: ExportTripsParams) => {
  const doc = new jsPDF('landscape');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text('FlotteQ', 14, 15);

  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39); // Gray-900
  doc.text('Historique des Trajets', 14, 25);

  // Date de génération
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(
    `Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`,
    14,
    32
  );

  // Filtres appliqués
  if (filters) {
    let yPos = 38;
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99); // Gray-600
    doc.text('Filtres appliqués :', 14, yPos);

    if (filters.startDate && filters.endDate) {
      yPos += 5;
      doc.text(
        `Période : ${format(filters.startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(
          filters.endDate,
          'dd/MM/yyyy',
          { locale: fr }
        )}`,
        14,
        yPos
      );
    }

    if (filters.status && filters.status !== 'all') {
      yPos += 5;
      doc.text(`Status : ${STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS]}`, 14, yPos);
    }

    if (filters.search) {
      yPos += 5;
      doc.text(`Recherche : "${filters.search}"`, 14, yPos);
    }
  }

  // Stats globales
  const statsY = 50;
  doc.setFillColor(243, 244, 246); // Gray-100
  doc.roundedRect(14, statsY, 80, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text('Total missions', 18, statsY + 8);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(totalTrips.toString(), 18, statsY + 18);

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(99, statsY, 80, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Distance totale', 103, statsY + 8);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(`${totalKm.toLocaleString()} km`, 103, statsY + 18);

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(184, statsY, 80, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Temps total', 188, statsY + 8);
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(`${totalHours}h`, 188, statsY + 18);

  // Table des trajets
  autoTable(doc, {
    startY: statsY + 30,
    head: [['Date', 'Conducteur', 'Véhicule', 'Distance', 'Durée', 'Status', 'Défauts']],
    body: trips.map((trip) => {
      const startDate = new Date(trip.startedAt);
      const driverName = `${trip.driver?.firstName || ''} ${trip.driver?.lastName || ''}`.trim();
      const vehicleName = `${trip.vehicle?.registration || ''}\n${trip.vehicle?.brand || ''} ${
        trip.vehicle?.model || ''
      }`.trim();
      const distance = trip.distanceKm ? `${trip.distanceKm.toLocaleString()} km` : '-';
      const duration = trip.durationMinutes
        ? `${Math.floor(trip.durationMinutes / 60)}h${(trip.durationMinutes % 60)
            .toString()
            .padStart(2, '0')}`
        : '-';
      const status = STATUS_LABELS[trip.status as keyof typeof STATUS_LABELS] || trip.status;
      const defects = (trip.startDefects?.length || 0) + (trip.endDefects?.length || 0);

      return [
        format(startDate, 'dd/MM/yyyy HH:mm', { locale: fr }),
        driverName,
        vehicleName,
        distance,
        duration,
        status,
        defects > 0 ? `⚠️ ${defects}` : '-',
      ];
    }),
    headStyles: {
      fillColor: [37, 99, 235], // Blue-600
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray-50
    },
    columnStyles: {
      0: { cellWidth: 35 }, // Date
      1: { cellWidth: 45 }, // Conducteur
      2: { cellWidth: 50 }, // Véhicule
      3: { cellWidth: 30 }, // Distance
      4: { cellWidth: 25 }, // Durée
      5: { cellWidth: 30 }, // Status
      6: { cellWidth: 25 }, // Défauts
    },
    margin: { left: 14, right: 14 },
    didDrawPage: function () {
      // Footer sur chaque page
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Page ${currentPage} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      doc.text(
        '🤖 Généré avec FlotteQ',
        doc.internal.pageSize.getWidth() - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    },
  });

  // Télécharger le PDF
  const fileName = `FlotteQ_Trajets_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};
