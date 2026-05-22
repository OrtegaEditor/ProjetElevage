import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "../../components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { Button } from "../../components/common/button";
import { mockFlocks, mockTreatments, mockDiseases } from "../../data/mockData";

import { Stethoscope, AlertTriangle, Pill, Activity, Plus, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TreatmentForm } from "@/components/forms/TreatmentForm";
import { HealthRegisterPage } from "../HealthRegisterPage";

export function VeterinarianDashboard() {
const navigate = useNavigate();

// ─── États (States) ───────────────────────────────────────────────────
const [treatmentModal, setTreatmentModal] = useState({
open: false,
selectedFlockId: null as string | null,
});

// ─── Calculs dynamiques basés sur les Mocks existants ─────────────────

// Taux de mortalité moyen sur l'ensemble des lots
const avgMortality =
mockFlocks.reduce((sum, flock) => sum + flock.mortality, 0) / mockFlocks.length;

// Filtrage des traitements actuellement actifs
const activeTreatments = mockTreatments.filter(
(t) => new Date(t.endDate) >= new Date()
);

// Construction dynamique des lots à risque (ceux sous traitement actif)
const atRiskLots = mockFlocks
.filter((flock) => activeTreatments.some((t) => t.flockId === flock.id))
.map((flock) => {
    const treatment = activeTreatments.find((t) => t.flockId === flock.id);
    const diseaseName = mockDiseases.find((d) => d.id === treatment?.diseaseId)?.name ?? "Inconnue";
    return {
    id: flock.id,
    name: flock.name,
    animals: flock.quantity, // Exploite la quantité réelle de votre type Flock
    risk: `Sous traitement actif : ${diseaseName}`,
    severity: flock.mortality > 3 ? ("critical" as const) : ("warning" as const),
    };
});

// Génération des données du graphique : Croisement Maladies / Cas / Décès cumulés
// ─── CODE CORRIGÉ DANS VETERINARIANDASHBOARD.TSX ───
const healthData = mockDiseases.map((disease) => {
  const treatmentsForDisease = mockTreatments.filter((t) => t.diseaseId === disease.id);
  
  const casCount = treatmentsForDisease.length;
  
//On additionne directement le nombre brut de morts sans calcul de pourcentage
  const totalMorts = treatmentsForDisease.reduce((sum, t) => {
    const flock = mockFlocks.find((f) => f.id === t.flockId);
    if (flock) {
      return sum + flock.mortality; // On ajoute directement le nombre (ex: +150)
    }
    return sum;
  }, 0);

  return {
    name: disease.name,
    cas: casCount,
    morts: totalMorts,
  };
});

// ─── Gestionnaires d'ouverture du formulaire ────────────────────────
const handleOpenNewTreatment = (flockId?: string) => {
setTreatmentModal({
    open: true,
    selectedFlockId: flockId || null,
});
};

return (
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Tableau de bord Vétérinaire
        </h1>
        <p className="text-gray-600">Suivi sanitaire de l'exploitation</p>
    </div>
    <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/health-registry")}>
        <FileText className="w-4 h-4 mr-2" />
        Registre sanitaire
        </Button>
        <Button onClick={() => handleOpenNewTreatment()}>
        <Plus className="w-4 h-4 mr-2" />
        Nouveau traitement
        </Button>
    </div>
    </div>

    {/* Cartes KPI */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <KPICard
        title="Lots à risque"
        value={atRiskLots.length}
        icon={<AlertTriangle className="w-6 h-6" />}
        variant="danger"
    />
    <KPICard
        title="Traitements actifs"
        value={activeTreatments.length}
        icon={<Pill className="w-6 h-6" />}
        variant="warning"
    />
    <KPICard
        title="Mortalité moyenne"
        value={`${avgMortality.toFixed(1)}%`}
        icon={<Activity className="w-6 h-6" />}
        variant="info"
        trend={{ value: -8.5, label: "vs mois dernier" }}
    />
    <KPICard
        title="Consultations ce mois"
        value="12"
        icon={<Stethoscope className="w-6 h-6" />}
        variant="success"
    />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Graphique des cas sanitaires */}
    <Card>
        <CardHeader>
        <CardTitle>Bilan Sanitaire : Cas vs Pertes par Pathologie</CardTitle>
        </CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#666" className="text-xs" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Legend />
            <Bar dataKey="cas" fill="#1E88E5" name="Nombre de cas" />
            <Bar dataKey="morts" fill="#E53935" name="Décès cumulés (animaux)" />
            </BarChart>
        </ResponsiveContainer>
        </CardContent>
    </Card>

    {/* Liste des lots à risque */}
    <Card>
        <CardHeader>
        <CardTitle>Lots à risque</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-4">
            {atRiskLots.map((lot) => (
            <div
                key={lot.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
                <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="font-medium text-gray-900">{lot.name}</h4>
                    <p className="text-sm text-gray-600">{lot.animals} animaux</p>
                </div>
                <Badge variant={lot.severity === "critical" ? "danger" : "warning"}>
                    {lot.severity === "critical" ? "Critique" : "Surveillance"}
                </Badge>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-900">{lot.risk}</p>
                </div>
                <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" onClick={() => navigate(`/flocks/${lot.id}`)}>
                    Consulter
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenNewTreatment(lot.id)}>
                    Prescrire
                </Button>
                </div>
            </div>
            ))}
            {atRiskLots.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-6">
                Aucun lot à risque à surveiller actuellement.
            </p>
            )}
        </div>
        </CardContent>
    </Card>
    </div>

    {/* Traitements en cours */}
    <Card>
    <CardHeader>
        <CardTitle>Traitements en cours</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="space-y-3">
        {mockTreatments.map((treatment) => (
            <div
            key={treatment.id}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
            <div className="p-2 bg-blue-50 rounded-lg">
                <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="font-medium text-gray-900">
                    {mockDiseases.find((d) => d.id === treatment.diseaseId)?.name ?? "-"}
                    </h4>
                    <p className="text-sm text-gray-600">
                    Lot: {mockFlocks.find((l) => l.id === treatment.flockId)?.name}
                    </p>
                </div>
                <Badge variant="info">En cours</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-500">Médicament</p>
                    <p className="font-medium text-gray-900">{treatment.medication}</p>
                </div>
                <div>
                    <p className="text-gray-500">Posologie</p>
                    <p className="font-medium text-gray-900">{treatment.dosage}</p>
                </div>
                <div>
                    <p className="text-gray-500">Début</p>
                    <p className="font-medium text-gray-900">
                    {new Date(treatment.startDate).toLocaleDateString("fr-FR")}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500">Fin prévue</p>
                    <p className="font-medium text-gray-900">
                    {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                    </p>
                </div>
                </div>
                {treatment.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{treatment.notes}</p>
                </div>
                )}
            </div>
            </div> //Fermeture de l'alignement flex-1
        ))}
        </div>
    </CardContent>
    </Card>

    {/* Formulaire de traitement Pop-up connecté et formaté proprement */}
    <TreatmentForm
    open={treatmentModal.open}
    selectedFlockId={treatmentModal.selectedFlockId}
    onClose={() => setTreatmentModal({ open: false, selectedFlockId: null })}
    onSubmit={(newTreatmentData) => {
        console.log("Traitement médical à enregistrer :", newTreatmentData);
        // TODO : Relier à votre état local ou passer votre appel API ici
    }}
    />
</div> // Fermeture du div conteneur principal space-y-6
);
} // Fermeture de la fonction de composant VeterinarianDashboard
