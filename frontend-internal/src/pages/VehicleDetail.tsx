// 📁 src/pages/VehicleDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Car,
  Clock,
  FileText,
  PlusCircle,
  Upload,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { fetchVehicleById, Vehicle } from "@/services/vehicleService";
import { CtModal } from "@/components/vehicles/CtModal";

const getStatusBadge = (status?: string | null) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-700">En service</Badge>;
    case "maintenance":
      return (
        <Badge className="bg-amber-100 text-amber-700">En maintenance</Badge>
      );
    case "inactive":
      return <Badge className="bg-red-100 text-red-700">Hors service</Badge>;
    case "warning":
      return <Badge className="bg-orange-100 text-orange-700">Attention</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

const formatDate = (ds?: string | null) => {
  if (!ds) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ds));
};

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [ctModalOpen, setCtModalOpen] = useState(false);

  // Chargement du véhicule
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVehicleById(id)
      .then((v) => setVehicle(v))
      .catch((err) => console.error("Erreur chargement véhicule :", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Chargement…</div>;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
        <Button asChild>
          <Link to="/vehicles">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* En-tête et actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link to="/vehicles">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {vehicle.marque} / {vehicle.modele} ({vehicle.plaque})
          </h1>
          <div className="ml-3">{getStatusBadge(vehicle.status)}</div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setCtModalOpen(true)}>
            <Wrench size={16} className="mr-2" />
            Entretien
          </Button>
          <Button variant="outline">
            <Upload size={16} className="mr-2" />
            Documents
          </Button>
          <Button className="bg-flotteq-blue hover:bg-flotteq-navy">
            <PlusCircle size={16} className="mr-2" />
            Ajouter un rappel
          </Button>
        </div>
      </div>

      <Separator />

      {/* Onglets */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Vue d’ensemble</TabsTrigger>
          <TabsTrigger value="maintenance">Entretiens</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reminders">Rappels</TabsTrigger>
        </TabsList>

        {/* Vue d’ensemble */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Résumé du véhicule</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4 text-sm">
              <span className="text-slate-500">Marque / Modèle</span>
              <span>{vehicle.marque} / {vehicle.modele}</span>
              <span className="text-slate-500">Année</span>
              <span>{vehicle.annee ?? "-"}</span>
              <span className="text-slate-500">Immatriculation</span>
              <span>{vehicle.plaque}</span>
              <span className="text-slate-500">Carburant</span>
              <span>{vehicle.carburant ?? "-"}</span>
              <span className="text-slate-500">Kilométrage</span>
              <span>
                {vehicle.kilometrage != null
                  ? vehicle.kilometrage.toLocaleString("fr-FR") + " km"
                  : "-"}
              </span>
              <span className="text-slate-500">Prochain CT</span>
              <span>{formatDate(vehicle.nextCT)}</span>
              <span className="text-slate-500">Dernier CT</span>
              <span>{formatDate(vehicle.lastCT)}</span>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Entretien (placeholder) */}
        <TabsContent value="maintenance">
          <p className="text-slate-600">Gestion des entretiens…</p>
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents">
          <p className="text-slate-600">Documents associés…</p>
        </TabsContent>

        {/* Onglet Rappels */}
        <TabsContent value="reminders">
          <p className="text-slate-600">Vos rappels…</p>
        </TabsContent>
      </Tabs>

      {/* Modal Contrôle Technique */}
      <CtModal
        isOpen={ctModalOpen}
        onClose={() => setCtModalOpen(false)}
        vehicleId={vehicle.id}
        currentLastCT={vehicle.lastCT}
        currentNextCT={vehicle.nextCT}
        onUpdated={() =>
          fetchVehicleById(String(vehicle.id)).then((v) => setVehicle(v))
        }
      />
    </div>
  );
};

export default VehicleDetail;

