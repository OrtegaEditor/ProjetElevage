// frontend/src/components/specific/WeighingHistoryTable.tsx
import { Flock, Weighing, Farm } from "../../types";

interface WeighingHistoryTableProps {
weighings: Weighing[];
flocks: Flock[];
farms: Farm[];
selectedFlockName: string;
}

export function WeighingHistoryTable({ weighings, flocks, farms }: WeighingHistoryTableProps) {
if (!weighings || weighings.length === 0) {
return (
    <div className="text-center py-8 text-gray-400">
    Aucune pesée trouvée
    </div>
);
}

return (
<div className="overflow-x-auto">
    <table className="w-full text-sm">
    <thead>
        <tr className="border-b border-gray-200 text-left">
        <th className="pb-3 text-gray-600 font-medium">Date</th>
        <th className="pb-3 text-gray-600 font-medium">Lot</th>
        <th className="pb-3 text-gray-600 font-medium">Ferme</th>
        <th className="pb-3 text-gray-600 font-medium">Nb animaux</th>
        <th className="pb-3 text-gray-600 font-medium">Poids moyen</th>
        <th className="pb-3 text-gray-600 font-medium">Min / Max</th>
        <th className="pb-3 text-gray-600 font-medium">Écart-type</th>
        <th className="pb-3 text-gray-600 font-medium">Notes</th>
        </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
        {weighings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((w) => {
            const flock = flocks.find(f => f.id === w.flockId);
            const farm = farms.find(f => f.id === flock?.farmId);
            
            // Correction: Utiliser sample_size pour le nombre d'animaux
            const animalsCount = w.sampleSize || (Array.isArray(w.weights) ? w.weights.length : 0);
            
            // Valeurs min/max avec vérification
            const minWeight = w.minWeight || 0;
            const maxWeight = w.maxWeight || 0;
            const stdDev = w.stdDeviation || 0;
            
            return (
            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-900">
                {new Date(w.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="py-3 font-medium text-gray-900">
                {flock?.name || "-"}
                </td>
                <td className="py-3 text-gray-600">
                {farm?.name || "-"}
                </td>
                <td className="py-3 text-gray-600">
                {animalsCount}
                </td>
                <td className="py-3 font-semibold text-emerald-600">
                {w.averageWeight} kg
                </td>
                <td className="py-3 text-gray-600">
                {minWeight} / {maxWeight} kg
                </td>
                <td className="py-3 text-gray-600">
                ±{stdDev} kg
                </td>
                <td className="py-3 text-gray-500 text-xs">
                {w.notes || "-"}
                </td>
            </tr>
            );
        })}
    </tbody>
    </table>
</div>
);
}