import { useState } from "react";
import { KPICard } from "../../components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { Button } from "../../components/common/button";
import type { Alert } from "../../types/index";
import { mockFlocks, mockAlerts, mockStock,mockTasks } from "../../data/mockData";
import FeedingForm from "../../components/forms/feedingForm";
import EggCollectionForm from "../../components/forms/eggCollectionForm";
import MortalityForm from "../../components/forms/mortalityForm";
import WeighingForm from "../../components/forms/weighingForm";
import VaccinationForm from "../../components/forms/vaccinationForm";
import TaskPlanningForm from "../../components/forms/TaskPlanningForm";

import {
CheckCircle2,
AlertTriangle,
Activity,
Droplet,
Plus,
Calendar,
} from "lucide-react";


export function AgentDashboard() {
const [selectedAlert, setSelectedAlert] = useState<Alert|null>(null);
const activeFlocks = mockFlocks.filter((l) => l.status === "active");
const activeAlerts = mockAlerts.filter((a) => a.status === "active" || a.status==="ignored");
const pendingTasks = mockTasks.filter((t) => t.status === "pending");
const criticalStock = mockStock.filter((s) => s.quantity < s.minThreshold);
const [openEvent, setOpenEvent] = useState<"egg_collection" | "mortality" | "feeding" | "weighing" | "vaccination" | null>(null);
const [menuOpen, setMenuOpen] = useState(false);
const [open, setOpen] = useState(false);

const renderEventForm = () => {
switch (openEvent) {
    case "feeding":
    return <FeedingForm />;

    case "egg_collection":
    return <EggCollectionForm />;

    case "mortality":
    return <MortalityForm />;

    case "weighing":
    // return <WeighingForm />;

    case "vaccination":
    return <VaccinationForm />;

    default:
    return null;
}
};


return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Tableau de bord Agent
    </h1>
    <p className="text-gray-600">
    {new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })}
    </p>
</div>
<div className="flex gap-3">
    <div className="relative inline-block group">
        <Button onClick={() => setMenuOpen(!menuOpen)}>
            Enregistrer un événement
        </Button>
        <div className="hidden group-hover:block absolute bg-white border rounded-lg shadow-md w-56 z-50">
            <button onClick={() => setOpenEvent("feeding")} className="block w-full text-left px-3 py-2 hover:bg-gray-200">
            Alimentation
            </button>
            <button onClick={() => setOpenEvent("egg_collection")} className="block w-full text-left px-3 py-2 hover:bg-gray-200">
            Collecte d'œufs
            </button>

            <button onClick={() => setOpenEvent("mortality")} className="block w-full text-left px-3 py-2 hover:bg-gray-200">
            Mortalité
            </button>

            <button onClick={() => setOpenEvent("weighing")} className="block w-full text-left px-3 py-2 hover:bg-gray-200">
            Pesée
            </button>

            <button onClick={() => setOpenEvent("vaccination")} className="block w-full text-left px-3 py-2 hover:bg-gray-200">
            Vaccination
            </button>
        </div>
    </div>
    <Button variant="outline" onClick={() => setOpen(true)}>
        <Calendar className="w-4 h-4 mr-2" />
        Planifier
    </Button>{open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
        <button onClick={() => setOpen(false)}  className="absolute top-2 right-2 text-gray-500" >
            ✕
        </button>

            <TaskPlanningForm onClose={() => setOpen(false)} />
        </div>
        </div>
    )}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<KPICard
    title="Tâches du jour"
    value={`${mockTasks.length - pendingTasks.length}/${mockTasks.length}`}
    icon={<CheckCircle2 className="w-6 h-6" />}
    variant="success"
/>
<KPICard
    title="Lots de volailles actifs"
    value={activeFlocks.length}
    icon={<Activity className="w-6 h-6" />}
    variant="info"
/>
<KPICard
    title="Alertes"
    value={activeAlerts.length}
    icon={<AlertTriangle className="w-6 h-6" />}
    variant="warning"
/>
<KPICard
    title="Stock critique"
    value={criticalStock.length}
    icon={<Droplet className="w-6 h-6" />}
    variant="danger"
/>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<Card className="lg:col-span-2">
<CardHeader>
    <CardTitle>Taches du jour</CardTitle>
</CardHeader>

<CardContent>
    <div className="space-y-3">
    {mockTasks.map((task) => (
        <div
        key={task.id}
        className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
            task.status === "completed"
            ? "bg-green-50 border-green-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        >
        <input
            title="Tâche terminée"
            type="checkbox"
            checked={task.status === "completed"}
            className="w-5 h-5 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
            readOnly
        />

        <div className="flex-1">
            <h4
            className={`font-medium ${
                task.status === "completed"
                ? "text-gray-500 line-through"
                : "text-gray-900"
            }`}
            >
            {task.title}
            </h4>

            <p className="text-sm text-gray-600 mt-1">
            {task.poultryHouseId} • {task.time}
            </p>
        </div>

        {task.status === "completed" && (
            <Badge variant="success">Terminé</Badge>
        )}
        </div>
    ))}
    </div>
</CardContent>
</Card>

<Card>
<CardHeader>
<CardTitle>Alertes prioritaires</CardTitle>
</CardHeader>

<CardContent>
<div className="space-y-3">
    {activeAlerts.slice(0, 4).map((alert) => (
    <div
        key={alert.id}
        className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
    >
        <div className="flex items-start justify-between mb-2">
        <Badge
            variant={
            alert.type === "ammoniac"
                ? "danger"
                : alert.type === "temperature"
                ? "warning"
                : "info"
            }
        >
            {alert.type}
        </Badge>

        {alert.status === "resolved_auto" && (
            <span className="text-xs text-green-600">Auto</span>
        )}
        </div>

        <h4 className="font-medium text-sm text-gray-900 mb-1">
        {alert.title}
        </h4>

        <p className="text-xs text-gray-600">
        {alert.message}
        </p>

        {/* BOUTON DETAILS */}
        <button
        onClick={() => setSelectedAlert(alert)}
        className="text-xs text-blue-600 hover:underline mt-2"
        >
            Détails
        </button>
        </div>
    ))}
    </div>
</CardContent>

{/* MODAL */}
{selectedAlert && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md rounded-lg p-5">

        <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Détail alerte</h2>

        <button onClick={() => setSelectedAlert(null)}>
            ✕
        </button>
        </div>

        <p><b>Titre:</b> {selectedAlert.title}</p>
        <p><b>Message:</b> {selectedAlert.message}</p>
        <p><b>Type:</b> {selectedAlert.type}</p>
        <p><b>Statut:</b> {selectedAlert.status}</p>
        <p><b>Date:</b> {selectedAlert.createdAt}</p>

    </div>
    </div>
)}
</Card>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<Card>
    <CardHeader>
    <CardTitle>Lots de volailles en cours</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="space-y-3">
        {activeFlocks.map((lot) => (
        <div
            key={lot.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
            <div className="flex items-start justify-between mb-3">
            <div>
                <h4 className="font-medium text-gray-900">{lot.name}</h4>
                <p className="text-sm text-gray-600">
                {lot.quantity} volailles • Poids moyen: {lot.averageWeight}kg • Âge: {lot.age}j
                </p>
            </div>
            <Badge variant="success">Actif</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
                Début: {new Date(lot.startDate).toLocaleDateString("fr-FR")}
            </span>
            <span className="text-gray-600">Mortalité: {lot.mortality}</span>
            </div>
        </div>
        ))}
    </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
    <CardTitle>Stock à surveiller</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="space-y-3">
        {criticalStock.map((item) => (
        <div
            key={item.id}
            className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
        >
            <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <Badge variant="warning">Niveau bas</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
                Stock actuel: {item.quantity} {item.unit}
            </span>
            <span className="text-orange-700 font-medium">
                Min: {item.minThreshold} {item.unit}
            </span>
            </div>
        </div>
        ))}
    </div>
    </CardContent>
</Card>
</div>
{openEvent && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg p-5 rounded-lg">

        <div className="flex justify-between mb-4">
            <h2 className="font-semibold">
            Enregistrer un événement
            </h2>

            <button onClick={() => setOpenEvent(null)}>
            ✕
            </button>
        </div>

        {renderEventForm()}

        </div>
    </div>
    )}
</div>

);
}
