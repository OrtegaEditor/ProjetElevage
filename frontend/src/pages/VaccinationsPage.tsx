// frontend/src/pages/VaccinationsPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Input } from "../components/common/input";
import { Plus, Syringe, Calendar, AlertTriangle, RefreshCw, Search, X } from "lucide-react";
import { VaccinationForm } from "@/components/forms/vaccinationForm";
import { VaccinationCalendar } from "../components/specific/VaccinationCalendar";
import { vaccinationsAPI, flocksAPI } from "../services/api";

interface Vaccination {
  id: string;
  vaccine: string;
  diseaseId: string;
  flockId: string;
  quantity: number;
  method: string;
  administrationDate: string;
  nextDueDate?: string;
  notes?: string;
}

interface Flock {
  id: string;
  name: string;
  farmId: string;
  farmName: string;
}

export function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vaccinationsData, flocksData] = await Promise.all([
        vaccinationsAPI.getAll(),
        flocksAPI.getAll()
      ]);
      setVaccinations(vaccinationsData || []);
      setFlocks(flocksData || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getFlockName = (flockId: string) => {
    const flock = flocks.find(f => f.id === flockId);
    return flock?.name || "Lot inconnu";
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      drinking_water: "Eau de boisson",
      injection: "Injection",
      spray: "Pulvérisation",
      eye_drop: "Gouttes oculaires",
    };
    return labels[method] || method;
  };

  const getMethodBadge = (method: string): "info" | "success" | "warning" | "outline" => {
    const variants: Record<string, "info" | "success" | "warning" | "outline"> = {
      drinking_water: "info",
      injection: "warning",
      spray: "success",
      eye_drop: "outline",
    };
    return variants[method] || "outline";
  };

  const filteredVaccinations = vaccinations.filter((v) => {
    const matchesSearch = 
      v.vaccine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFlockName(v.flockId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "all" || v.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const upcomingVaccinations = vaccinations.filter(
    (v) => v.nextDueDate && new Date(v.nextDueDate) >= new Date()
  );

  const clearFilters = () => {
    setSearchTerm("");
    setMethodFilter("all");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Gestion des vaccinations
          </h1>
          <p className="text-gray-600">Calendrier vaccinal et suivi immunisation</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>
          <Button variant="outline" onClick={() => setIsCalendarOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Calendrier
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle vaccination
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par vaccin, lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <Button 
            variant={methodFilter === "all" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setMethodFilter("all")}
          >
            Toutes
          </Button>
          <Button 
            variant={methodFilter === "drinking_water" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setMethodFilter("drinking_water")}
          >
            Eau de boisson
          </Button>
          <Button 
            variant={methodFilter === "injection" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setMethodFilter("injection")}
          >
            Injection
          </Button>
          <Button 
            variant={methodFilter === "spray" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setMethodFilter("spray")}
          >
            Pulvérisation
          </Button>
          <Button 
            variant={methodFilter === "eye_drop" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setMethodFilter("eye_drop")}
          >
            Gouttes
          </Button>
          {(searchTerm || methodFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500">
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total vaccinations</p>
                <p className="text-2xl font-semibold text-gray-900">{vaccinations.length}</p>
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
              <p className="text-sm font-medium text-gray-600 mb-1">À venir</p>
              <p className="text-2xl font-semibold text-orange-600">{upcomingVaccinations.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Volailles immunisées</p>
              <p className="text-2xl font-semibold text-green-600">
                {vaccinations.reduce((sum, v) => sum + v.quantity, 0).toLocaleString()}
              </p>
              {filteredVaccinations.length !== vaccinations.length && (searchTerm || methodFilter !== "all") && (
                <p className="text-xs text-gray-400 mt-1">
                  {filteredVaccinations.length} résultat(s) trouvé(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vaccinations à venir */}
      {upcomingVaccinations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900">Vaccinations à venir</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingVaccinations.map((vaccination) => {
                const daysUntil = Math.ceil(
                  (new Date(vaccination.nextDueDate!).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={vaccination.id} className="p-4 bg-white border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{vaccination.vaccine}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Lot: {getFlockName(vaccination.flockId)}</span>
                          <span>•</span>
                          <span>{vaccination.quantity} volailles</span>
                          <span>•</span>
                          <span className="text-orange-700 font-medium">Dans {daysUntil} jour(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des vaccinations */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des vaccinations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVaccinations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune vaccination ne correspond à vos critères
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date admin.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochain rappel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVaccinations.map((vaccination) => (
                    <tr key={vaccination.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Syringe className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{vaccination.vaccine}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {getFlockName(vaccination.flockId)}
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
                        {new Date(vaccination.administrationDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vaccination.nextDueDate ? (
                          <span className="text-orange-600 font-medium">
                            {new Date(vaccination.nextDueDate).toLocaleDateString("fr-FR")}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button size="sm" variant="outline">Détails</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <VaccinationForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsFormOpen(false);
        }}
      />

      <VaccinationCalendar
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}