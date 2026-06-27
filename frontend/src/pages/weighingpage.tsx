// frontend/src/pages/weighingpage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { flocksAPI, usersAPI } from "../services/api";
import { Flock, Weighing, Farm } from "../types";
import { Button } from "../components/common/button";
import { Plus, Filter, RefreshCw, Activity, TrendingUp, Users, Weight } from "lucide-react";
import { WeighingTab } from "@/components/specific/WeighingTab";
import { WeighingHistoryTable } from "@/components/specific/WeighingHistoryTable";
import { Modal } from "../components/forms/modal";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart
} from "recharts";

interface WeighingWithDetails extends Weighing {
  flockName?: string;
  farmId?: string;
  farmName?: string;
}

export function WeighingPage() {
  const [weighings, setWeighings] = useState<WeighingWithDetails[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [filteredFlocks, setFilteredFlocks] = useState<Flock[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFlockForWeighing, setSelectedFlockForWeighing] = useState<{ id: string; name: string; quantity: number; age: number } | null>(null);

  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  const [selectedFlockId, setSelectedFlockId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [totalWeighings, setTotalWeighings] = useState(0);
  const [averageWeight, setAverageWeight] = useState(0);
  const [bestWeight, setBestWeight] = useState(0);
  const [totalAnimalsWeighed, setTotalAnimalsWeighed] = useState(0);

  const updateStats = useCallback((weighingsData: WeighingWithDetails[]) => {
    const total = weighingsData.length;
    const avg = weighingsData.reduce((sum, w) => sum + (w.averageWeight || 0), 0) / (total || 1);
    const best = Math.max(...weighingsData.map(w => w.averageWeight || 0), 0);
    const totalAnimals = weighingsData.reduce((sum, w) => {
      const weightsCount = Array.isArray(w.weights) ? w.weights.length : 0;
      return sum + weightsCount;
    }, 0);

    setTotalWeighings(total);
    setAverageWeight(parseFloat(avg.toFixed(2)));
    setBestWeight(parseFloat(best.toFixed(2)));
    setTotalAnimalsWeighed(totalAnimals);
  }, []);

  // Mettre à jour la liste des lots en fonction de la ferme sélectionnée
  useEffect(() => {
    if (selectedFarmId === "all") {
      setFilteredFlocks(flocks);
    } else {
      setFilteredFlocks(flocks.filter(flock => flock.farmId === selectedFarmId));
    }
    setSelectedFlockId("all");
  }, [selectedFarmId, flocks]);

  const loadWeighings = useCallback(async () => {
    if (selectedFlockId === "all" || selectedFlockId === "") {
      setWeighings([]);
      updateStats([]);
      return;
    }
    
    try {
      const data = await flocksAPI.getWeighings(selectedFlockId);
      const flock = flocks.find(f => f.id === selectedFlockId);
      const enriched = (data || []).map((w: Weighing) => ({
        ...w,
        weights: Array.isArray(w.weights) ? w.weights : [],
        flockName: flock?.name,
        farmId: flock?.farmId,
        farmName: farms.find(f => f.id === flock?.farmId)?.name
      }));
      setWeighings(enriched);
      updateStats(enriched);
    } catch (error) {
      console.error("Erreur chargement pesées:", error);
      setWeighings([]);
      updateStats([]);
    }
  }, [selectedFlockId, flocks, farms, updateStats]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const farmsData = await usersAPI.getMyAccessibleFarms();
        setFarms(farmsData || []);
        
        const allFlocks = await flocksAPI.getAll();
        const accessibleFlocks = (allFlocks || []).filter((flock: Flock) => 
          farmsData.some((f: Farm) => f.id === flock.farmId)
        );
        setFlocks(accessibleFlocks);
        setFilteredFlocks(accessibleFlocks);
        
        if (accessibleFlocks.length > 0) {
          setSelectedFlockId(accessibleFlocks[0].id);
        }
      } catch (error) {
        console.error("Erreur chargement initial:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedFlockId && selectedFlockId !== "all" && filteredFlocks.length > 0) {
      loadWeighings();
    }
  }, [selectedFlockId, loadWeighings]);

  const filteredWeighings = useMemo(() => {
    let filtered = [...weighings];
    if (startDate) {
      filtered = filtered.filter(w => new Date(w.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(w => new Date(w.date) <= new Date(endDate));
    }
    return filtered;
  }, [weighings, startDate, endDate]);

  const chartData = useMemo(() => {
    if (!filteredWeighings.length) return [];
    
    const sorted = [...filteredWeighings].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sorted.map(w => ({
      date: new Date(w.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      "Poids moyen": w.averageWeight,
      "Poids min": w.minWeight || 0,
      "Poids max": w.maxWeight || 0,
      fullDate: w.date
    }));
  }, [filteredWeighings]);

  const selectedFlockName = useMemo(() => {
    if (selectedFlockId === "all") return "Sélectionnez un lot";
    const flock = flocks.find(f => f.id === selectedFlockId);
    return flock?.name || "Chargement...";
  }, [selectedFlockId, flocks]);

  const handleRefresh = () => {
    if (selectedFlockId && selectedFlockId !== "all") {
      loadWeighings();
    }
  };

  const handleOpenWeighingForm = () => {
    const selectedFlock = flocks.find(f => f.id === selectedFlockId);
    if (selectedFlock) {
      setSelectedFlockForWeighing({
        id: selectedFlock.id,
        name: selectedFlock.name,
        quantity: selectedFlock.quantity || selectedFlock.quantity,
        age: selectedFlock.age || 0
      });
      setModalOpen(true);
    }
  };

  // frontend/src/pages/weighingpage.tsx
// Modifier handleWeighingSaved

const handleWeighingSaved = async (data: { 
  averageWeight: number; 
  sampleSize: number; 
  stdDeviation: number;
  weights: number[];
}) => {
  console.log("=== ENREGISTREMENT PESÉE ===");
  console.log("Données:", data);
  
  if (!selectedFlockForWeighing) {
    alert("Veuillez sélectionner un lot");
    return;
  }
  
  try {
    const result = await flocksAPI.recordWeighing(selectedFlockForWeighing.id, {
      average_weight: data.averageWeight,
      sample_size: data.sampleSize,
      weights: data.weights  // ← Envoyer les poids individuels
    });
    
    console.log("Réponse API:", result);
    alert(` Pesée enregistrée : ${data.averageWeight} kg`);
    
    setModalOpen(false);
    setSelectedFlockForWeighing(null);
    loadWeighings();
  } catch (error: any) {
    console.error("Erreur:", error);
    alert(` Erreur: ${error.response?.data?.detail || "Erreur inconnue"}`);
  }
};
  const handleFarmChange = (farmId: string) => {
    setSelectedFarmId(farmId);
    setSelectedFlockId("all");
    setWeighings([]);
    updateStats([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const statsCards = [
    { title: "Total pesées", value: totalWeighings, icon: Activity, color: "blue" },
    { title: "Poids moyen", value: `${averageWeight} kg`, icon: TrendingUp, color: "emerald" },
    { title: "Meilleur poids", value: `${bestWeight} kg`, icon: Weight, color: "orange" },
    { title: "Sujets pesés", value: totalAnimalsWeighed, icon: Users, color: "purple" }
  ];

  const farmOptions = farms.map(farm => ({ id: farm.id, name: farm.name }));

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des pesées</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi et analyse des performances pondérales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={selectedFlockId === "all"}>
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </Button>
          <Button 
            onClick={handleOpenWeighingForm} 
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            disabled={selectedFlockId === "all" || flocks.length === 0}
          >
            <Plus className="w-4 h-4" />
            Nouvelle pesée
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-180px">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ferme</label>
              <select
                value={selectedFarmId}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Toutes les fermes</option>
                {farmOptions.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>
            
            <div className="min-w-180px">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
              <select
                value={selectedFlockId}
                onChange={(e) => setSelectedFlockId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={filteredFlocks.length === 0}
              >
                <option value="all">-- Sélectionner un lot --</option>
                {filteredFlocks.map(flock => (
                  <option key={flock.id} value={flock.id}>{flock.name}</option>
                ))}
              </select>
              {filteredFlocks.length === 0 && selectedFarmId !== "all" && (
                <p className="text-xs text-amber-600 mt-1">Aucun lot dans cette ferme</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date au</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); }} className="gap-2">
              <Filter className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Graphique d'évolution */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du poids - {selectedFlockName}</CardTitle>
          {chartData.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {chartData.length} pesée(s) - Évolution sur {Math.ceil((new Date(chartData[chartData.length-1]?.fullDate || new Date()).getTime() - new Date(chartData[0]?.fullDate || new Date()).getTime()) / (1000*60*60*24))} jours
            </p>
          )}
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-gray-400">
              <Activity className="w-12 h-12 mb-3 opacity-50" />
              <p>Sélectionnez un lot pour voir la courbe d'évolution</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis stroke="#6b7280" unit=" kg" domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Poids moyen" 
                  stroke="#2E7D32" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: "#2E7D32", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                  name="Poids moyen"
                />
                <Line 
                  type="monotone" 
                  dataKey="Poids min" 
                  stroke="#1E88E5" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={{ r: 3 }}
                  name="Poids minimum"
                />
                <Line 
                  type="monotone" 
                  dataKey="Poids max" 
                  stroke="#FB8C00" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={{ r: 3 }}
                  name="Poids maximum"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tableau historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des pesées</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {filteredWeighings.length} pesée(s) trouvée(s)
          </p>
        </CardHeader>
        <CardContent>
          <WeighingHistoryTable 
            weighings={filteredWeighings}
            flocks={flocks}
            farms={farms}
            selectedFlockName={selectedFlockName}
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle pesée">
        {selectedFlockForWeighing && (
          <WeighingTab
            flockQuantity={selectedFlockForWeighing.quantity}
            flockAge={selectedFlockForWeighing.age}
            onSave={handleWeighingSaved}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}