import { useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { mockFarms, mockPoultryHouses, mockFlocks } from "../data/mockData";
import { Farm, PoultryHouse, Flock } from "../types";
import { FarmForm } from "../components/forms/farmForm";
import { useNavigate } from "react-router-dom";



export function FarmPage() {
  const [farms, setFarms] = useState(mockFarms);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm| null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleView = (sensor:Farm) => {setSelectedFarm(sensor);
      setDetailModalOpen(true);
  };
  // Calculs globaux
  const totalCapacity = farms.reduce((sum, farm) => sum + (farm.totalCapacity || 0), 0);
  const totalOccupancy = mockPoultryHouses.reduce((sum, house) => sum + house.currentOccupancy, 0);
  const occupancyRate = ((totalOccupancy / totalCapacity) * 100).toFixed(1);

  // Helper : nombre de salles par poulailler
  const getRoomsCount = (farmId: string) =>
    mockPoultryHouses.filter(h => h.farmId === farmId).length;

  // Helper : nombre de lots par poulailler
  const getFlocksCount = (farmId: string) =>
    mockFlocks.filter(f => f.farmId === farmId).length;

  // Helper : total sujets par poulailler
  const getTotalAnimals = (farmId: string) =>
    mockFlocks
      .filter(f => f.farmId === farmId)
      .reduce((sum, f) => sum + f.quantity, 0);

  // Helper : taux occupation poulailler
  const getOccupancyRate = (farmId: string) => {
    const capacity = farms.find(f => f.id === farmId)?.totalCapacity || 1;
    const occupancy = getTotalAnimals(farmId);
    return ((occupancy / capacity) * 100).toFixed(1);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setOpen(true);
};
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Gestion des poulaillers
          </h1>
          <p className="text-gray-600">
            Administration des bâtiments d'élevage
          </p>
        </div>
        <Button  onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
          Nouveau poulailler
        </Button>{open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
            <Button onClick={() => setOpen(false)}  className="absolute top-2 right-2 text-white" >
                ✕
            </Button>
                <FarmForm farm={selectedFarm} onClose={() => { setOpen(false); setSelectedFarm(null); }} />
            </div>
            </div>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Total poulaillers</p>
            <h2 className="text-3xl font-bold text-gray-900">{farms.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Capacité totale</p>
            <h2 className="text-3xl font-bold text-gray-900">{totalCapacity}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Occupation actuelle</p>
            <h2 className="text-3xl font-bold text-gray-900">{totalOccupancy}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-1">Taux d'occupation</p>
            <h2 className="text-3xl font-bold text-gray-900">{occupancyRate}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* GRILLE POULAILLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {farms.map((farm: Farm) => {
          const roomsCount = getRoomsCount(farm.id);
          const flocksCount = getFlocksCount(farm.id);
          const totalAnimals = getTotalAnimals(farm.id);
          const occupancyRate = getOccupancyRate(farm.id);

          return (
            <Card key={farm.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{farm.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{farm.address}</p>
                  </div>
                  {farm.active && (
                    <Badge variant="success">Actif</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Résumé */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Capacité</p>
                    <p className="font-semibold text-gray-900">{farm.totalCapacity}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Total sujets</p>
                    <p className="font-semibold text-gray-900">{totalAnimals}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Salles</p>
                    <p className="font-semibold text-gray-900">{roomsCount}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Lots actifs</p>
                    <p className="font-semibold text-gray-900">{flocksCount}</p>
                  </div>
                </div>

                {/* Barre occupation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Taux d'occupation</span>
                    <span className="font-semibold text-gray-900">{occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E7D32] transition-all"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {farm.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {farm.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/poultry-houses/${farm.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Parcourir
                  </Button>
                  <Button onClick={() => { setSelectedFarm(farm); setOpen(true); }} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                      <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button className="p-2 border bg-white  border-gray-300 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

