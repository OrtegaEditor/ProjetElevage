import { KPICard } from "../../components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { Button } from "../../components/common/button";
import { mockFlocks, mockTreatments, mockDiseases } from "../../data/mockData";

import { Stethoscope,AlertTriangle,Pill,Activity,Plus,FileText,} from "lucide-react";

import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,} from "recharts";

const healthData = [
{ week: "S1", respiratory: 3, digestive: 5, other: 2 },
{ week: "S2", respiratory: 2, digestive: 4, other: 1 },
{ week: "S3", respiratory: 4, digestive: 3, other: 3 },
{ week: "S4", respiratory: 1, digestive: 2, other: 1 },
];

const atRiskLots = [
{
id: "lot-1",
name: "P2024-03",
risk: "Signes respiratoires détectés",
severity: "warning",
animals: 487,
},
{
id: "lot-2",
name: "P2024-02",
risk: "Taux mortalité élevé",
severity: "critical",
animals: 289,
},
];

export function VeterinarianDashboard() {
const avgMortality =
mockFlocks.reduce((sum, flock) => sum + flock.mortality, 0) / mockFlocks.length;
const activeTreatments = mockTreatments.filter(
(t) => new Date(t.endDate) >= new Date()
);

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Tableau de bord Vétérinaire
    </h1>
    <p className="text-gray-600">Suivi sanitaire de l'exploitation</p>
</div>
<div className="flex gap-3">
    <Button variant="outline">
    <FileText className="w-4 h-4 mr-2" />
    Registre sanitaire
    </Button>
    <Button>
    <Plus className="w-4 h-4 mr-2" />
    Nouveau traitement
    </Button>
</div>
</div>

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
<Card>
    <CardHeader>
    <CardTitle>Cas sanitaires - 4 dernières semaines</CardTitle>
    </CardHeader>
    <CardContent>
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={healthData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Legend />
        <Bar
            dataKey="respiratory"
            fill="#FB8C00"
            name="Respiratoire"
            stackId="a"
        />
        <Bar
            dataKey="digestive"
            fill="#E53935"
            name="Digestif"
            stackId="a"
        />
        <Bar dataKey="other" fill="#1E88E5" name="Autres" stackId="a" />
        </BarChart>
    </ResponsiveContainer>
    </CardContent>
</Card>

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
            <Badge
                variant={lot.severity === "critical" ? "danger" : "warning"}
            >
                {lot.severity === "critical" ? "Critique" : "Surveillance"}
            </Badge>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-900">{lot.risk}</p>
            </div>
            <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1">
                Consulter
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
                Prescrire
            </Button>
            </div>
        </div>
        ))}
    </div>
    </CardContent>
</Card>
</div>

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
                {mockDiseases.find(d => d.id === treatment.diseaseId)?.name ?? "-"}
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
                <p className="font-medium text-gray-900">
                {treatment.medication}
                </p>
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
        </div>
    ))}
    </div>
</CardContent>
</Card>
</div>
);
}
