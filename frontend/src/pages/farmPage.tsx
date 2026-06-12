import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Eye, Building2, MapPin, Users, ChevronRight, Pencil } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { farmsAPI } from "../services/api";
import { FarmFormDrawer } from "../components/forms/farmForm";
import type { Farm, PoultryType } from "../types";

export function FarmsPage() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoultryType, setSelectedPoultryType] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const farmsData = await farmsAPI.getAll();
      
      // Normalisation des données (snake_case -> camelCase)
      const normalizedFarms: Farm[] = (farmsData || []).map((farm: any) => ({
        id: farm.id,
        name: farm.name,
        address: farm.address,
        description: farm.description || "",
        poultry_types: farm.poultry_types || farm.poultryTypes || [],
        totalCapacity: farm.total_capacity || farm.totalCapacity || 0,
        managerId: farm.manager_id || farm.managerId,
        createdAt: farm.created_at || farm.createdAt || new Date().toISOString(),
        active: farm.active !== false,
      }));
      
      setFarms(normalizedFarms);
    } catch (error) {
      console.error("Erreur chargement des fermes:", error);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFarm = (farmId: string) => {
    navigate(`/farms/${farmId}/poultry-houses`);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsDrawerOpen(true);
  };

  const handleCreateFarm = () => {
    setSelectedFarm(null);
    setIsDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    fetchFarms();
    setIsDrawerOpen(false);
    setSelectedFarm(null);
  };

  const uniquePoultryTypes = useMemo(() => {
    const types = new Set<string>();
    farms.forEach((farm) => {
      farm.poultry_types?.forEach((type) => {
        types.add(type);
      });
    });
    return Array.from(types);
  }, [farms]);

  const filteredFarms = useMemo(() => {
    let filtered = [...farms];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(term) ||
        farm.address?.toLowerCase().includes(term)
      );
    }
    
    if (selectedPoultryType) {
      filtered = filtered.filter(farm => {
        const types = farm.poultry_types;
        return types && types.includes(selectedPoultryType as PoultryType);
      });
    }
    
    if (statusFilter === "active") {
      filtered = filtered.filter(farm => farm.active === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(farm => farm.active === false);
    }
    
    return filtered;
  }, [farms, searchTerm, selectedPoultryType, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des fermes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes fermes</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos fermes et leurs infrastructures</p>
        </div>
        <Button onClick={handleCreateFarm} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle ferme
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-200px">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou adresse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            <select
              title="Filtrer par type de volaille"
              value={selectedPoultryType}
              onChange={(e) => setSelectedPoultryType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Tous les types</option>
              {uniquePoultryTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "broiler" ? "Poulets de chair" :
                    type === "layer" ? "Poules pondeuses" :
                    type === "turkey" ? "Dindes" :
                    type === "duck" ? "Canards" : "Oies"}
                </option>
              ))}
            </select>
            
            <select
              title="Filtrer par statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fermes */}
      {filteredFarms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune ferme trouvée</p>
          <Button variant="primary" className="mt-4" onClick={handleCreateFarm}>
            <Plus className="w-4 h-4 mr-2" />
            Créer votre première ferme
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => {
            const poultryTypes = farm.poultry_types;
            const capacity = farm.totalCapacity || 0;
            
            return (
              <Card 
                key={farm.id} 
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      <CardTitle className="text-lg font-semibold">{farm.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-8 w-8 text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFarm(farm);
                        }}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Badge variant={farm.active ? "success" : "warning"}>
                        {farm.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              
                <CardContent className="space-y-4">
                  {farm.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{farm.address}</span>
                    </div>
                  )}
                  
                  {poultryTypes && poultryTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {poultryTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type === "broiler" ? "Poulets" :
                            type === "layer" ? "Pondeuses" :
                            type === "turkey" ? "Dindes" :
                            type === "duck" ? "Canards" : "Oies"}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {farm.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{farm.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>Capacité: {capacity > 0 ? capacity.toLocaleString() : "Non définie"}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-emerald-600"
                      onClick={() => handleOpenFarm(farm.id)}
                    >
                      Ouvrir
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drawer pour création/modification */}
      <FarmFormDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFarm(null);
        }}
        onSuccess={handleDrawerSuccess}
        initialData={selectedFarm}
      />
    </div>
  );
}