import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/button";
import { ChevronLeft, Check, Building2, Package, Users, AlertCircle } from "lucide-react";
import { bandsAPI, flocksAPI, especesAPI, poultryHousesAPI } from "../../services/api";
import type { BandData, VerificationData, RoomAllocation } from "../../pages/ArrivalWizardPage";
import type { Farm } from "../../types";

interface Step4SummaryProps {
farm: Farm;
bandData: BandData;
verificationData: VerificationData;
allocations: RoomAllocation[];
onPrev: () => void;
onComplete: () => void;
}

export function Step4Summary({ farm, bandData, verificationData, allocations, onPrev, onComplete }: Step4SummaryProps) {
const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [especesMap, setEspecesMap] = useState<Record<string, string>>({});
const [roomsMap, setRoomsMap] = useState<Record<string, string>>({});

useEffect(() => {
const loadData = async () => {
    try {
    // Charger les espèces
    const especes = await especesAPI.getAll();
    const especesArray = Array.isArray(especes) ? especes : especes?.items || [];
    const eMap: Record<string, string> = {};
    especesArray.forEach((e: any) => { eMap[e.id] = e.name; });
    setEspecesMap(eMap);
    
    // Charger les salles
    const houses = await poultryHousesAPI.getByFarm(bandData.farmId, false);
    const hMap: Record<string, string> = {};
    (houses || []).forEach((h: any) => { hMap[h.id] = h.name; });
    setRoomsMap(hMap);
    } catch (err) {
    console.error("Erreur chargement données:", err);
    }
};
loadData();
}, [bandData.farmId]);

const totalPlaced = allocations.reduce((sum, a) => sum + a.quantity, 0);
const mortalityRate = verificationData.mortalityOnArrival > 0 
? ((verificationData.mortalityOnArrival / verificationData.receivedQuantity) * 100).toFixed(1)
: 0;

const handleSubmit = async () => {
  setLoading(true);
  setError(null);

  try {
    // 1. Créer la bande avec la note de mortalité
    const mortalityNote = verificationData.mortalityOnArrival > 0 
      ? `\nMortalité à l'arrivage: ${verificationData.mortalityOnArrival} sujets. ${verificationData.observations || ""}`
      : "";
    
    const bandResponse = await bandsAPI.create({
      name: bandData.name,
      farmId: bandData.farmId,
      especeId: bandData.especeId,
      quantity: verificationData.receivedQuantity,
      supplier: bandData.supplier || null,
      prixUnitaire: bandData.prixUnitaire || 0,
      restockDate: bandData.restockDate,
      notes: `${bandData.notes}${mortalityNote}`,
    });
    
    const bandId = bandResponse.id;
    const startDateObj = new Date(bandData.restockDate);
    startDateObj.setHours(12, 0, 0, 0);
    
    // 2. Créer les lots
    const createdFlocks: { id: string; quantity: number; poultryHouseName: string }[] = [];
    
    for (const allocation of allocations) {
      if (allocation.quantity <= 0) continue;
      
      const flockData = {
        name: `${bandData.name} - ${allocation.poultryHouseName}`,
        farmId: bandData.farmId,
        poultryHouseId: allocation.poultryHouseId,
        bandId: bandId,
        especeId: bandData.especeId,
        quantity: allocation.quantity,
        startDate: startDateObj.toISOString(),
        cycle: 1,
        age: 0,
        notes: `Lot issu de l'arrivage ${bandData.name}. ${verificationData.observations || ""}`,
      };
      
      const flock = await flocksAPI.create(flockData);
      createdFlocks.push({ 
        id: flock.id, 
        quantity: allocation.quantity,
        poultryHouseName: allocation.poultryHouseName
      });
    }
    
    // 3. Enregistrer la mortalité sur le premier lot 
    if (verificationData.mortalityOnArrival > 0 && createdFlocks.length > 0) {
      const firstFlock = createdFlocks[0];
      const causeMessage = `Mortalité ${bandData.name}`;
      
      try {
        await flocksAPI.recordMortality(firstFlock.id, {
          quantity: verificationData.mortalityOnArrival,
          cause: causeMessage
        });
        console.log(`Mortalité enregistrée pour le lot ${firstFlock.poultryHouseName}: ${verificationData.mortalityOnArrival} sujets`);
      } catch (mortalityErr) {
        console.error("Erreur lors de l'enregistrement de la mortalité:", mortalityErr);
      }
    }
    
    // 4. Redirection vers la page des salles - CORRECTION ICI
    if (onComplete) onComplete();
    
    // Redirection simple vers la page des salles de la ferme
    navigate(`/farms/${bandData.farmId}/poultry-houses`);
    
  } catch (err: any) {
    console.error("Erreur:", err);
    setError(err.response?.data?.detail || "Une erreur est survenue");
  } finally {
    setLoading(false);
  }
};
return (
<div className="space-y-6">
    <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-2">Récapitulatif de l'arrivage</h2>
    <p className="text-sm text-gray-500 mb-6">
        Vérifiez les informations avant validation
    </p>
    </div>
    
    {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
    </div>
    )}
    
    {/* Informations ferme */}
    <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Ferme</h3>
    </div>
    <p className="text-gray-800">{farm.name}</p>
    <p className="text-sm text-gray-500">{farm.address}</p>
    </div>
    
    {/* Informations bande */}
    <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
        <Package className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Informations arrivage</h3>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
        <p className="text-gray-500">Nom de la bande</p>
        <p className="font-medium text-gray-900">{bandData.name}</p>
        </div>
        <div>
        <p className="text-gray-500">Date d'arrivée</p>
        <p className="font-medium text-gray-900">{new Date(bandData.restockDate).toLocaleDateString("fr-FR")}</p>
        </div>
        <div>
        <p className="text-gray-500">Type de volaille</p>
        <p className="font-medium text-gray-900">{especesMap[bandData.especeId] || bandData.especeId}</p>
        </div>
        <div>
        <p className="text-gray-500">Fournisseur</p>
        <p className="font-medium text-gray-900">{bandData.supplier || "Non spécifié"}</p>
        </div>
    </div>
    </div>
    
    {/* Vérification des sujets */}
    <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Vérification des sujets</h3>
    </div>
    <div className="grid grid-cols-3 gap-3 text-center">
        <div>
        <p className="text-xs text-gray-500">Commandés</p>
        <p className="text-lg font-bold text-gray-900">{bandData.quantity.toLocaleString()}</p>
        </div>
        <div>
        <p className="text-xs text-gray-500">Reçus</p>
        <p className={`text-lg font-bold ${verificationData.receivedQuantity !== bandData.quantity ? "text-orange-600" : "text-gray-900"}`}>
            {verificationData.receivedQuantity.toLocaleString()}
        </p>
        </div>
        <div>
        <p className="text-xs text-gray-500">Mortalité</p>
        <p className="text-lg font-bold text-red-600">{verificationData.mortalityOnArrival.toLocaleString()}</p>
        {mortalityRate !== "0" && <p className="text-xs text-red-500">({mortalityRate}%)</p>}
        </div>
    </div>
    {verificationData.observations && (
        <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">Observations</p>
        <p className="text-sm text-gray-700 mt-1">{verificationData.observations}</p>
        </div>
    )}
    </div>
    
    {/* Répartition dans les salles */}
    <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="font-semibold text-gray-900 mb-3">Répartition dans les salles</h3>
    <div className="space-y-2">
        {allocations.map((allocation, index) => (
        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
            <div>
            <p className="font-medium text-gray-900">{roomsMap[allocation.poultryHouseId] || allocation.poultryHouseName}</p>
            <p className="text-xs text-gray-500">
                Capacité: {allocation.capacity.toLocaleString()} | Occupation: {allocation.occupancyRate.toFixed(0)}%
            </p>
            </div>
            <p className="font-semibold text-emerald-700">{allocation.quantity.toLocaleString()} sujets</p>
        </div>
        ))}
    </div>
    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
        <p className="font-medium text-gray-900">Total réparti</p>
        <p className="font-bold text-emerald-700">{totalPlaced.toLocaleString()} sujets</p>
    </div>
    {verificationData.healthyQuantity - totalPlaced !== 0 && (
        <p className="text-xs text-orange-600 mt-2 text-right">
        {verificationData.healthyQuantity - totalPlaced} sujet(s) non répartis
        </p>
    )}
    </div>
    
    {/* Message info mortalité */}
    {verificationData.mortalityOnArrival > 0 && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
        {verificationData.mortalityOnArrival} sujet(s) mort(s) à l'arrivage seront enregistrés dans la première salle.
        </p>
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
        onClick={handleSubmit}
        disabled={loading || totalPlaced !== verificationData.healthyQuantity}
    >
        {loading ? (
        <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Création en cours...
        </>
        ) : (
        <>
            <Check className="w-4 h-4 mr-2" />
            Valider l'arrivage
        </>
        )}
    </Button>
    </div>
</div>
);
}