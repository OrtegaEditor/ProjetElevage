import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../common/badge";
import { mockStockMovements } from "@/data/mockData";
import { StockMovement } from "@/types";

interface Props {
open: boolean;
onClose: () => void;
}

export function StockMovementsModal({ open, onClose }: Props) {
return (
<Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
        <DialogTitle>Historique des mouvements de stock</DialogTitle>
    </DialogHeader>

    <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm text-left">
        <thead>
            <tr className="border-b border-gray-200 text-gray-600 font-medium">
            <th className="pb-3">Date</th>
            <th className="pb-3">Article</th>
            <th className="pb-3">Type</th>
            <th className="pb-3">Quantité</th>
            <th className="pb-3">Destination / Source</th>
            <th className="pb-3">Opérateur</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {mockStockMovements.map((mv: StockMovement) => (
            <tr key={mv.id} className="hover:bg-gray-50">
                <td className="py-3 text-gray-500">
                {new Date(mv.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-3 font-medium text-gray-900">{mv.stockItemName}</td>
                <td className="py-3">
                <Badge variant={mv.type === "entry" ? "success" : mv.type === "exit" ? "warning" : "info"}>
                    {mv.type === "entry" ? "Entrée" : mv.type === "exit" ? "Sortie" : "Ajustement"}
                </Badge>
                </td>
                <td className={`py-3 font-semibold ${mv.type === "entry" ? "text-green-600" : "text-red-600"}`}>
                {mv.type === "entry" ? "+" : ""}{mv.quantity} {mv.unit}
                </td>
                <td className="py-3 text-gray-600">{mv.referenceName ?? "-"}</td>
                <td className="py-3 text-gray-500 text-xs">{mv.operator}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
    </DialogContent>
</Dialog>
);
}
