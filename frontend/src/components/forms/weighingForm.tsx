import { useState } from "react";
import { mockFlocks } from "../../data/mockData";
import { Button } from "../common/button";
import { Plus, Trash2 } from "lucide-react";
import { Weighing } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface WeighingFormProps {
onSave: (weighing: Weighing) => void;
onCancel: () => void;
}

const calcStats = (weights: number[]) => {
const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
const min = Math.min(...weights);
const max = Math.max(...weights);
const std = Math.sqrt(weights.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / weights.length);
return {
averageWeight: parseFloat(avg.toFixed(3)),
minWeight: min,
maxWeight: max,
stdDeviation: parseFloat(std.toFixed(3)),
};
};

export default function WeighingForm({ onSave, onCancel }: WeighingFormProps) {
const { user } = useAuth();
const [flockId, setFlockId] = useState(mockFlocks[0]?.id ?? "");
const [weights, setWeights] = useState<string[]>([""]);
const [notes, setNotes] = useState("");

const handleWeightChange = (i: number, val: string) => {
const updated = [...weights];
updated[i] = val;
setWeights(updated);
};

const validWeights = weights.map(w => parseFloat(w)).filter(w => !isNaN(w) && w > 0);
const stats = validWeights.length > 0 ? calcStats(validWeights) : null;

const handleSubmit = () => {
if (validWeights.length === 0) return;
onSave({
    id: `weigh-${Date.now()}`,
    flockId,
    agentId: user?.id ?? "2",
    date: new Date().toISOString().split("T")[0],
    weights: validWeights,
    notes,
    ...calcStats(validWeights),
});
};

return (
<div className="space-y-4">
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Lot</label>
    <select title="Selectionner le lot"
        value={flockId}
        onChange={e => setFlockId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    >
        {mockFlocks.map(f => (
        <option key={f.id} value={f.id}>{f.name}</option>
        ))}
    </select>
    </div>

    <div>
    <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Poids individuels (kg)</label>
        <button title="Ajouter encore un poids individuel pour assurer une bonne precision du calcul de la moyenne et de l'écart-type"
        onClick={() => setWeights(w => [...w, ""])}
        className="text-xs text-[#2E7D32] hover:underline flex items-center gap-1"
        >
        <Plus className="w-3 h-3" /> Ajouter
        </button>
    </div>
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {weights.map((w, i) => (
        <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
            <input
            type="number"
            step="0.001"
            value={w}
            onChange={e => handleWeightChange(i, e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            placeholder="Ex: 1.85"
            />
            {weights.length > 1 && (
            <button title="Poids individuels"
                onClick={() => setWeights(weights.filter((_, j) => j !== i))}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
            )}
        </div>
        ))}
    </div>

    {stats && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg grid grid-cols-3 gap-2 text-xs">
        <div><span className="text-gray-500">Moyenne</span><p className="font-semibold">{stats.averageWeight} kg</p></div>
        <div><span className="text-gray-500">Min / Max</span><p className="font-semibold">{stats.minWeight} / {stats.maxWeight} kg</p></div>
        <div><span className="text-gray-500">Écart-type</span><p className="font-semibold">±{stats.stdDeviation} kg</p></div>
        </div>
    )}
    </div>
    <div>
        
    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
    <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        placeholder="Observations..."
    />
    </div>

    <div className="flex gap-3 pt-2">
    <button
        onClick={onCancel}
        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
    >
        Annuler
    </button>
    <Button onClick={handleSubmit} className="flex-1">
        Enregistrer
    </Button>
    </div>
</div>
);
}