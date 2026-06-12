import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, Search } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Input } from "../components/common/input";
import { Select } from "../components/common/select";
import { stockAPI } from "../services/api";
import type { StockMovement, StockItem } from "../types";

export function StockMovementsPage() {
const navigate = useNavigate();
const [movements, setMovements] = useState<StockMovement[]>([]);
const [stockItems, setStockItems] = useState<StockItem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedStockId, setSelectedStockId] = useState<string>("");
const [filterType, setFilterType] = useState<string>("");
const [searchTerm, setSearchTerm] = useState("");

// Charger les données - fonction définie DANS le useEffect
useEffect(() => {
const loadData = async () => {
    try {
    setLoading(true);
    setError(null);
    
    const movementsData = await stockAPI.getMovements(selectedStockId || undefined, 500);
    console.log("Mouvements reçus:", movementsData);
    
    const stockData = await stockAPI.getAll();
    setStockItems(stockData || []);
    
    const normalizedMovements = (movementsData || []).map((m: any) => ({
        id: m.id,
        stockItemId: m.stockItemId || m.stock_item_id,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        date: m.movementDate || m.movement_date,
        referenceId: m.referenceId || m.reference_id,
        referenceName: m.referenceName || m.reference_name,
        operatorId: m.operatorId || m.operator_id,
        operatorName: m.operatorName || m.operator_name,
        comment: m.comment
    }));
    
    setMovements(normalizedMovements);
    } catch (err: any) {
    console.error("Erreur chargement:", err);
    setError("Erreur de chargement des mouvements");
    setMovements([]);
    } finally {
    setLoading(false);
    }
};

loadData();
}, [selectedStockId]); // ← SEULE dépendance = selectedStockId

const getMovementIcon = (type: string) => {
switch (type) {
    case "entry": return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
    case "exit": return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    default: return <RefreshCw className="w-4 h-4 text-amber-600" />;
}
};

const getMovementLabel = (type: string) => {
switch (type) {
    case "entry": return "Entrée";
    case "exit": return "Sortie";
    case "adjustment": return "Ajustement";
    default: return type;
}
};

const getStockItemName = (stockItemId: string) => {
const item = stockItems.find(s => s.id === stockItemId);
return item?.name || "Article inconnu";
};

const refreshData = () => {
// Déclencher un rechargement en modifiant selectedStockId ou en appelant directement
setSelectedStockId(prev => prev);
// Alternative: recharger manuellement
const loadData = async () => {
    setLoading(true);
    try {
    const movementsData = await stockAPI.getMovements(selectedStockId || undefined, 500);
    const stockData = await stockAPI.getAll();
    setStockItems(stockData || []);
    const normalizedMovements = (movementsData || []).map((m: any) => ({
        id: m.id,
        stockItemId: m.stockItemId || m.stock_item_id,
        type: m.type,
        quantity: m.quantity,
        unit: m.unit,
        date: m.movementDate || m.movement_date,
        referenceId: m.referenceId || m.reference_id,
        referenceName: m.referenceName || m.reference_name,
        operatorId: m.operatorId || m.operator_id,
        operatorName: m.operatorName || m.operator_name,
        comment: m.comment
    }));
    setMovements(normalizedMovements);
    } catch (err) {
    console.error("Erreur refresh:", err);
    } finally {
    setLoading(false);
    }
};
loadData();
};

const filteredMovements = movements.filter(mv => {
const matchesType = !filterType || mv.type === filterType;
const stockItemName = getStockItemName(mv.stockItemId);
const matchesSearch = !searchTerm || 
    stockItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mv.referenceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mv.operatorName?.toLowerCase().includes(searchTerm.toLowerCase());
return matchesType && matchesSearch;
});

if (loading) {
return (
    <div className="flex justify-center items-center h-96">
    <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Chargement des mouvements...</p>
    </div>
    </div>
);
}

return (
<div className="space-y-6 p-6 bg-gray-50 min-h-screen">
    <div className="flex items-center gap-4">
    <Button variant="outline" onClick={() => navigate("/stock")} className="p-2">
        <ArrowLeft className="w-5 h-5" />
    </Button>
    <div>
        <h1 className="text-2xl font-semibold text-gray-900">Historique des mouvements</h1>
        <p className="text-gray-600 text-sm">Traçabilité complète des entrées, sorties et ajustements</p>
    </div>
    </div>

    {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <Button variant="outline" size="sm" onClick={refreshData} className="mt-2">
        Réessayer
        </Button>
    </div>
    )}

    <div className="flex flex-wrap gap-3">
    <div className="relative flex-1 min-w-200px">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
        />
    </div>
    <Select 
        value={selectedStockId} 
        onChange={(e) => setSelectedStockId(e.target.value)} 
        className="w-64"
    >
        <option value="">Tous les articles</option>
        {stockItems.map(item => (
        <option key={item.id} value={item.id}>{item.name}</option>
        ))}
    </Select>
    <Select 
        value={filterType} 
        onChange={(e) => setFilterType(e.target.value)} 
        className="w-48"
    >
        <option value="">Tous les flux</option>
        <option value="entry">Entrées</option>
        <option value="exit">Sorties</option>
        <option value="adjustment">Ajustements</option>
    </Select>
    <Button variant="outline" onClick={refreshData}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Rafraîchir
    </Button>
    </div>

    <Card>
    <CardHeader>
        <CardTitle>Registre des flux logistiques</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
        {filteredMovements.length} mouvement(s) trouvé(s)
        </p>
    </CardHeader>
    <CardContent>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-gray-600">Date</th>
                <th className="pb-3 text-gray-600">Article</th>
                <th className="pb-3 text-gray-600">Type</th>
                <th className="pb-3 text-gray-600">Quantité</th>
                <th className="pb-3 text-gray-600">Opérateur</th>
                <th className="pb-3 text-gray-600">Commentaire</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredMovements.map(mv => (
                <tr key={mv.id} className="hover:bg-gray-50">
                <td className="py-4 text-gray-500 whitespace-nowrap">
                    {mv.date ? new Date(mv.date).toLocaleDateString("fr-FR") : "-"}
                </td>
                <td className="py-4 font-medium text-gray-900">
                    {getStockItemName(mv.stockItemId)}
                </td>
                <td className="py-4">
                    <span className="inline-flex items-center gap-1">
                    {getMovementIcon(mv.type)}
                    {getMovementLabel(mv.type)}
                    </span>
                </td>
                <td className={`py-4 font-semibold ${
                    mv.type === "entry" ? "text-green-600" : 
                    mv.type === "exit" ? "text-red-600" : 
                    "text-amber-600"
                }`}>
                    {mv.type === "entry" ? "+" : mv.type === "exit" ? "-" : ""}{mv.quantity} {mv.unit}
                </td>
                <td className="py-4 text-gray-600">{mv.operatorName}</td>
                <td className="py-4 text-gray-500 max-w-xs truncate" title={mv.comment}>
                    {mv.comment || "-"}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        {filteredMovements.length === 0 && !loading && !error && (
            <div className="text-center py-12">
            <p className="text-gray-500">Aucun mouvement trouvé</p>
            {(searchTerm || selectedStockId || filterType) && (
                <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                    setSearchTerm("");
                    setSelectedStockId("");
                    setFilterType("");
                }}
                >
                Effacer les filtres
                </Button>
            )}
            </div>
        )}
        </div>
    </CardContent>
    </Card>
</div>
);
}