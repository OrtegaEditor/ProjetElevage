import { useState, useEffect } from "react";
import { Calculator, Package } from "lucide-react";
import { Input } from "../common/input";
import { Select } from "../common/select";
import { Button } from "../common/button";
import { stockAPI } from "../../services/api";

interface FeedingTabProps {
  flockId: string;
  flockName?: string;
  flockAge: number;
  flockQuantity: number;
  farmId?: string;
  onSave: (data: { feedType: string; quantityKg: number; stockItemId: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_threshold: number;
  status: string;
}

export function FeedingTab({ 
  flockId,
  flockName,  
  flockAge, 
  flockQuantity,
  farmId,
  onSave, 
  onCancel, 
  loading: externalLoading 
}: FeedingTabProps) {
  const [loading, setLoading] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [checkingStock, setCheckingStock] = useState(false);
  
  // États pour les aliments en stock
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  
  // Charger les aliments en stock
  useEffect(() => {
    if (farmId) {
      loadStockItems();
    }
  }, [farmId]);
  
  const loadStockItems = async () => {
    if (!farmId) return;
    
    setIsLoadingStock(true);
    try {
      const data = await stockAPI.getAll({ farmId, category: "feed" });
      console.log("Données brutes stockAPI:", data);
      
      // Normalisation des données
      let itemsArray: any[] = [];
      if (Array.isArray(data)) {
        itemsArray = data;
      } else if (data?.items && Array.isArray(data.items)) {
        itemsArray = data.items;
      } else if (data?.data && Array.isArray(data.data)) {
        itemsArray = data.data;
      }
      
      // Normaliser les champs
      const normalizedItems: StockItem[] = itemsArray.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_threshold: item.min_threshold || item.minThreshold || 0,
        status: item.status
      }));
      
      console.log("Aliments en stock (normalisés):", normalizedItems);
      setStockItems(normalizedItems);
      
      if (normalizedItems.length > 0 && !selectedStockItem) {
        setSelectedStockItem(normalizedItems[0]);
      }
    } catch (error) {
      console.error("Erreur chargement des stocks:", error);
    } finally {
      setIsLoadingStock(false);
    }
  };
  
  const getSuggestedFeedType = (): 'starter' | 'grower' | 'finisher' => {
    if (flockAge < 10) return 'starter';
    if (flockAge < 24) return 'grower';
    return 'finisher';
  };

  const getSuggestedQuantity = () => {
    if (flockAge < 10) return Math.round(flockQuantity * 0.04);
    if (flockAge < 24) return Math.round(flockQuantity * 0.12);
    return Math.round(flockQuantity * 0.18);
  };

  const [feedType, setFeedType] = useState<'starter' | 'grower' | 'finisher'>(getSuggestedFeedType());
  const [quantity, setQuantity] = useState(getSuggestedQuantity());

  const applySuggestion = () => {
    setFeedType(getSuggestedFeedType());
    setQuantity(getSuggestedQuantity());
  };

  const getFeedTypeName = (type: string): string => {
    const names = {
      starter: 'Aliment démarrage',
      grower: 'Aliment croissance',
      finisher: 'Aliment finition'
    };
    return names[type as keyof typeof names];
  };

  const getFeedTypeLabel = (type: string) => {
    const labels = {
      starter: 'Démarrage (0-10 jours) - Protéines 22%',
      grower: 'Croissance (11-24 jours) - Protéines 19%',
      finisher: 'Finition (25+ jours) - Protéines 17%'
    };
    return labels[type as keyof typeof labels];
  };

  const handleStockItemChange = (stockItemId: string) => {
    const item = stockItems.find(i => i.id === stockItemId);
    setSelectedStockItem(item || null);
    console.log("Aliment sélectionné:", item);
  };

  const handleSubmit = async () => {
    console.log("=== DÉBUT handleSubmit ===");
    console.log("quantity:", quantity);
    console.log("feedType:", feedType);
    console.log("farmId:", farmId);
    console.log("flockId:", flockId);
    console.log("selectedStockItem:", selectedStockItem);
    
    if (quantity <= 0) {
      alert("Veuillez saisir une quantité valide");
      return;
    }
    
    if (!selectedStockItem) {
      alert("Veuillez sélectionner un aliment en stock");
      return;
    }
    
    if (!farmId) {
      console.warn("Pas de farmId, on enregistre sans vérification");
      onSave({ 
        feedType, 
        quantityKg: quantity,
        stockItemId: selectedStockItem.id 
      });
      return;
    }
    
    setCheckingStock(true);
    
    try {
      console.log("Vérification du stock avec ID:", selectedStockItem.id);
      console.log("Stock actuel:", selectedStockItem.quantity, selectedStockItem.unit);
      
      if (selectedStockItem.quantity >= quantity) {
        console.log("✅ STOCK SUFFISANT - Enregistrement");
        setCheckingStock(false);
        onSave({ 
          feedType, 
          quantityKg: quantity,
          stockItemId: selectedStockItem.id 
        });
      } else {
        const shortage = quantity - selectedStockItem.quantity;
        const message = `⚠️ Stock insuffisant: besoin de ${quantity} ${selectedStockItem.unit}, disponible: ${selectedStockItem.quantity} ${selectedStockItem.unit}. Manque: ${shortage} ${selectedStockItem.unit}`;
        console.log("❌ STOCK INSUFFISANT - Affichage du modal", message);
        setStockMessage(message);
        setShowRestockDialog(true);
        setCheckingStock(false);
        return;
      }
      
    } catch (error: any) {
      console.error("❌ ERREUR lors de la vérification:", error);
      setStockMessage(error.message || "Erreur de vérification du stock");
      setShowRestockDialog(true);
      setCheckingStock(false);
    }
    
    console.log("=== FIN handleSubmit ===");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">
          Distribution d'aliments {flockName && `- ${flockName}`}
        </h3>
      </div>

      {/* Sélection de l'aliment en stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Aliment en stock *
        </label>
        {isLoadingStock ? (
          <div className="text-gray-500 text-sm">Chargement des stocks...</div>
        ) : stockItems.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
            Aucun aliment trouvé dans le stock. 
            <button 
              onClick={() => window.location.href = `/stock?action=add&category=feed`}
              className="ml-2 underline font-medium"
            >
              Ajouter un aliment
            </button>
          </div>
        ) : (
          <Select
            value={selectedStockItem?.id || ""}
            onChange={(e) => handleStockItemChange(e.target.value)}
            className="w-full"
          >
            {stockItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - Stock: {item.quantity} {item.unit} 
                {item.quantity <= item.min_threshold && " ⚠️"}
              </option>
            ))}
          </Select>
        )}
        
        {/* Affichage du stock actuel */}
        {selectedStockItem && (
          <div className={`mt-2 text-sm p-2 rounded ${
            selectedStockItem.quantity <= selectedStockItem.min_threshold 
              ? "bg-red-50 text-red-700" 
              : "bg-gray-50 text-gray-600"
          }`}>
            <span className="font-medium">Stock actuel:</span> {selectedStockItem.quantity} {selectedStockItem.unit}
            {selectedStockItem.quantity <= selectedStockItem.min_threshold && (
              <span className="ml-2">⚠️ Stock bas (seuil: {selectedStockItem.min_threshold})</span>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Distribution</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'aliment
            </label>
            <Select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value as any)}
            >
              <option value="starter">Démarrage (0-10 jours)</option>
              <option value="grower">Croissance (11-24 jours)</option>
              <option value="finisher">Finition (25+ jours)</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{getFeedTypeLabel(feedType)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité à distribuer (kg)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Quantité en kg"
                min={0}
                step={5}
              />
              <Button variant="outline" onClick={applySuggestion}>
                Suggestion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandation */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <Calculator className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Recommandation du jour</p>
            <p className="text-blue-800">
              Pour un lot de {flockAge} jours: <strong>{getFeedTypeName(getSuggestedFeedType())}</strong>
            </p>
            <p className="text-blue-800">
              Quantité suggérée: <strong>{getSuggestedQuantity()} kg</strong> 
              ({Math.round(getSuggestedQuantity() / flockQuantity * 1000)} g/sujet)
            </p>
          </div>
        </div>
      </div>

      {/* Consommation totale estimée */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Consommation moyenne par sujet depuis le début: 
          <strong className="ml-1">
            {Math.round((flockAge * 0.12 * 1000))} g
          </strong>
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || externalLoading || checkingStock || quantity === 0 || !selectedStockItem || isLoadingStock} 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {checkingStock ? "Vérification..." : (loading || externalLoading) ? "Enregistrement..." : "Enregistrer l'alimentation"}
        </Button>
      </div>

      {/* MODAL DE REAPPROVISIONNEMENT */}
      {showRestockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock insuffisant</h3>
            <p className="text-gray-600 mb-4">{stockMessage}</p>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setShowRestockDialog(false);
                  setStockMessage("");
                }}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowRestockDialog(false);
                  window.location.href = `/stock?action=add&category=feed&name=${encodeURIComponent(selectedStockItem?.name || getFeedTypeName(feedType))}`;
                }}
              >
                Réapprovisionner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}