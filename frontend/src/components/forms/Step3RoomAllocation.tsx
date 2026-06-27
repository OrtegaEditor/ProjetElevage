import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { ChevronLeft, ChevronRight, Plus, Trash2, AlertCircle, Building2 } from "lucide-react";
import { poultryHousesAPI } from "../../services/api";
import type { BandData, VerificationData, RoomAllocation } from "../../pages/ArrivalWizardPage";

interface Step3RoomAllocationProps {
  farmId: string;
  bandData: BandData;
  verificationData: VerificationData;
  initialAllocations: RoomAllocation[];
  onDataChange: (allocations: RoomAllocation[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface PoultryHouse {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  active: boolean;
}

export function Step3RoomAllocation({ 
  farmId, 
  verificationData, 
  initialAllocations, 
  onDataChange, 
  onNext, 
  onPrev 
}: Step3RoomAllocationProps) {
  const [rooms, setRooms] = useState<PoultryHouse[]>([]);
  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const totalHealthy = verificationData.healthyQuantity;
  const allocatedTotal = allocations.reduce((sum, a) => sum + a.quantity, 0);
  const remaining = totalHealthy - allocatedTotal;
  
  useEffect(() => {
    loadRooms();
  }, [farmId]);
  
  useEffect(() => {
    if (initialAllocations.length > 0) {
      setAllocations(initialAllocations);
    }
  }, [initialAllocations]);
  
  const loadRooms = async () => {
    try {
      setLoading(true);
      const houses = await poultryHousesAPI.getByFarm(farmId, false);
      const activeRooms = (houses || []).filter((house: PoultryHouse) => house.active !== false);
      setRooms(activeRooms);
    } catch (err) {
      console.error("Erreur chargement salles:", err);
      setError("Impossible de charger les salles");
    } finally {
      setLoading(false);
    }
  };
  
  const addAllocation = () => {
    if (rooms.length === 0) return;
    
    const newAllocation: RoomAllocation = {
      poultryHouseId: rooms[0].id,
      poultryHouseName: rooms[0].name,
      quantity: 0,
      capacity: rooms[0].capacity,
      occupancyRate: 0,
    };
    setAllocations([...allocations, newAllocation]);
  };
  
  const removeAllocation = (index: number) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
    onDataChange(newAllocations);
  };
  
  const updateAllocation = (index: number, poultryHouseId: string, quantity: number) => {
    const selectedRoom = rooms.find(r => r.id === poultryHouseId);
    if (!selectedRoom) return;
    
    const newAllocations = [...allocations];
    const currentOccupancy = selectedRoom.currentOccupancy || 0;
    const maxAllowed = selectedRoom.capacity - currentOccupancy;
    
    newAllocations[index] = {
      ...newAllocations[index],
      poultryHouseId,
      poultryHouseName: selectedRoom.name,
      quantity: Math.min(quantity, maxAllowed),
      capacity: selectedRoom.capacity,
      occupancyRate: ((currentOccupancy + Math.min(quantity, maxAllowed)) / selectedRoom.capacity) * 100,
    };
    
    setAllocations(newAllocations);
    onDataChange(newAllocations);
  };
  
  const getAvailableRooms = (currentId: string) => {
    const usedIds = allocations.map(a => a.poultryHouseId).filter(id => id !== currentId);
    return rooms.filter(room => !usedIds.includes(room.id));
  };
  
  const validate = (): boolean => {
    if (allocations.length === 0) {
      setError("Veuillez répartir les sujets dans au moins une salle");
      return false;
    }
    if (remaining > 0) {
      setError(`Il reste ${remaining} sujet(s) à répartir`);
      return false;
    }
    if (remaining < 0) {
      setError(`Vous avez réparti ${Math.abs(remaining)} sujet(s) de trop`);
      return false;
    }
    setError(null);
    return true;
  };
  
  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement des salles...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Répartition dans les salles</h2>
        <p className="text-sm text-gray-500 mb-6">
          Répartissez les {totalHealthy.toLocaleString()} sujets sains dans les salles disponibles
        </p>
      </div>
      
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Sujets disponibles</p>
          <p className="text-xl font-bold text-gray-900">{totalHealthy.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500">Déjà répartis</p>
          <p className="text-xl font-bold text-emerald-700">{allocatedTotal.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg text-center ${remaining === 0 ? "bg-green-50" : "bg-orange-50"}`}>
          <p className="text-xs text-gray-500">Reste à répartir</p>
          <p className={`text-xl font-bold ${remaining === 0 ? "text-green-700" : "text-orange-700"}`}>
            {remaining.toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Liste des allocations */}
      <div className="space-y-4">
        {allocations.map((allocation, index) => {
          const selectedRoom = rooms.find(r => r.id === allocation.poultryHouseId);
          const currentOccupancy = selectedRoom?.currentOccupancy || 0;
          const maxAllowed = (selectedRoom?.capacity || 0) - currentOccupancy;
          const isOverCapacity = allocation.quantity > maxAllowed;
          
          return (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <label className="text-sm font-medium text-gray-700">Salle</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAllocation(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <select
                value={allocation.poultryHouseId}
                onChange={(e) => updateAllocation(index, e.target.value, allocation.quantity)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3"
              >
                <option value="">Sélectionner une salle</option>
                {getAvailableRooms(allocation.poultryHouseId).map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Capacité: {room.capacity.toLocaleString()})
                  </option>
                ))}
              </select>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Quantité à placer
                </label>
                <Input
                  type="number"
                  min={1}
                  max={maxAllowed}
                  value={allocation.quantity || ""}
                  onChange={(e) => updateAllocation(index, allocation.poultryHouseId, parseInt(e.target.value) || 0)}
                  className={isOverCapacity ? "border-red-500" : ""}
                />
                {selectedRoom && (
                  <div className="mt-2 text-xs">
                    <p className="text-gray-500">
                      Capacité restante: {(selectedRoom.capacity - currentOccupancy).toLocaleString()} sujets
                    </p>
                    {currentOccupancy > 0 && (
                      <p className="text-gray-500">
                        Occupation actuelle: {currentOccupancy.toLocaleString()} / {selectedRoom.capacity.toLocaleString()}
                      </p>
                    )}
                    {isOverCapacity && (
                      <p className="text-red-500 mt-1">
                        ⚠️ Dépasse la capacité restante de {maxAllowed.toLocaleString()} sujets
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bouton ajouter */}
      {rooms.length > allocations.length && (
        <Button
          type="button"
          variant="outline"
          onClick={addAllocation}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une salle
        </Button>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Pas de salles */}
      {rooms.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune salle disponible dans cette ferme</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = `/poultry-houses/farm/${farmId}`}>
            Créer une salle
          </Button>
        </div>
      )}
      
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button 
          type="button" 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleNext}
          disabled={rooms.length === 0 || allocations.length === 0}
        >
          Suivant
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}