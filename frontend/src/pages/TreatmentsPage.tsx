import React, { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  FileText,
  Pill,
  Plus,
  Search,
} from "lucide-react";

import "../styles/tailwind.css";

/**
 * IMPORT TYPES FROM INDEX FILE
 */
import type { Treatment, Flock } from "../types/index";

/**
 * IMPORT DATA FROM MOCKDATA FILE
 */
import {
  mockTreatments,
  mockUsers,
  mockFlocks,
} from "../data/mockData";

// ─── Derived data from mockData ───────────────────────────────────────────────

/** The logged-in veterinarian */
const veterinarian = mockUsers.find((u) => u.role === "veterinarian")!;

/** All treatments act as history */
const treatmentHistory: Treatment[] = mockTreatments;

/** Active treatments = those whose endDate is in the future */
const activeTreatments: Treatment[] = mockTreatments.filter(
  (t) => new Date(t.endDate) >= new Date()
);

// ─── StatCard component ───────────────────────────────────────────────────────

type StatCardProps = {
  title: string;
  value: string;
  valueColor?: string;
  icon?: React.ReactNode;
};

function StatCard({ title, value, valueColor = "text-gray-900", icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TreatmentsPage() {
  const [search, setSearch] = useState("");

  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase();

    return treatmentHistory.filter((item: Treatment) => {
      const flock = mockFlocks.find((f: Flock) => f.id === item.flockId);
      return (
        item.medication.toLowerCase().includes(q) ||
        flock?.name.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const stats = {
    active: activeTreatments.length,
    completedThisMonth: treatmentHistory.filter(
      (item: Treatment) => new Date(item.endDate) <= new Date()
    ).length,
    total: treatmentHistory.length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Search */}
          <div className="relative w-full xl:max-w-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* User */}
          <div className="flex items-center justify-end gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
                {veterinarian.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-gray-900">
                  {veterinarian.name}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {veterinarian.role}
                </p>
              </div>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 space-y-6">
        {/* Page Header */}
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Soins & Traitements
            </h1>
            <p className="text-gray-600 mt-2">
              Gestion des traitements vétérinaires et prescriptions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 transition">
              <FileText size={18} />
              Registre
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition">
              <Plus size={18} />
              Nouveau traitement
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Traitements actifs"
            value={stats.active.toString()}
            valueColor="text-blue-600"
            icon={<Pill size={22} />}
          />
          <StatCard
            title="Terminés ce mois"
            value={stats.completedThisMonth.toString()}
            valueColor="text-green-600"
          />
          <StatCard
            title="Total traitements"
            value={stats.total.toString()}
          />
        </section>

        {/* Active Treatments */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Traitements en cours
          </h2>

          {activeTreatments.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 text-lg">
              Aucun traitement en cours
            </div>
          ) : (
            <div className="space-y-4">
              {activeTreatments.map((item: Treatment) => {
                const flock = mockFlocks.find(
                  (f: Flock) => f.id === item.flockId
                );
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {item.medication}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {flock?.name ?? "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Treatment History */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Historique des traitements
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500 uppercase tracking-wide">
                  <th className="py-4 px-4 font-medium">Médicament</th>
                  <th className="py-4 px-4 font-medium">Lot</th>
                  <th className="py-4 px-4 font-medium">Dosage</th>
                  <th className="py-4 px-4 font-medium">Période</th>
                  <th className="py-4 px-4 font-medium">Animaux</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredHistory.map((item: Treatment) => {
                  const flock = mockFlocks.find(
                    (f: Flock) => f.id === item.flockId
                  );
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-5 px-4 font-medium text-gray-900">
                        {item.medication}
                      </td>
                      <td className="py-5 px-4 text-gray-600">
                        {flock?.name ?? "—"}
                      </td>
                      <td className="py-5 px-4 text-gray-600">
                        {item.dosage}
                      </td>
                      <td className="py-5 px-4 text-gray-600">
                        {item.startDate} → {item.endDate}
                      </td>
                      <td className="py-5 px-4 text-gray-600">
                        {item.animalsCount}
                      </td>
                      <td className="py-5 px-4 text-right">
                        <button className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun traitement trouvé.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

