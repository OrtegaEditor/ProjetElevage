import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Plus, Syringe, Calendar, AlertTriangle } from "lucide-react";
import { mockVaccinations, mockFlocks } from "../data/mockData";

export function VaccinationsPage() {
const upcomingVaccinations = mockVaccinations.filter(
(v) => v.nextDueDate && new Date(v.nextDueDate) >= new Date()
);

const getMethodLabel = (method: string) => {
const labels: Record<string, string> = {
drinking_water: "Eau de boisson",
injection: "Injection",
spray: "Pulvérisation",
eye_drop: "Gouttes oculaires",
};
return labels[method] || method;
};

const getMethodBadge = (method: string) => {
const variants: Record<string, "info" | "success" | "warning" | "default"> = {
drinking_water: "info",
injection: "warning",
spray: "success",
eye_drop: "default",
};
return variants[method] || "default";
};

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Gestion des vaccinations
    </h1>
    <p className="text-gray-600">
    Calendrier vaccinal et suivi immunisation
    </p>
</div>
<div className="flex gap-3">
    <Button variant="outline">
    <Calendar className="w-4 h-4 mr-2" />
    Calendrier
    </Button>
    <Button>
    <Plus className="w-4 h-4 mr-2" />
    Nouvelle vaccination
    </Button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Total vaccinations
        </p>
        <p className="text-2xl font-semibold text-gray-900">
            {mockVaccinations.length}
        </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
        <Syringe className="w-6 h-6 text-blue-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        À venir
        </p>
        <p className="text-2xl font-semibold text-orange-600">
        {upcomingVaccinations.length}
        </p>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        Volailles immunisées
        </p>
        <p className="text-2xl font-semibold text-green-600">
        {mockVaccinations.reduce((sum, v) => sum + v.quantity, 0).toLocaleString()}
        </p>
    </div>
    </CardContent>
</Card>
</div>

{upcomingVaccinations.length > 0 && (
<Card className="border-orange-200 bg-orange-50">
    <CardHeader>
    <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <CardTitle className="text-orange-900">
        Vaccinations à venir
        </CardTitle>
    </div>
    </CardHeader>
    <CardContent>
    <div className="space-y-3">
        {upcomingVaccinations.map((vaccination) => {
        const flock = mockFlocks.find((f) => f.id === vaccination.flockId);
        const daysUntil = Math.ceil(
            (new Date(vaccination.nextDueDate!).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return (
            <div
            key={vaccination.id}
            className="p-4 bg-white border border-orange-200 rounded-lg"
            >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                    {vaccination.vaccine}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Lot: {flock?.name}</span>
                    <span>•</span>
                    <span>{vaccination.quantity} volailles</span>
                    <span>•</span>
                    <span className="text-orange-700 font-medium">
                    Dans {daysUntil} jour(s)
                    </span>
                </div>
                </div>
                <Button size="sm">Planifier</Button>
            </div>
            </div>
        );
        })}
    </div>
    </CardContent>
</Card>
)}

<Card>
<CardHeader>
    <CardTitle>Historique des vaccinations</CardTitle>
</CardHeader>
<CardContent>
    <div className="overflow-x-auto">
    <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Vaccin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Maladie cible
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Lot
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Quantité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Méthode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Date admin.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Prochain rappel
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Actions
            </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {mockVaccinations.map((vaccination) => {
            const flock = mockFlocks.find((f) => f.id === vaccination.flockId);
            return (
            <tr key={vaccination.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                    {vaccination.vaccine}
                    </span>
                </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {vaccination.diseaseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {flock?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                {vaccination.quantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getMethodBadge(vaccination.method)}>
                    {getMethodLabel(vaccination.method)}
                </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {new Date(vaccination.administrationDate).toLocaleDateString(
                    "fr-FR"
                )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                {vaccination.nextDueDate ? (
                    <span className="text-orange-600 font-medium">
                    {new Date(vaccination.nextDueDate).toLocaleDateString(
                        "fr-FR"
                    )}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
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
</div>
);
}
