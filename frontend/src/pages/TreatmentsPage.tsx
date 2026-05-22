import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Plus, Pill, Calendar, FileText } from "lucide-react";
import { mockFlocks,mockTreatments } from "../data/mockData";
import { useState } from "react";
import {TreatmentForm} from "../components/forms/TreatmentForm";

export function TreatmentsPage() {

    const [isNewTreatmentOpen, setIsNewTreatmentOpen] = useState(false);
    const avgMortality = mockFlocks.reduce((sum, flock) => sum + flock.mortality, 0) / mockFlocks.length;
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
    <Button variant="outline">
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
                    {treatment.diseaseId}
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
                <Button size="sm" variant="primary">
                Modifier
                </Button>
                <Button size="sm" variant="outline">
                Terminer
                </Button>
                <Button size="sm" variant="outline">
                Historique
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
<CardHeader>
    <CardTitle>Historique des traitements</CardTitle>
</CardHeader>
<CardContent>
    <div className="overflow-x-auto">
    <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Maladie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Lot
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Médicament
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Période
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            État
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Actions
            </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {mockTreatments.map((treatment) => {
            const lot = mockFlocks.find((l) => l.id === treatment.flockId);
            const isActive = new Date(treatment.endDate) >= new Date();

            return (
            <tr key={treatment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                    {treatment.diseaseId}
                </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {lot?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {treatment.medication}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(treatment.startDate).toLocaleDateString("fr-FR")} →{" "}
                {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={isActive ? "info" : "success"}>
                    {isActive ? "En cours" : "Terminé"}
                </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
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
    <TreatmentForm
    open={isNewTreatmentOpen}
    onClose={() => setIsNewTreatmentOpen(false)}
    onSubmit={(data) => {
        console.log("Traitement créé :", data);
        setIsNewTreatmentOpen(false);}}
/>
</div>
);
}
