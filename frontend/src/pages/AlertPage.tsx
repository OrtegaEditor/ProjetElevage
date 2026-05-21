import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Select } from "../components/common/select";
import {
AlertTriangle,
CheckCircle2,
Info,
Clock,
} from "lucide-react";
import { mockAlerts } from "../data/mockData";

export function AlertsPage() {
const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
const [typeFilter, setTypeFilter] = useState("all");

const filteredAlerts = mockAlerts.filter((alert) => {
if (filter === "active" && alert.resolvedAt) return false;
if (filter === "resolved" && !alert.resolvedAt) return false;
if (typeFilter !== "all" && alert.type !== typeFilter) return false;

return true;
});

const getAlertIcon = (type: string) => {
switch (type) {
case "temperature":
return <AlertTriangle className="w-5 h-5" />;

case "ammoniac":
return <AlertTriangle className="w-5 h-5" />;

case "light":
return <Info className="w-5 h-5" />;

default:
return <AlertTriangle className="w-5 h-5" />;
}
};

const getAlertColor = (type: string) => {
switch (type) {
case "temperature":
return "bg-red-100 text-red-600 border-red-200";

case "ammoniac":
return "bg-orange-100 text-orange-600 border-orange-200";

case "light":
return "bg-blue-100 text-blue-600 border-blue-200";

default:
return "bg-gray-100 text-gray-600 border-gray-200";
}
};

const activeAlerts = mockAlerts.filter((a) => !a.resolvedAt);

const resolvedAlerts = mockAlerts.filter((a) => a.resolvedAt);

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Centre d'alertes
    </h1>

    <p className="text-gray-600">
        Gestion des alertes IoT et notifications système
    </p>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<Card>
    <CardContent className="p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                    Alertes actives
                </p>

                <p className="text-2xl font-semibold text-red-600">
                    {activeAlerts.length}
                </p>
            </div>

            <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
        </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                    Alertes température
                </p>

                <p className="text-2xl font-semibold text-red-600">
                    {
                        activeAlerts.filter(
                            (a) => a.type === "temperature"
                        ).length
                    }
                </p>
            </div>

            <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
        </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                    Résolues aujourd'hui
                </p>

                <p className="text-2xl font-semibold text-green-600">
                    {resolvedAlerts.length}
                </p>
            </div>

            <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
        </div>
    </CardContent>
</Card>
</div>

<Card>
<CardHeader>
    <div className="flex items-center justify-between">
        <CardTitle>Toutes les alertes</CardTitle>

        <div className="flex gap-3">
            <Select
                options={[
                    { value: "all", label: "Toutes" },
                    { value: "active", label: "Actives" },
                    { value: "resolved", label: "Résolues" },
                ]}
                value={filter}
                onChange={(e) =>
                    setFilter(
                        e.target.value as
                            | "all"
                            | "active"
                            | "resolved"
                    )
                }
            />

            <Select
                options={[
                    { value: "all", label: "Tous types" },
                    {
                        value: "temperature",
                        label: "Température",
                    },
                    {
                        value: "ammoniac",
                        label: "Ammoniac",
                    },
                    {
                        value: "light",
                        label: "Luminosité",
                    },
                ]}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
            />
        </div>
    </div>
</CardHeader>

<CardContent>
    <div className="space-y-3">
        {filteredAlerts.map((alert) => (
            <div
                key={alert.id}
                className={`p-5 rounded-lg border-2 ${
                    alert.resolvedAt
                        ? "bg-gray-50 border-gray-200 opacity-75"
                        : getAlertColor(alert.type)
                }`}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`p-2 rounded-lg ${
                            alert.resolvedAt
                                ? "bg-gray-200 text-gray-600"
                                : ""
                        }`}
                    >
                        {alert.resolvedAt ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            getAlertIcon(alert.type)
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">
                                    {alert.title}
                                </h4>

                                <p className="text-sm text-gray-700">
                                    {alert.message}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        alert.type === "temperature"
                                            ? "danger"
                                            : alert.type === "ammoniac"
                                            ? "warning"
                                            : "info"
                                    }
                                >
                                    {alert.type}
                                </Badge>

                                {alert.resolvedAt && (
                                    <Badge variant="success">
                                        Résolue
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />

                                {new Date(
                                    alert.createdAt
                                ).toLocaleString("fr-FR")}
                            </span>
                        </div>

                        {!alert.resolvedAt && (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="primary"
                                >
                                    Marquer comme résolue
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                >
                                    Voir détails
                                </Button>
                            </div>
                        )}

                        {alert.resolvedAt && (
                            <p className="text-sm text-gray-600">
                                Résolue le{" "}
                                {new Date(
                                    alert.resolvedAt
                                ).toLocaleString("fr-FR")}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        ))}
    </div>
</CardContent>
</Card>
</div>
);
}