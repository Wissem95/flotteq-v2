import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Trip } from '../../types/trip.types';

const STATUS_LABELS = {
  completed: 'Terminé',
  in_progress: 'En cours',
  cancelled: 'Annulé',
};

const DEFECT_TYPE_LABELS = {
  scratch: 'Rayure',
  dent: 'Bosse',
  broken: 'Cassé',
  dirty: 'Sale',
  missing: 'Manquant',
  other: 'Autre',
};

const SEVERITY_LABELS = {
  minor: 'Mineur',
  moderate: 'Modéré',
  severe: 'Grave',
};

export const exportTripDetailToPDF = (trip: Trip) => {
  const doc = new jsPDF();
  let yPos = 15;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('FlotteQ', 14, yPos);

  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('Détail de Mission', 14, yPos);

  // Infos véhicule
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(
    `${trip.vehicle?.brand || ''} ${trip.vehicle?.model || ''} - ${trip.vehicle?.registration || ''}`,
    14,
    yPos
  );

  // Status
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  const status = STATUS_LABELS[trip.status as keyof typeof STATUS_LABELS] || trip.status;
  doc.text(`Status : ${status}`, 14, yPos);

  // Dates
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('📅 Informations Générales', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  const startDate = new Date(trip.startedAt);
  doc.text(`Conducteur : ${trip.driver?.firstName || ''} ${trip.driver?.lastName || ''}`, 14, yPos);

  yPos += 6;
  doc.text(`Email : ${trip.driver?.email || ''}`, 14, yPos);

  yPos += 6;
  doc.text(
    `Départ : ${format(startDate, 'dd MMMM yyyy à HH:mm', { locale: fr })}`,
    14,
    yPos
  );

  if (trip.endedAt) {
    const endDate = new Date(trip.endedAt);
    yPos += 6;
    doc.text(
      `Retour : ${format(endDate, 'dd MMMM yyyy à HH:mm', { locale: fr })}`,
      14,
      yPos
    );
  }

  // Statistiques
  yPos += 12;
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('📊 Statistiques', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  if (trip.distanceKm !== null) {
    doc.text(`Distance parcourue : ${trip.distanceKm.toLocaleString()} km`, 14, yPos);
    yPos += 6;
  }

  if (trip.durationMinutes !== null) {
    const hours = Math.floor(trip.durationMinutes / 60);
    const minutes = trip.durationMinutes % 60;
    doc.text(`Durée : ${hours}h${minutes.toString().padStart(2, '0')}`, 14, yPos);
    yPos += 6;
  }

  if (trip.endFuelLevel !== null) {
    const fuelDiff = trip.endFuelLevel - trip.startFuelLevel;
    doc.text(
      `Consommation carburant : ${fuelDiff > 0 ? '+' : ''}${fuelDiff}%`,
      14,
      yPos
    );
    yPos += 6;
  }

  // Comparaison Départ/Retour
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('🔄 Comparaison Départ/Retour', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);

  // Départ
  doc.text('Départ :', 14, yPos);
  yPos += 6;
  doc.text(`  Kilométrage : ${trip.startKm.toLocaleString()} km`, 14, yPos);
  yPos += 6;
  doc.text(`  Niveau carburant : ${trip.startFuelLevel}%`, 14, yPos);

  // Retour
  if (trip.endKm !== null) {
    yPos += 8;
    doc.text('Retour :', 14, yPos);
    yPos += 6;
    doc.text(`  Kilométrage : ${trip.endKm.toLocaleString()} km`, 14, yPos);
    yPos += 6;
    doc.text(`  Niveau carburant : ${trip.endFuelLevel}%`, 14, yPos);
  }

  // Défauts départ
  if (trip.startDefects && trip.startDefects.length > 0) {
    yPos += 12;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`⚠️  Défauts constatés au départ (${trip.startDefects.length})`, 14, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);

    trip.startDefects.forEach((defect) => {
      const type = DEFECT_TYPE_LABELS[defect.type as keyof typeof DEFECT_TYPE_LABELS] || defect.type;
      const severity = SEVERITY_LABELS[defect.severity as keyof typeof SEVERITY_LABELS] || defect.severity;

      doc.text(`• ${type} (${severity}) - ${defect.location}`, 18, yPos);
      yPos += 5;
      doc.text(`  ${defect.description}`, 18, yPos);
      yPos += 8;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Nouveaux défauts retour
  if (trip.endDefects && trip.endDefects.length > 0) {
    const newDefects = trip.endDefects.filter(
      (ed) => !trip.startDefects?.some((sd) => sd.id === ed.id)
    );

    if (newDefects.length > 0) {
      yPos += 8;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`🔴 Nouveaux défauts au retour (${newDefects.length})`, 14, yPos);

      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);

      newDefects.forEach((defect) => {
        const type = DEFECT_TYPE_LABELS[defect.type as keyof typeof DEFECT_TYPE_LABELS] || defect.type;
        const severity = SEVERITY_LABELS[defect.severity as keyof typeof SEVERITY_LABELS] || defect.severity;

        doc.text(`• ${type} (${severity}) - ${defect.location}`, 18, yPos);
        yPos += 5;
        doc.text(`  ${defect.description}`, 18, yPos);
        yPos += 8;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
  }

  // Notes
  if (trip.startNotes || trip.endNotes) {
    yPos += 8;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('📝 Notes', 14, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);

    if (trip.startNotes) {
      doc.text('Départ :', 14, yPos);
      yPos += 5;
      const lines = doc.splitTextToSize(trip.startNotes, 180);
      doc.text(lines, 18, yPos);
      yPos += lines.length * 5 + 4;
    }

    if (trip.endNotes) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text('Retour :', 14, yPos);
      yPos += 5;
      const lines = doc.splitTextToSize(trip.endNotes, 180);
      doc.text(lines, 18, yPos);
      yPos += lines.length * 5;
    }
  }

  // GPS Coordinates
  if (trip.startLocation || trip.endLocation) {
    yPos += 12;
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text('📍 Coordonnées GPS', 14, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);

    if (trip.startLocation) {
      doc.text(
        `Départ : ${trip.startLocation.lat.toFixed(6)}, ${trip.startLocation.lng.toFixed(6)}`,
        14,
        yPos
      );
      yPos += 6;
    }

    if (trip.endLocation) {
      doc.text(
        `Retour : ${trip.endLocation.lat.toFixed(6)}, ${trip.endLocation.lng.toFixed(6)}`,
        14,
        yPos
      );
      yPos += 6;
    }
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    doc.text(
      `🤖 Généré avec FlotteQ - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );

    doc.text(`ID: ${trip.id}`, 14, doc.internal.pageSize.getHeight() - 10);
  }

  // Télécharger
  const fileName = `FlotteQ_Mission_${trip.vehicle?.registration || 'NA'}_${format(
    startDate,
    'yyyy-MM-dd'
  )}.pdf`;
  doc.save(fileName);
};
