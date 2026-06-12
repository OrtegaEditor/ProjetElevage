import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { farmsAPI, poultryHousesAPI, flocksAPI, stockAPI, treatmentsAPI, vaccinationsAPI, bandsAPI } from "../../services/api";
import { StatsCards } from "@/components/specific/StatsCards";
import { QuickActions } from "@/components/specific/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/card";
import { DashboardActions } from "@/components/common/DashboardActions";
import { FarmFormDrawer } from "@/components/forms/farmForm";
import { PoultryHouseForm } from "@/components/forms/PoultryHousesForm";
import { InviteCollaboratorForm } from "@/components/forms/InviteCollaboratorForm";
import { RestockingForm } from "@/components/forms/RestockingForm";
import { Activity, Package, Building2, Rocket, PlusCircle, Truck, Package as PackageIcon, Apple, Home, TrendingUp, Users, AlertTriangle, ChevronRight, Syringe, Pill } from "lucide-react";
import { Button } from "@/components/common/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FarmWithDetails {
  id: string;
  name: string;
  address: string;
  poultryHouses: any[];
  activeFlocks: any[];
  totalAnimals: number;
  occupancyRate: number;
  avgWeight: number;
  growthData: { date: string; weight: number }[];
}

interface RecentEvent {
  id: string;
  farmId: string;
  farmName: string;
  type: "arrival" | "treatment" | "vaccination" | "stock_entry" | "stock_exit" | "house_created";
  title: string;
  description: string;
  quantity?: number;
  date: string;
}

interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState<FarmWithDetails[]>([]);
  const [criticalStock, setCriticalStock] = useState<StockItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalFarms: 0, totalHouses: 0, totalAnimals: 0, totalFlocks: 0 });
  const [hasFarm, setHasFarm] = useState(false);
  
  const [activeModal, setActiveModal] = useState<"farm" | "house" | "user" | "stock" | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [isFarmDrawerOpen, setIsFarmDrawerOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [farmsData, rawHousesData, flocksData, stockData, treatmentsData, vaccinationsData, bandsData] = await Promise.all([
        farmsAPI.getAll(),
        poultryHousesAPI.getAll(),
        flocksAPI.getAll(),
        stockAPI.getAll(),
        treatmentsAPI.getAll(),
        vaccinationsAPI.getAll(),
        bandsAPI.getAll()
      ]);

      console.log("Fermes:", farmsData);
      console.log("Salles brutes:", rawHousesData);

      // Normaliser les salles (camelCase)
      const housesData = (rawHousesData || []).map((house: any) => ({
        id: house.id,
        name: house.name,
        farmId: house.farmId || house.farm_id,
        capacity: house.capacity || 0,
        currentOccupancy: house.currentOccupancy || 0,
        poultryType: house.poultryType || house.poultry_type || "broiler",
        hasAutomation: house.hasAutomation || false,
        ventilationStatus: house.ventilationStatus || "auto",
        lightingStatus: house.lightingStatus || "auto",
        heatingStatus: house.heatingStatus || "auto",
        active: house.active !== false,
        description: house.description || "",
        createdAt: house.createdAt || house.created_at
      }));

      setHasFarm(farmsData && farmsData.length > 0);

      // Construire les données par ferme
      const farmsWithDetails: FarmWithDetails[] = await Promise.all((farmsData || []).map(async (farm: any) => {
        const farmHouses = housesData.filter((h: any) => h.farmId === farm.id);
        const farmFlocks = (flocksData || []).filter((f: any) => f.farmId === farm.id && f.status === "active");
        
        const totalCapacity = farmHouses.reduce((sum: number, h: any) => sum + (h.capacity || 0), 0);
        const totalOccupancy = farmFlocks.reduce((sum: number, f: any) => sum + (f.current_quantity || f.quantity || 0), 0);
        const occupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;
        
            const avgWeight = farmFlocks.length > 0 
              ? Number(
                  (
                    farmFlocks.reduce(
                      (sum: number, f: any) => sum + Number(f.averageWeight || 0),
                      0
                    ) / farmFlocks.length
                  ).toFixed(1)
                )
              : 0;
        
        // Données de croissance pour cette ferme
        const growthPoints: { date: string; weight: number }[] = [];
        for (const flock of farmFlocks.slice(0, 3)) {
          try {
            const weighingsData = await flocksAPI.getWeighings(flock.id);
            if (weighingsData && weighingsData.length > 0) {
              for (const weighing of weighingsData.slice(-10)) {
                growthPoints.push({
                  date: weighing.date || weighing.createdAt || new Date().toISOString(),
                  weight: Number(weighing.averageWeight ?? 0)
                });
              }
            }
          } catch (err) {
            console.error("Erreur chargement pesées:", err);
          }
        }
        
        // Grouper par date (prendre la moyenne si plusieurs pesées le même jour)
        const groupedByDate: { [key: string]: { total: number; count: number } } = {};
        for (const point of growthPoints) {
          const dateKey = point.date.split('T')[0];
          if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = { total: 0, count: 0 };
          }
          groupedByDate[dateKey].total += point.weight;
          groupedByDate[dateKey].count++;
        }
        
        const sortedGrowthPoints = Object.entries(groupedByDate)
          .map(([date, data]) => ({ date, weight: data.total / data.count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
          id: farm.id,
          name: farm.name,
          address: farm.address,
          poultryHouses: farmHouses,
          activeFlocks: farmFlocks,
          totalAnimals: totalOccupancy,
          occupancyRate: occupancyRate,
          avgWeight: avgWeight,
          growthData: sortedGrowthPoints
        };
      }));

      setFarms(farmsWithDetails);

      // Stats globales
      const totalHouses = farmsWithDetails.reduce((sum: number, f: FarmWithDetails) => sum + f.poultryHouses.length, 0);
      const totalAnimals = farmsWithDetails.reduce((sum: number, f: FarmWithDetails) => sum + f.totalAnimals, 0);
      const totalFlocks = farmsWithDetails.reduce((sum: number, f: FarmWithDetails) => sum + f.activeFlocks.length, 0);

      setGlobalStats({
        totalFarms: farmsWithDetails.length,
        totalHouses: totalHouses,
        totalAnimals: totalAnimals,
        totalFlocks: totalFlocks
      });

      // Stock critique
      const critical = (stockData || []).filter((s: any) => s.status === "critical" || s.status === "low");
      setCriticalStock(critical);

      // Événements récents
      const events: RecentEvent[] = [];

      for (const band of (bandsData || []).slice(-5)) {
        const farm = farmsData.find((f: any) => f.id === band.farmId);
        events.push({
          id: `band-${band.id}`,
          farmId: band.farmId,
          farmName: farm?.name || "Ferme inconnue",
          type: "arrival",
          title: "Nouvel arrivage",
          description: `${band.name} - ${band.quantity} sujets`,
          quantity: band.quantity,
          date: band.createdDate || band.created_at || new Date().toISOString()
        });
      }

      for (const treatment of (treatmentsData || []).slice(-5)) {
        const flock = flocksData.find((f: any) => f.id === treatment.flockId);
        const farm = farmsData.find((f: any) => f.id === flock?.farmId);
        events.push({
          id: `treatment-${treatment.id}`,
          farmId: flock?.farmId || "",
          farmName: farm?.name || "Ferme inconnue",
          type: "treatment",
          title: "Traitement médical",
          description: `${treatment.medication} - ${treatment.dosage}`,
          date: treatment.startDate || new Date().toISOString()
        });
      }

      for (const vaccin of (vaccinationsData || []).slice(-5)) {
        const flock = flocksData.find((f: any) => f.id === vaccin.flockId);
        const farm = farmsData.find((f: any) => f.id === flock?.farmId);
        events.push({
          id: `vaccin-${vaccin.id}`,
          farmId: flock?.farmId || "",
          farmName: farm?.name || "Ferme inconnue",
          type: "vaccination",
          title: "Vaccination",
          description: `${vaccin.vaccine} - ${vaccin.quantity} doses`,
          quantity: vaccin.quantity,
          date: vaccin.administrationDate || new Date().toISOString()
        });
      }

      for (const item of critical.slice(0, 3)) {
        events.push({
          id: `stock-${item.id}`,
          farmId: item.farmId || "",
          farmName: "Stock général",
          type: "stock_exit",
          title: "Stock critique",
          description: `${item.name} - ${item.quantity} ${item.unit} restants`,
          quantity: item.quantity,
          date: new Date().toISOString()
        });
      }

      const sortedEvents = events.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 15);
      
      setRecentEvents(sortedEvents);
      
      if (farmsData && farmsData.length > 0) {
        setSelectedFarmId(farmsData[0].id);
      }
      
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchDashboardData();
  const handleNotifications = () => navigate("/health-registry");
  const handleFarmCreated = () => {
    setIsFarmDrawerOpen(false);
    fetchDashboardData();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "arrival": return <Truck className="w-4 h-4 text-purple-600" />;
      case "treatment": return <Pill className="w-4 h-4 text-orange-600" />;
      case "vaccination": return <Syringe className="w-4 h-4 text-blue-600" />;
      case "stock_entry": return <PackageIcon className="w-4 h-4 text-green-600" />;
      case "stock_exit": return <PackageIcon className="w-4 h-4 text-red-600" />;
      case "house_created": return <Home className="w-4 h-4 text-emerald-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!loading && !hasFarm) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Bienvenue sur SYGEXA</h1>
            <p className="text-gray-600 mb-6">
              Pour profiter pleinement, 
              commencez par créer votre première ferme.
            </p>
            <Button onClick={() => setIsFarmDrawerOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg gap-2">
              <Building2 className="w-5 h-5" />
              Lancer ma première ferme
            </Button>
          </CardContent>
        </Card>
        <FarmFormDrawer open={isFarmDrawerOpen} onClose={() => setIsFarmDrawerOpen(false)} onSuccess={handleFarmCreated} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Données d'occupation pour toutes les salles
  const occupancyData = farms.flatMap(farm => 
    farm.poultryHouses.map(house => {
      const houseFlocks = farm.activeFlocks.filter((f: any) => f.poultryHouseId === house.id);
      const occupancy = houseFlocks.reduce((sum: number, f: any) => sum + (f.current_quantity || f.quantity || 0), 0);
      const rate = house.capacity > 0 ? (occupancy / house.capacity) * 100 : 0;
      return {
        id: house.id,
        farmName: farm.name,
        name: house.name,
        capacity: house.capacity,
        occupancy: occupancy,
        rate: rate
      };
    })
  );

  // Couleurs pour les courbes
  const colors = ["#2E7D32", "#2563EB", "#D97706", "#7C3AED", "#DC2626", "#0891B2", "#DB2777", "#65A30D"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre exploitation</p>
          </div>
          <DashboardActions onRefresh={handleRefresh} onNotifications={handleNotifications} notificationCount={criticalStock.length} />
        </div>

        {/* Stats Cards */}
        <StatsCards 
          totalHouses={globalStats.totalHouses}
          totalFlocks={globalStats.totalFlocks}
          totalAnimals={globalStats.totalAnimals}
          avgWeight={farms.reduce((sum, f) => sum + f.avgWeight, 0) / (farms.length || 1)}
        />

        {/* Quick Actions */}
        <QuickActions 
          onAddFarm={() => setActiveModal("farm")}
          onAddHouse={() => setActiveModal("house")}
          onAddArrival={() => navigate(`/arrival/new?farmId=${selectedFarmId}`)}
          onAddStock={() => setActiveModal("stock")}
          onManageUsers={() => setActiveModal("user")}
        />

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique d'occupation */}
          <Card>
            <CardHeader>
              <CardTitle>Occupation des salles</CardTitle>
              <p className="text-xs text-gray-500">Taux d'occupation par salle et par ferme</p>
            </CardHeader>
            <CardContent>
              {occupancyData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucune salle enregistrée</div>
              ) : (
                <div className="space-y-4">
                  {occupancyData.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-gray-400 ml-2">({item.farmName})</span>
                        </div>
                        <span className="text-gray-500">{item.rate.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500" 
                          style={{ width: `${Math.min(item.rate, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.occupancy.toLocaleString()} / {item.capacity.toLocaleString()} sujets
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graphique de croissance */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution du poids par ferme</CardTitle>
              <p className="text-xs text-gray-500">Suivi de la croissance - Une courbe par ferme</p>
            </CardHeader>
            <CardContent>
              {farms.length === 0 || farms.every(f => f.growthData.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune donnée de pesée disponible</p>
                  <p className="text-sm mt-1">Enregistrez des pesées pour voir l'évolution</p>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        type="category"
                        tickFormatter={(value) => new Date(value).toLocaleDateString("fr-FR")}
                      />
                      <YAxis
                        label={{ value: "Poids (kg)", angle: -90 }}
                        domain={[0, "auto"]}
                        tickFormatter={(value) => Number(value).toFixed(2)}
                      />

                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(2)} kg`,
                          "Poids moyen",
                        ]}
                      />
                      <Legend />
                      {farms.map((farm, index) => (
                        <Line
                          key={farm.id}
                          type="monotone" 
                          data={farm.growthData}
                          dataKey="weight" 
                          name={farm.name}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fermes détails avec bouton Gérer */}
        <div className="space-y-6">
          {farms.map((farm) => (
            <Card key={farm.id} className="overflow-hidden">
              <CardHeader className="bg-linear-to-r from-emerald-50 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{farm.name}</CardTitle>
                    <p className="text-sm text-gray-500">{farm.address}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/farms/${farm.id}/poultry-houses`)}>
                    Gérer <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Indicateurs clés de la ferme */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Home className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Salles</p>
                    <p className="text-lg font-semibold">{farm.poultryHouses.length}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Animaux</p>
                    <p className="text-lg font-semibold">{farm.totalAnimals.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Occupation</p>
                    <p className={`text-lg font-semibold ${farm.occupancyRate >= 80 ? 'text-green-600' : farm.occupancyRate >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                      {farm.occupancyRate.toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Poids moyen</p>
                    <p className="text-lg font-semibold">{farm.avgWeight.toFixed(1)} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stock critique */}
        {criticalStock.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Stock critique - Réapprovisionnement urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {criticalStock.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-red-600">{item.quantity} {item.unit} restants</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/stock")}>
                      Réapprovisionner
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Événements récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PlusCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="shrink-0 mt-0.5">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Ferme: {event.farmName}</p>
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(event.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {activeModal === "farm" && (
        <FarmFormDrawer open={true} onClose={() => setActiveModal(null)} onSuccess={() => { setActiveModal(null); fetchDashboardData(); }} />
      )}
      {activeModal === "house" && selectedFarmId && (
        <PoultryHouseForm open={true} onClose={() => setActiveModal(null)} onSuccess={() => { setActiveModal(null); fetchDashboardData(); }} preselectedFarmId={selectedFarmId} />
      )}
      {activeModal === "user" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Inviter un collaborateur</h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-500">✕</button>
            </div>
            <div className="p-4">
              <InviteCollaboratorForm onClose={() => setActiveModal(null)} onSubmit={() => setActiveModal(null)} />
            </div>
          </div>
        </div>
      )}
      {activeModal === "stock" && (
        <RestockingForm open={true} onClose={() => setActiveModal(null)} onSave={() => { setActiveModal(null); fetchDashboardData(); }} />
      )}
    </div>
  );
}