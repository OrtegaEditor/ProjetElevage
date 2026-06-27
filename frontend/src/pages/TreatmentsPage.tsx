// frontend/src/pages/TreatmentsPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Input } from "../components/common/input";
import { Plus, Pill, FileText, RefreshCw, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TreatmentForm } from "../components/forms/TreatmentForm";
import { treatmentsAPI, flocksAPI } from "../services/api";

interface Treatment {
  id: string;
  diseaseId: string;
  flockId: string;
  medication: string;
  dosage: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

interface Flock {
  id: string;
  name: string;
  farmId: string;
  farmName: string;
}

export function TreatmentsPage() {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTreatmentOpen, setIsNewTreatmentOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [treatmentsData, flocksData] = await Promise.all([
        treatmentsAPI.getAll(),
        flocksAPI.getAll()
      ]);
      setTreatments(treatmentsData || []);
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

  const now = new Date();
  
  const filteredTreatments = treatments.filter((treatment) => {
    const isActive = new Date(treatment.endDate) >= now;
    // Filtre par statut
    if (statusFilter === "active") return isActive;
    if (statusFilter === "completed") return !isActive;
    // Filtre par recherche
    const matchesSearch = 
      treatment.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFlockName(treatment.flockId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (treatment.dosage && treatment.dosage.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const activeTreatments = treatments.filter((t) => new Date(t.endDate) >= now);
  const completedTreatments = treatments.filter((t) => new Date(t.endDate) < now);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Soins & Traitements</h1>
          <p className="text-gray-600">Gestion des traitements vétérinaires et prescriptions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/health-registry")}>
            <FileText className="w-4 h-4 mr-2" />
            Registre sanitaire
          </Button>
          <Button onClick={() => setIsNewTreatmentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau traitement
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl border">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par médicament, lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant={statusFilter === "all" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("all")}
          >
            Tous
          </Button>
          <Button 
            variant={statusFilter === "active" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("active")}
          >
            En cours
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("completed")}
          >
            Terminés
          </Button>
          {(searchTerm || statusFilter !== "all") && (
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
                <p className="text-sm font-medium text-gray-600 mb-1">Traitements actifs</p>
                <p className="text-2xl font-semibold text-blue-600">{activeTreatments.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Terminés</p>
              <p className="text-2xl font-semibold text-green-600">{completedTreatments.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total traitements</p>
              <p className="text-2xl font-semibold text-gray-900">{treatments.length}</p>
              {filteredTreatments.length !== treatments.length && searchTerm && (
                <p className="text-xs text-gray-400 mt-1">
                  {filteredTreatments.length} résultat(s) trouvé(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traitements en cours */}
      <Card>
        <CardHeader>
          <CardTitle>Traitements en cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTreatments.length > 0 ? (
              activeTreatments.map((treatment) => {
                const daysRemaining = Math.ceil(
                  (new Date(treatment.endDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={treatment.id} className="p-5 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {treatment.medication}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Lot: {getFlockName(treatment.flockId)}</span>
                        </div>
                      </div>
                      <Badge variant="info">En cours</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Médicament</p>
                        <p className="font-medium text-gray-900">{treatment.medication}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Posologie</p>
                        <p className="font-medium text-gray-900">{treatment.dosage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fin prévue</p>
                        <p className="font-medium text-gray-900">
                          {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Jours restants</p>
                        <p className="font-medium text-orange-600">{daysRemaining} jour(s)</p>
                      </div>
                    </div>

                    {treatment.notes && (
                      <div className="p-3 bg-white rounded-lg mb-3">
                        <p className="text-sm text-gray-700">{treatment.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">Modifier</Button>
                      <Button size="sm" variant="outline">Terminer</Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">Aucun traitement en cours</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historique des traitements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Historique des traitements</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTreatments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun traitement ne correspond à vos critères
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                  <tr>
                    <th className="px-6 py-3">Médicament</th>
                    <th className="px-6 py-3">Lot</th>
                    <th className="px-6 py-3">Posologie</th>
                    <th className="px-6 py-3">Période</th>
                    <th className="px-6 py-3">État</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTreatments.map((treatment) => {
                    const isActive = new Date(treatment.endDate) >= now;
                    return (
                      <tr key={treatment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{treatment.medication}</td>
                        <td className="px-6 py-4 text-gray-600">{getFlockName(treatment.flockId)}</td>
                        <td className="px-6 py-4 text-gray-600">{treatment.dosage}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {new Date(treatment.startDate).toLocaleDateString("fr-FR")} →{" "}
                          {new Date(treatment.endDate).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={isActive ? "info" : "success"}>
                            {isActive ? "En cours" : "Terminé"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline">Détails</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TreatmentForm
        open={isNewTreatmentOpen}
        onClose={() => setIsNewTreatmentOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsNewTreatmentOpen(false);
        }}
      />
    </div>
  );
}