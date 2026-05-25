import React, { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Calendar,
  Plus,
  Search,
  Syringe,
} from "lucide-react";

import "../../styles/tailwind.css";

/**
 * IMPORT TYPES FROM INDEX FILE
 */
import {
  Vaccination,
  Flock,
  User,
  Disease
} from "../types/index";

/**
 * IMPORT DATA FROM MOCKDATA FILE
 */
import {
  mockVaccinations,
  mockFlocks,
  mockUsers,
  mockDiseases
} from "../data/mockData";

// Simple fallback StatCard component since it wasn't exported in the original index.ts
function StatCard({ 
  title, 
  value, 
  icon, 
  valueColor = "text-gray-900" 
}: { 
  title: string; 
  value: string; 
  icon?: React.ReactNode; 
  valueColor?: string; 
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
      </div>
      {icon && <div className="text-gray-400 bg-gray-50 p-3 rounded-xl">{icon}</div>}
    </div>
  );
}

function methodBadgeClass(method: string) {
  switch (method.toLowerCase()) {
    case "drinking_water":
      return "bg-blue-100 text-blue-700";

    case "spray":
      return "bg-green-100 text-green-700";

    case "injection":
      return "bg-purple-100 text-purple-700";

    case "eye_drop":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatMethodText(method: string) {
  switch (method) {
    case "drinking_water": return "Eau de boisson";
    case "injection": return "Injection";
    case "spray": return "Pulvérisation";
    case "eye_drop": return "Goutte oculaire";
    default: return method;
  }
}

function VaccinationRow({
  item,
}: {
  item: Vaccination;
}) {
  const flock = mockFlocks.find(
    (f: Flock) => f.id === item.flockId
  );

  const disease = mockDiseases.find(
    (d: Disease) => d.id === item.diseaseId
  );

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
      <td className="py-5 px-4 font-medium text-gray-900 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Syringe
            size={16}
            className="text-blue-600"
          />
          {item.vaccine}
        </div>
      </td>

      <td className="py-5 px-4 text-gray-600 min-w-[250px]">
        {disease ? disease.name : item.diseaseId}
      </td>

      <td className="py-5 px-4 text-gray-600 whitespace-nowrap">
        {flock ? flock.name : "Inconnu"}
      </td>

      <td className="py-5 px-4 text-gray-600 whitespace-nowrap">
        {item.quantity.toLocaleString("fr-FR")}
      </td>

      <td className="py-5 px-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${methodBadgeClass(
            item.method
          )}`}
        >
          {formatMethodText(item.method)}
        </span>
      </td>

      <td className="py-5 px-4 text-gray-600 whitespace-nowrap">
        {item.administrationDate}
      </td>
    </tr>
  );
}

export default function VaccinationsPage() {
  const [search, setSearch] = useState("");

  // Target Veterinarian configuration from mock data (Dr. Pierre Dubois, ID: 3)
  const currentVeterinarian = useMemo(() => {
    return mockUsers.find((u: User) => u.role === "veterinarian") || {
      name: "Dr. Pierre Dubois",
      role: "veterinarian"
    };
  }, []);

  const filteredVaccinations = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return mockVaccinations;

    return mockVaccinations.filter(
      (item: Vaccination) => {
        const flock = mockFlocks.find(
          (f: Flock) => f.id === item.flockId
        );
        
        const disease = mockDiseases.find(
          (d: Disease) => d.id === item.diseaseId
        );

        return (
          item.vaccine.toLowerCase().includes(q) ||
          (disease?.name || "").toLowerCase().includes(q) ||
          item.diseaseId.toLowerCase().includes(q) ||
          (flock?.name || "").toLowerCase().includes(q) ||
          item.method.toLowerCase().includes(q)
        );
      }
    );
  }, [search]);

  const stats = useMemo(() => {
    const totalVaccinations = mockVaccinations.length;

    // Accounts for pending/upcoming booster schedules
    const upcoming = mockVaccinations.filter(
      (v: Vaccination) => v.nextDueDate && new Date(v.nextDueDate) > new Date()
    ).length;

    const totalBirds = mockVaccinations.reduce(
      (sum: number, item: Vaccination) => sum + item.quantity,
      0
    );

    return {
      totalVaccinations,
      upcoming,
      totalBirds,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
              placeholder="Rechercher un vaccin, un lot ou une maladie..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* User */}
          <div className="flex items-center justify-end gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell
                size={20}
                className="text-gray-600"
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
                {currentVeterinarian.name.charAt(0)}
              </div>

              <div className="hidden sm:block">
                <p className="font-semibold text-gray-900">
                  {currentVeterinarian.name}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {currentVeterinarian.role === "veterinarian" ? "Vétérinaire" : currentVeterinarian.role}
                </p>
              </div>

              <ChevronDown
                size={18}
                className="text-gray-400"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-4 md:p-6 space-y-6">
        {/* Page Header */}
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des vaccinations
            </h1>
            <p className="text-gray-600 mt-2">
              Calendrier vaccinal et suivi d'immunisation des lots
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 transition">
              <Calendar size={18} />
              Calendrier
            </button>

            <button className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition">
              <Plus size={18} />
              Nouvelle vaccination
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total vaccinations"
            value={stats.totalVaccinations.toString()}
            icon={<Syringe size={22} />}
          />

          <StatCard
            title="Rappels attendus"
            value={stats.upcoming.toString()}
            valueColor="text-orange-500"
          />

          <StatCard
            title="Volailles vaccinées"
            value={stats.totalBirds.toLocaleString("fr-FR")}
            valueColor="text-green-600"
          />
        </section>

        {/* Vaccination History */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Historique des vaccinations
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500 uppercase tracking-wide">
                  <th className="py-4 px-4 font-medium">Vaccin</th>
                  <th className="py-4 px-4 font-medium">Maladie cible</th>
                  <th className="py-4 px-4 font-medium">Lot</th>
                  <th className="py-4 px-4 font-medium">Quantité</th>
                  <th className="py-4 px-4 font-medium">Méthode</th>
                  <th className="py-4 px-4 font-medium">Date admin.</th>
                </tr>
              </thead>

              <tbody>
                {filteredVaccinations.map((item: Vaccination) => (
                  <VaccinationRow
                    key={item.id}
                    item={item}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredVaccinations.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucune vaccination trouvée.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}