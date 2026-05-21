import React from "react";

type AlertStatus = "active" | "resolved_auto" | "resolved_manual" | "ignored";
type AlertSeverity = "critical" | "warning" | "info";

type Alert = {
id: string;
title: string;
message: string;
status: AlertStatus;
severity: AlertSeverity;
createdAt: string;
};

type Props = {
alerts: Alert[];
onResolve: (id: string) => void;
onIgnore: (id: string) => void;
onAction: (id: string, action: "ventilation" | "heating" | "light" | "alarm") => void;
};

export function AlertCenter({
alerts,
onResolve,
onIgnore,
onAction,
}: Props) {
const critical = alerts.filter(
(a) => a.severity === "critical" && a.status === "active"
);

const warning = alerts.filter(
(a) => a.severity === "warning" && a.status === "active"
);

const info = alerts.filter(
(a) => a.severity === "info" && a.status === "active"
);

const renderAlert = (alert: Alert) => (
<div
    key={alert.id}
    className="border rounded-lg p-3 bg-gray-50 space-y-2"
>
    <div className="flex justify-between">
    <div>
        <p className="font-semibold text-sm">{alert.title}</p>
        <p className="text-xs text-gray-600">{alert.message}</p>
    </div>

    <span className="text-xs font-semibold text-red-600">
        {alert.severity}
    </span>
    </div>

    <div className="flex gap-2 flex-wrap">
    <button
        onClick={() => onResolve(alert.id)}
        className="text-xs px-2 py-1 bg-green-600 text-white rounded"
    >
        Résoudre
    </button>

    <button
        onClick={() => onIgnore(alert.id)}
        className="text-xs px-2 py-1 bg-gray-500 text-white rounded"
    >
        Ignorer
    </button>

    <button
        onClick={() => onAction(alert.id, "ventilation")}
        className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
    >
        Ventilation
    </button>

    <button
        onClick={() => onAction(alert.id, "alarm")}
        className="text-xs px-2 py-1 bg-red-600 text-white rounded"
    >
        Alarme
    </button>
    </div>
</div>
);

return (
<div className="space-y-6">

    {/* CRITIQUES */}
    <section>
    <h3 className="text-red-600 font-semibold mb-2">
        Critiques ({critical.length})
    </h3>
    <div className="space-y-2">
        {critical.map(renderAlert)}
    </div>
    </section>

    {/* WARNING */}
    <section>
    <h3 className="text-orange-500 font-semibold mb-2">
        Avertissements ({warning.length})
    </h3>
    <div className="space-y-2">
        {warning.map(renderAlert)}
    </div>
    </section>

    {/* INFO */}
    <section>
    <h3 className="text-blue-500 font-semibold mb-2">
        Informations ({info.length})
    </h3>
    <div className="space-y-2">
        {info.map(renderAlert)}
    </div>
    </section>

</div>
);
}