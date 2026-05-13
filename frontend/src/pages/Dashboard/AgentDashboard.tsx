import { KPICard } from "../../components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { Button } from "../../components/common/button";
import { mockFlocks, mockAlerts, mockStock } from "../../data/mockData";
import {
CheckCircle2,
AlertTriangle,
Activity,
Droplet,
Plus,
Calendar,
} from "lucide-react";

const todayTasks = [
{ id: "1", title: "Pesée lot P2024-03 - Bât. A", time: "09:00", status: "pending" },
{ id: "2", title: "Contrôle alimentation Bât. B", time: "11:00", status: "completed" },
{ id: "3", title: "Vérification ventilation Bât. C", time: "14:00", status: "pending" },
{ id: "4", title: "Rapport mortalité quotidien", time: "17:00", status: "pending" },
];

export function AgentDashboard() {
const activeFlocks = mockFlocks.filter((l) => l.status === "active");
const activeAlerts = mockAlerts.filter((a) => !a.resolved);
const pendingTasks = todayTasks.filter((t) => t.status === "pending");
const criticalStock = mockStock.filter((s) => s.quantity < s.minThreshold);

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
    <Button variant="outline">
    <Calendar className="w-4 h-4 mr-2" />
    Planifier
    </Button>
    <Button>
    <Plus className="w-4 h-4 mr-2" />
    Nouvelle tâche
    </Button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<KPICard
    title="Tâches du jour"
    value={`${todayTasks.length - pendingTasks.length}/${todayTasks.length}`}
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
    title="Alertes terrain"
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
    <CardTitle>Evenement du jour </CardTitle>
    </CardHeader>
    <CardContent>
    <div className="space-y-3">
        {todayTasks.map((task) => (
        <div
            key={task.id}
            className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
            task.status === "completed"
                ? "bg-green-50 border-green-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
        >
            <input title="Tâche terminée"
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
            <p className="text-sm text-gray-600 mt-1">{task.time}</p>
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
                alert.type === "critical"
                    ? "danger"
                    : alert.type === "warning"
                    ? "warning"
                    : "info"
                }
            >
                {alert.type}
            </Badge>
            </div>
            <h4 className="font-medium text-sm text-gray-900 mb-1">
            {alert.title}
            </h4>
            <p className="text-xs text-gray-600">{alert.message}</p>
        </div>
        ))}
    </div>
    </CardContent>
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
</div>
);
}
