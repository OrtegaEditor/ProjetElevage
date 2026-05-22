import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { mockStockMovements } from "../data/mockData"; 
import { StockMovement } from "../types";

export function StockMovementsPage() {
const navigate = useNavigate();
const [movements] = useState<StockMovement[]>(mockStockMovements);
const [filterType, setFilterType] = useState<string>("");

// Filtrage des mouvements selon le type sélectionné
const filteredMovements = movements.filter(mv => 
!filterType || mv.type === filterType
);

return (
<div className="space-y-6">
    {/* Header avec retour arrière */}
    <div className="flex items-center gap-4">
    <Button
        onClick={() => navigate("/stock")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border"
        variant="outline"
    >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
    </Button>
    <div>
        <h1 className="text-2xl font-semibold text-gray-900">Historique des mouvements</h1>
        <p className="text-gray-600 text-sm">Traçabilité complète des entrées, sorties et ajustements de stock</p>
    </div>
    </div>

    {/* Barre de Filtre rapide */}
    <div className="flex justify-end gap-4">
    <select
        title="Filtrer par flux"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    >
        <option value="">Tous les flux</option>
        <option value="entry">Entrées (Approvisionnements)</option>
        <option value="exit">Sorties (Consommation)</option>
        <option value="adjustment">Ajustements (Pertes/Corrections)</option>
    </select>
    </div>

    {/* Tableau complet des flux historiques */}
    <Card>
    <CardHeader>
        <CardTitle>Registre des flux logistiques</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead>
            <tr className="border-b border-gray-200 text-gray-600 font-medium">
                <th className="pb-3">Date / Heure</th>
                <th className="pb-3">Article</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Quantité</th>
                <th className="pb-3">Provenance / Destination</th>
                <th className="pb-3">Opérateur</th>
                <th className="pb-3">Motif / Commentaire</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredMovements.map((mv: StockMovement) => (
                <tr key={mv.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 text-gray-500 whitespace-nowrap">
                    {new Date(mv.date).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(mv.date).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-4 font-medium text-gray-900">{mv.stockItemName}</td>
                <td className="py-4">
                    {mv.type === "entry" && (
                    <span className="flex items-center w-fit text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <ArrowDownLeft className="w-3.5 h-3.5 mr-1" /> Entrée
                    </span>
                    )}
                    {mv.type === "exit" && (
                    <span className="flex items-center w-fit text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Sortie
                    </span>
                    )}
                    {mv.type === "adjustment" && (
                    <span className="flex items-center w-fit text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Ajustement
                    </span>
                    )}
                </td>
                <td className={`py-4 font-bold ${mv.type === "entry" ? "text-green-600" : mv.type === "exit" ? "text-red-600" : "text-amber-600"}`}>
                    {mv.type === "entry" ? "+" : ""}{mv.quantity} {mv.unit}
                </td>
                <td className="py-4 text-gray-700 font-medium">
                    {mv.referenceName ?? <span className="text-gray-400 italic">Non spécifié</span>}
                </td>
                <td className="py-4 text-gray-600 text-xs">{mv.operator}</td>
                <td className="py-4 text-gray-500 max-w-xs truncate" title={mv.comment}>
                    {mv.comment ?? "-"}
                </td>
                </tr>
            ))}
            {filteredMovements.length === 0 && (
                <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    Aucun mouvement trouvé pour ce filtre.
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    </CardContent>
    </Card>
</div>
);
}
