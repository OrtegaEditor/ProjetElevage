import React, { useState } from "react";
import {
  mockAlerts,
  mockFlocks,
  mockPoultryHouses,
  mockSensors,
  mockStock,
  mockWeighings,
} from "../../data/mockData";
import { Button } from "../../components/common/button";
import { StatCard } from "../../components/common/StatCard";
import { Card } from "../../components/common/card";
import { DashboardActions } from "../../components/common/DashboardActions";
import { SensorFormModal } from "../../components/forms/SensorFormModal";
import { FlocksForm } from "../../components/forms/FlocksForm";
import { Eye, Settings, Check } from "lucide-react";
import { Flock } from "../../types";
import { PoultryHouseForm } from "../../components/forms/PoultryHousesForm";

export function AdminDashboard() {

  const [flocks, setFlocks] = useState<Flock[]>(mockFlocks);
  const [selectedFlock, setSelectedFlock] = useState<Flock| null>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"flock" | "sensor" | "house" | "user" | null>(null);

  const [openPoultryHoyuse, setopenPoultryHoyuse] = useState(false);

  const occupancyData = mockPoultryHouses.map((house) => ({
    name: house.name,
    occupancy: Math.round(
      (house.currentOccupancy / house.capacity) * 100
    ),
    current: house.currentOccupancy,
    capacity: house.capacity,
  }));

  const weightEvolutionData = mockWeighings
    .filter((item) => item.flockId === "flock-1")
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const mortalityData = mockFlocks.map((flock) => ({
    name: flock.name,
    mortality: flock.mortality,
    quantity: flock.quantity,
    mortalityRate: (
      (flock.mortality / flock.quantity) *
      100
    ).toFixed(1),
  }));

  const stockAlerts = mockStock.filter(
    (item) => item.status === "critical" || item.status === "low"
  );

  const activeAlertCount = mockAlerts.filter(
    (a) => a.status === "active"
  ).length;

  const sensorStatusStyles: Record<string, string> = {
    online: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
  };

  const alertStatusStyles: Record<string, string> = {
    active: "bg-red-100 text-red-700",
    resolved_auto: "bg-green-100 text-green-700",
    resolved_manual: "bg-blue-100 text-blue-700",
    ignored: "bg-gray-100 text-gray-700",
  };

  const stockStatusStyles: Record<string, string> = {
    normal: "bg-green-100 text-green-700",
    low: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };

  const handleAddFlock = () => {
    setActiveModal("flock")
  };

  const handleAddSensor = () => {
   setActiveModal("sensor")
  };

  const handleAddHouse = () => {
    setActiveModal("house")
  };

  const handleAddUser = () => {
    setActiveModal("user")
  };

  const handleExport = () => {
    console.log("Exporter");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleNotifications = () => {
    setNotifOpen((o) => !o);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>

          <DashboardActions
            onAdd={{
              flock: handleAddFlock,
              sensor: handleAddSensor,
              house: handleAddHouse,
              user: handleAddUser,
            }}
            onExport={handleExport}
            onRefresh={handleRefresh}
            onNotifications={handleNotifications}
            notificationCount={activeAlertCount}
          />
        </div>

        {notifOpen && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <p className="mb-3 font-semibold text-gray-800">
              Alertes actives
            </p>
            {mockAlerts
              .filter((a) => a.status === "active")
              .map((a) => (
                <div
                  key={a.id}
                  className="mb-2 rounded-xl bg-red-50 p-3 text-xs text-red-700"
                >
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-red-500">{a.message}</p>
                </div>
              ))}
            {activeAlertCount === 0 && (
              <p className="text-sm text-gray-400">
                Aucune alerte active
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Poulaillers"
            value={mockPoultryHouses.length}
            subtitle="Salles actives"
            onClick={() => alert("Détails : Poulaillers")}
          />
          <StatCard
            title="Capacité Totale"
            value={mockPoultryHouses.reduce(
              (acc, house) => acc + house.capacity,
              0
            )}
            subtitle="Animaux"
            onClick={() => alert("Détails : Capacité")}
          />
          <StatCard
            title="Alertes Actives"
            value={
              mockAlerts.filter((a) => a.status === "active").length
            }
            subtitle="Intervention requise"
            onClick={() => alert("Détails : Alertes")}
          />
          <StatCard
            title="Capteurs"
            value={mockSensors.length}
            subtitle="IoT connectés"
            onClick={() => alert("Détails : Capteurs")}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card title="Taux d'occupation des salles">
            <div className="space-y-5 p-6">
              {occupancyData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.current} / {item.capacity} volailles
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {item.occupancy}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    {/* eslint-disable-next-line react/forbid-component-props */}
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${item.occupancy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Évolution du poids - Lot PL2024-03">
            <div className="h-80 p-6">
              <div className="flex h-full items-end justify-between gap-4">
                {weightEvolutionData.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-1 flex-col items-center gap-3"
                  >
                    <div className="relative flex h-64 w-full max-w-16 items-end overflow-hidden rounded-xl bg-gray-100">
                      {/* eslint-disable-next-line react/forbid-component-props */}
                      <div
                        className="w-full rounded-xl bg-green-600"
                        style={{
                          height: `${(item.averageWeight / 2.5) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700">
                        {item.averageWeight} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Card title="Historique des alertes">
              <div className="space-y-4 p-6">
                {mockAlerts.map((alertItem) => (
                  <div
                    key={alertItem.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {alertItem.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {alertItem.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(alertItem.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            alertStatusStyles[alertItem.status]
                          }`}
                        >
                          {alertItem.status}
                        </span>

                        <div className="flex gap-1.5">
                          {alertItem.status === "active" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                window.alert(`Traiter : ${alertItem.title}`)
                              }
                            >
                              <Check className="w-4 h-4" />
                              Traiter
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.alert(`Voir : ${alertItem.title}`)
                            }
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Capteurs IoT">
              <div className="space-y-3 p-6">
                {mockSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {sensor.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {sensor.value} {sensor.unit}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            sensorStatusStyles[sensor.status]
                          }`}
                        >
                          {sensor.status}
                        </span>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            alert(`Configurer : ${sensor.name}`)
                          }
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Stock critique">
              <div className="space-y-3 p-6">
                {stockAlerts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.quantity} {item.unit}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            stockStatusStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            alert(`Réapprovisionner : ${item.name}`)
                          }
                        >
                          Réapprovisionner
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card title="Mortalité par lot">
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
            {mortalityData.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Mortalité</span>
                    <span className="font-semibold text-red-600">
                      {item.mortality}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Effectif</span>
                    <span className="font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Taux</span>
                    <span className="font-semibold text-orange-600">
                      {item.mortalityRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>{activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeModal === "flock" && "Ajouter un lot"}
                  {activeModal === "sensor" && "Ajouter un capteur"}
                  {activeModal === "house" && "Ajouter une salle"}
                  {activeModal === "user" && "Inviter un collaborateur"}
                </h2>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Fermer
                </button>
              </div>

              {activeModal === "flock" && (
                <div>
                    {activeModal === "flock" && (
                    <FlocksForm
                    onSave={(flock) => {
                    setActiveModal(null);
                      }}
                      onClose={() => setActiveModal(null)}
                    />
                  )}
                </div>
              )}

              {activeModal === "sensor" && (
                <div>
                  {activeModal === "sensor" && (
                    <SensorFormModal
                    onSave={(sensor) => {
                    setActiveModal(null);
                      }}
                      onClose={() => setActiveModal(null)}
                    />
                  )}
                </div>
              )}

              {activeModal === "house" && (
                <div>
                  FORMULAIRE SALLE
                </div>
              )}

              {activeModal === "user" && (
                <div>
                  FORMULAIRE UTILISATEUR
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}