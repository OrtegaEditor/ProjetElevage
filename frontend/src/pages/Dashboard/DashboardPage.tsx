
import React, { useMemo } from "react";
import "../../styles/tailwind.css";

/**
 * IMPORT TYPES FROM INDEX FILE
 */
import { Alert, Sensor, Flock } from "../../types/index";

/**
 * IMPORT DATA FROM MOCKDATA FILE
 */
import { mockAlerts, mockSensors, mockFlocks } from "../../data/mockData";

export default function DashboardPage() {
  // 1. Dynamic Production & Mortality bar charts compiled from active flock data
  const productionData = useMemo(() => {
    return mockFlocks.map((flock: Flock) => ({
      name: flock.name,
      mortality: flock.mortality,
      quantity: flock.quantity,
    }));
  }, []);

  // 2. Real Alerts from mock data
  const alerts = mockAlerts;

  // 3. Real Sensors from mock data
  const sensors = mockSensors;

  // Style mappings adhering to type properties from index.ts
  const badgeStyles: Record<string, string> = {
    online: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    active: "bg-red-100 text-red-700",
    resolved_auto: "bg-blue-100 text-blue-700",
    resolved_manual: "bg-purple-100 text-purple-700",
    ignored: "bg-gray-100 text-gray-700",
  };

  const formatAlertStatus = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "resolved_auto": return "Résolu (Auto)";
      case "resolved_manual": return "Résolu (Manuel)";
      case "ignored": return "Ignoré";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 lg:p-8">
        {/* Top Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
          <Card title="Pertes / Mortalité actuelle par lot">
            <div className="h-80 p-6">
              <div className="flex h-full items-end justify-between gap-4">
                {productionData.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="text-xs font-semibold text-red-600">
                      {item.mortality}
                    </div>
                    <div className="relative w-full max-w-16 h-48 rounded-lg bg-gray-100 overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-lg bg-red-500 transition-all duration-500"
                        style={{
                          // Visual percentage of mortality against initial flock size
                          height: `${Math.min((item.mortality / item.quantity) * 500, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Suivi Environnemental global (24h)">
            <div className="h-80 p-6">
              <div className="h-full rounded-2xl border border-orange-100 bg-orange-50 overflow-hidden flex flex-col justify-between">
                <div className="p-4">
                  <p className="text-xs text-orange-700 font-semibold uppercase tracking-wider">
                    Fluctuation Moyenne des Salles Actives
                  </p>
                </div>
                <svg viewBox="0 0 600 180" className="w-full h-auto mt-auto">
                  <polyline
                    fill="rgba(251,146,60,0.15)"
                    points="0,90 120,95 240,75 360,60 480,55 600,70 600,180 0,180"
                  />
                  <polyline
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    points="0,90 120,95 240,75 360,60 480,55 600,70"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card title="Alertes Récentes Système">
              <div className="space-y-4 p-6 max-h-[460px] overflow-y-auto">
                {alerts.map((alert: Alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {alert.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Bâtiment ID: {alert.idPoultryHouse} • {new Date(alert.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                          badgeStyles[alert.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatAlertStatus(alert.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-gray-500 text-center py-6">Aucune alerte enregistrée.</p>
                )}
              </div>
            </Card>
          </div>

          <Card title="Statut des Capteurs IoT">
            <div className="space-y-3 p-6 max-h-[460px] overflow-y-auto">
              {sensors.map((sensor: Sensor) => (
                <div
                  key={sensor.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {sensor.name}
                    </h4>
                    <p className="mt-1 text-lg font-semibold text-gray-700">
                      {sensor.value} <span className="text-xs font-normal text-gray-500">{sensor.unit}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                      badgeStyles[sensor.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {sensor.status}
                  </span>
                </div>
              ))}
              {sensors.length === 0 && (
                <p className="text-gray-500 text-center py-6">Aucun capteur disponible.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
