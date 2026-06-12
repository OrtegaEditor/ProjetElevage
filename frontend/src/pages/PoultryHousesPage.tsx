import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Home, Users, Weight, Thermometer, Sun, Wind, ChevronRight, Plus, RefreshCw, AlertCircle, Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { Select } from "../components/common/select";
import { poultryHousesAPI, farmsAPI, flocksAPI } from "../services/api";
import { PoultryHouseForm } from "@/components/forms/PoultryHousesForm";
import { BandFormDrawer } from "../components/forms/BandFormDrawer";
import type { PoultryHouse, Farm, Flock } from "../types";

interface PoultryHouseWithFlock extends PoultryHouse {
  active_flock?: {
    id: string;
    name: string;
    quantity: number;
    age: number;
    average_weight: number;
    status: string;
  } | null;
  recent_flocks?: Flock[];
}

export function PoultryHousesPage() {
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId: string }>();
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [poultryHouses, setPoultryHouses] = useState<PoultryHouseWithFlock[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour les Drawers
  const [isHouseFormOpen, setIsHouseFormOpen] = useState(false);
  const [isBandFormOpen, setIsBandFormOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<PoultryHouse | null>(null);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPoultryType, setFilterPoultryType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAutomation, setFilterAutomation] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (farmId) {
      fetchData();
    }
  }, [farmId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const farmsData = await farmsAPI.getAll();
      const currentFarm = farmsData.find((farm: Farm) => farm.id === farmId);
      
      if (!currentFarm) {
        setError("Ferme non trouvée");
        setLoading(false);
        return;
      }
      
      setFarm(currentFarm);
      
      const housesData = await poultryHousesAPI.getByFarm(farmId!);
      console.log("Houses data:", housesData);
      
      if (!housesData || !Array.isArray(housesData)) {
        console.error("housesData n'est pas un tableau:", housesData);
        setPoultryHouses([]);
        setLoading(false);
        return;
      }
      
      const allFlocks = await flocksAPI.getAll();
      const farmFlocks = allFlocks.filter((flock: Flock) => flock.farmId === farmId);
      setFlocks(farmFlocks);

      
      const enrichedHouses = housesData.map((house: PoultryHouse) => {
        
        // Trouver TOUS les lots actifs dans cette salle
        const activeFlocksInHouse = farmFlocks.filter(
          (flock: Flock) => flock.poultryHouseId === house.id && flock.status === "active"
        );
        
        
        // Calculer l'occupation totale à partir des lots actifs
        const totalOccupancy = activeFlocksInHouse.reduce((sum, flock) => sum + (flock.quantity || 0), 0);
        
        // Prendre le premier lot actif comme "active_flock" (pour l'affichage)
        const activeFlock = activeFlocksInHouse.length > 0 ? activeFlocksInHouse[0] : null;
        
        const recentFlocks = farmFlocks
          .filter((flock: Flock) => flock.poultryHouseId === house.id)
          .sort((a: Flock, b: Flock) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);
        
        return {
          ...house,
          capacity: house.capacity || 0,
          currentOccupancy: totalOccupancy, // ← CORRECTION ICI
          hasAutomation: house.hasAutomation || false,
          ventilationStatus: house.ventilationStatus || "auto",
          lightingStatus: house.lightingStatus || "auto",
          heatingStatus: house.heatingStatus || "auto",
          active: house.active !== false,
          poultryType: house.poultryType || "broiler",
          active_flock: activeFlock ? {
            id: activeFlock.id,
            name: activeFlock.name || "Lot inconnu",
            quantity: activeFlock.quantity || 0,
            age: activeFlock.age || 0,
            average_weight: activeFlock.averageWeight || 0,
            status: activeFlock.status || "active"
          } : null,
          recent_flocks: recentFlocks
        };
      });
      
      setPoultryHouses(enrichedHouses);
      
    } catch (err: any) {
      console.error("Erreur chargement des données:", err);
      setError(err.response?.data?.detail || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleViewPoultryHouse = (flockId: string) => {
    navigate(`/flocks/${flockId}`);
  };

  const handleCreatePoultryHouse = () => {
    setSelectedHouse(null);
    setIsHouseFormOpen(true);
  };

  const handleEditPoultryHouse = (house: PoultryHouse) => {
    setSelectedHouse(house);
    setIsHouseFormOpen(true);
  };

  const handleCreateBand = () => {
    setIsBandFormOpen(true);
  };

  const handleHouseFormSuccess = () => {
    fetchData();
    setIsHouseFormOpen(false);
    setSelectedHouse(null);
  };

  const handleBandFormSuccess = () => {
    fetchData();
    setIsBandFormOpen(false);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilterPoultryType("all");
    setFilterStatus("all");
    setFilterAutomation("all");
  };

  // Application des filtres
  const filteredHouses = useMemo(() => {
    let filtered = [...poultryHouses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(house => 
        house.name?.toLowerCase().includes(term) ||
        house.poultryType?.toLowerCase().includes(term)
      );
    }
    
    if (filterPoultryType !== "all") {
      filtered = filtered.filter(house => house.poultryType === filterPoultryType);
    }
    
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter(house => house.active === isActive);
    }
    
    if (filterAutomation !== "all") {
      const hasAuto = filterAutomation === "yes";
      filtered = filtered.filter(house => house.hasAutomation === hasAuto);
    }
    
    return filtered;
  }, [poultryHouses, searchTerm, filterPoultryType, filterStatus, filterAutomation]);

  const stats = useMemo(() => {
    const totalHouses = filteredHouses.length;
    const totalCapacity = filteredHouses.reduce((sum: number, h: PoultryHouseWithFlock) => sum + (h.capacity || 0), 0);
    const automatedHouses = filteredHouses.filter((h: PoultryHouseWithFlock) => h.hasAutomation).length;
    const activeFlocks = filteredHouses.filter((h: PoultryHouseWithFlock) => h.active_flock).length;
    const totalOccupancy = filteredHouses.reduce((sum: number, h: PoultryHouseWithFlock) => sum + (h.currentOccupancy || 0), 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity * 100).toFixed(1) : "0";
    
    return {
      totalHouses,
      totalCapacity,
      automatedHouses,
      activeFlocks,
      totalOccupancy,
      occupancyRate
    };
  }, [filteredHouses]);

  const getPoultryTypeLabel = (type: string) => {
    switch (type) {
      case "broiler": return "Poulets de chair";
      case "layer": return "Poules pondeuses";
      case "turkey": return "Dindes";
      case "duck": return "Canards";
      case "goose": return "Oies";
      default: return type || "Non spécifié";
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    if (!capacity || capacity === 0) return "text-gray-600";
    const rate = (occupancy / capacity) * 100;
    if (rate >= 90) return "text-red-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const uniquePoultryTypes = useMemo(() => {
    const types = new Set(poultryHouses.map(h => h.poultryType).filter(Boolean));
    return Array.from(types);
  }, [poultryHouses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <div className="flex gap-3 mt-4 justify-center">
            <Button variant="primary" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button variant="outline" onClick={() => navigate("/farms")}>
              Retour aux fermes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Ferme non trouvée</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate("/farms")}>
          Retour aux fermes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/farms")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{farm.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? "Masquer filtres" : "Afficher filtres"}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>
          <Button onClick={handleCreatePoultryHouse} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle salle
          </Button>
          <Button onClick={() => navigate(`/arrival/new?farmId=${farmId}`)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            Arrivage
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Panneau des filtres */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres
              </h3>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
                Réinitialiser
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de volaille
                </label>
                <Select
                  value={filterPoultryType}
                  onChange={(e) => setFilterPoultryType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="broiler">Poulets de chair</option>
                  <option value="layer">Poules pondeuses</option>
                  <option value="turkey">Dindes</option>
                  <option value="duck">Canards</option>
                  <option value="goose">Oies</option>
                  {uniquePoultryTypes.map(type => (
                    type && !["broiler", "layer", "turkey", "duck", "goose"].includes(type) && (
                      <option key={type} value={type}>{getPoultryTypeLabel(type)}</option>
                    )
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="active">Actives</option>
                  <option value="inactive">Inactives</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Automatisation
                </label>
                <Select
                  value={filterAutomation}
                  onChange={(e) => setFilterAutomation(e.target.value)}
                >
                  <option value="all">Toutes</option>
                  <option value="yes">Automatisées</option>
                  <option value="no">Non automatisées</option>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques filtrées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total salles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHouses}</p>
                {poultryHouses.length !== stats.totalHouses && (
                  <p className="text-xs text-gray-400">Sur {poultryHouses.length} total</p>
                )}
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Capacité totale</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCapacity.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Taux occupation</p>
                <p className="text-2xl font-bold text-blue-600">{stats.occupancyRate}%</p>
              </div>
              <Weight className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Lots actifs</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.activeFlocks}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des salles filtrées */}
      {filteredHouses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm || filterPoultryType !== "all" || filterStatus !== "all" || filterAutomation !== "all"
              ? "Aucune salle ne correspond aux critères de recherche"
              : "Aucune salle dans cette ferme"}
          </p>
          {(searchTerm || filterPoultryType !== "all" || filterStatus !== "all" || filterAutomation !== "all") && (
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Effacer les filtres
            </Button>
          )}
          {!searchTerm && filterPoultryType === "all" && filterStatus === "all" && filterAutomation === "all" && (
            <Button variant="primary" className="mt-4" onClick={handleCreatePoultryHouse}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre première salle
            </Button>
          )}
        </div>
      ) : (
        <>
          {(searchTerm || filterPoultryType !== "all" || filterStatus !== "all" || filterAutomation !== "all") && (
            <div className="text-sm text-gray-500">
              {filteredHouses.length} salle(s) trouvée(s)
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => {
              const capacity = house.capacity || 0;
              const currentOccupancy = house.currentOccupancy || 0;
              const occupancyRate = capacity > 0 ? (currentOccupancy / capacity) * 100 : 0;
              const occupancyColor = getOccupancyColor(currentOccupancy, capacity);
              
              return (
                <Card key={house.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{house.name || "Salle sans nom"}</CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          {getPoultryTypeLabel(house.poultryType)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {house.hasAutomation && (
                          <Badge variant="success">Auto</Badge>
                        )}
                        {!house.active && (
                          <Badge variant="warning">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Capacité et occupation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Capacité</p>
                        <p className="font-semibold">{capacity.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Occupation</p>
                        <p className={`font-semibold ${occupancyColor}`}>
                          {currentOccupancy.toLocaleString()} ({occupancyRate.toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                    
                    {/* Statuts ventilation, éclairage, chauffage */}
                    <div className="flex justify-around py-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs" title="Ventilation">
                        <Wind className="w-3 h-3 text-blue-500" />
                        <span className="text-gray-600">{house.ventilationStatus || "auto"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" title="Éclairage">
                        <Sun className="w-3 h-3 text-yellow-500" />
                        <span className="text-gray-600">{house.lightingStatus || "auto"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" title="Chauffage">
                        <Thermometer className="w-3 h-3 text-red-500" />
                        <span className="text-gray-600">{house.heatingStatus || "auto"}</span>
                      </div>
                    </div>
                    
                    {/* Lot actif */}
                    {house.active_flock ? (
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-emerald-700 mb-2">Lot actif</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm">{house.active_flock.name}</p>
                            <p className="text-xs text-gray-500">
                              {house.active_flock.quantity.toLocaleString()} sujets • {house.active_flock.age} jours
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                              Poids moyen: {house.active_flock.average_weight} kg
                            </p>
                          </div>
                          <Badge variant="success">Actif</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500">Aucun lot actif</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => handleEditPoultryHouse(house)}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => house.active_flock && handleViewPoultryHouse(house.active_flock.id)}
                        disabled={!house.active_flock}
                      >
                        <Eye className="w-4 h-4" />
                        Voir lot
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Drawer pour la création/modification de salle */}
      <PoultryHouseForm
        open={isHouseFormOpen}
        onClose={() => {
          setIsHouseFormOpen(false);
          setSelectedHouse(null);
        }}
        onSuccess={handleHouseFormSuccess}
        initialData={selectedHouse || undefined}
        preselectedFarmId={farmId}
      />

      {/* Drawer pour l'arrivage (création de bande) */}
      <BandFormDrawer
        open={isBandFormOpen}
        onClose={() => setIsBandFormOpen(false)}
        onSuccess={handleBandFormSuccess}
        preselectedFarmId={farmId}
      />
    </div>
  );
}