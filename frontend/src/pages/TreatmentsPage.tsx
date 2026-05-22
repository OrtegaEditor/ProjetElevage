import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Plus, Pill, FileText } from "lucide-react";
import { mockFlocks, mockTreatments, mockDiseases } from "../data/mockData";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Ajouté pour la navigation
import { TreatmentForm } from "../components/forms/TreatmentForm";

export function TreatmentsPage() {
    const navigate = useNavigate(); // Hook de navigation branché
    const [isNewTreatmentOpen, setIsNewTreatmentOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Calculs de traitement calqués sur la date du jour
    const activeTreatments = mockTreatments.filter((t) => new Date(t.endDate) >= new Date());
    const completedTreatments = mockTreatments.filter((t) => new Date(t.endDate) < new Date());

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Soins & Traitements
    </h1>
    <p className="text-gray-600">
    Gestion des traitements vétérinaires et prescriptions
    </p>
</div>
<div className="flex gap-3">
    {/* CONNEXION : Redirection vers la page du registre sanitaire */}
    <Button variant="outline" onClick={() => navigate("/health-registry")}>
    <FileText className="w-4 h-4 mr-2" />
    Registre sanitaire
    </Button>
    <Button onClick={() => setIsNewTreatmentOpen(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Nouveau traitement
    </Button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Traitements actifs
        </p>
        <p className="text-2xl font-semibold text-blue-600">
            {activeTreatments.length}
        </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
        <Pill className="w-6 h-6 text-blue-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        Terminés ce mois
        </p>
        <p className="text-2xl font-semibold text-green-600">
        {completedTreatments.length}
        </p>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        Total traitements
        </p>
        <p className="text-2xl font-semibold text-gray-900">
        {mockTreatments.length}
        </p>
    </div>
    </CardContent>
</Card>
</div>

<Card>
<CardHeader>
    <CardTitle>Traitements en cours</CardTitle>
</CardHeader>
<CardContent>
    <div className="space-y-4">
    {activeTreatments.length > 0 ? (
        activeTreatments.map((treatment) => {
        const lot = mockFlocks.find((l) => l.id === treatment.flockId);
        const diseaseName = mockDiseases.find((d) => d.id === treatment.diseaseId)?.name ?? treatment.diseaseId;
        const daysRemaining = Math.ceil(
            (new Date(treatment.endDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return (
            <div
            key={treatment.id}
            className="p-5 border-2 border-blue-200 bg-blue-50 rounded-lg"
            >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {diseaseName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Lot: {lot?.name}</span>
                    <span>•</span>
                    <span>{lot?.quantity} animaux</span>
                </div>
                </div>
                <Badge variant="info">En cours</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                <p className="text-xs text-gray-500 mb-1">Médicament</p>
                <p className="font-medium text-gray-900">
                    {treatment.medication}
                </p>
                </div>
                <div>
                <p className="text-xs text-gray-500 mb-1">Posologie</p>
                <p className="font-medium text-gray-900">{treatment.dosage}</p>
                </div>
                <div>
                <p className="text-xs text-gray-500 mb-1">Fin prévue</p>
                <p className="font-medium text-gray-900">
                    {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                </p>
                </div>
                <div>
                <p className="text-xs text-gray-500 mb-1">Jours restants</p>
                <p className="font-medium text-orange-600">
                    {daysRemaining} jour(s)
                </p>
                </div>
            </div>

            {treatment.notes && (
                <div className="p-3 bg-white rounded-lg mb-3">
                <p className="text-sm text-gray-700">{treatment.notes}</p>
                </div>
            )}

            <div className="flex gap-2">
                <Button size="sm">
                Modifier
                </Button>
                <Button size="sm" variant="outline">
                Terminer
                </Button>
            </div>
            </div>
        );
        })
    ) : (
        <div className="text-center py-12 text-gray-500">
        Aucun traitement en cours
        </div>
    )}
    </div>
</CardContent>
</Card>

<Card>
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
    <CardTitle>Historique des traitements</CardTitle>
    
    {/* MENU DE FILTRAGE PAR ÉTAT AJOUTÉ */}
    <select
        title="Filtrer par état"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
        <option value="all">Tous les traitements</option>
        <option value="active">En cours</option>
        <option value="completed">Terminés</option>
    </select>
</CardHeader>
<CardContent>
    <div className="overflow-x-auto">
    <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
        <tr>
            <th className="px-6 py-3">Maladie</th>
            <th className="px-6 py-3">Lot</th>
            <th className="px-6 py-3">Médicament</th>
            <th className="px-6 py-3">Période</th>
            <th className="px-6 py-3">État</th>
            <th className="px-6 py-3 text-right">Actions</th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {mockTreatments
            // FILTRAGE LOGIQUE DES LIGNES APPLIQUÉ ICI
            .filter((treatment) => {
                const isActive = new Date(treatment.endDate) >= new Date();
                if (statusFilter === "active") return isActive;
                if (statusFilter === "completed") return !isActive;
                return true; // "all"
            })
            .map((treatment) => {
                const lot = mockFlocks.find((l) => l.id === treatment.flockId);
                const diseaseName = mockDiseases.find((d) => d.id === treatment.diseaseId)?.name ?? treatment.diseaseId;
                const isActive = new Date(treatment.endDate) >= new Date();

                return (
                <tr key={treatment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {diseaseName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                    {lot?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                    {treatment.medication}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(treatment.startDate).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                    <Badge variant={isActive ? "info" : "success"}>
                        {isActive ? "En cours" : "Terminé"}
                    </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline">
                        Détails
                    </Button>
                    </td>
                </tr>
                );
            })}
        </tbody>
    </table>
    </div>
</CardContent>
</Card>


{/* POP-UP : Formulaire de saisie d'un nouveau traitement connecté */}
<TreatmentForm
  open={isNewTreatmentOpen}
  onClose={() => setIsNewTreatmentOpen(false)}
  onSubmit={(newTreatmentData) => {
    console.log("Enregistrement du soin :", newTreatmentData);
    // Ici se fera votre logique d'ajout API ou de mise à jour d'état local
  }}
/>
</div>
);
}
