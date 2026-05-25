import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { mockWeighings, mockFlocks, mockUsers } from "../data/mockData";
import { Weighing } from "../types";
import { Button } from "../components/common/button";
import { Plus } from "lucide-react";
import WeighingForm from "../components/forms/weighingForm";
import {
LineChart, Line, XAxis, YAxis, CartesianGrid,
Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export function weighingPage() {
const [weighings, setWeighings] = useState(mockWeighings);
const [selectedFlockId, setSelectedFlockId] = useState(mockFlocks[0]?.id ?? "");
const [modalOpen, setModalOpen] = useState(false);

const chartData = weighings
.filter(w => w.flockId === selectedFlockId)
.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
.map(w => ({
date: new Date(w.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
"Poids moyen (kg)": w.averageWeight,
"Poids min (kg)": w.minWeight,
"Poids max (kg)": w.maxWeight,
}));

const handleSave = (weighing: Weighing) => {
setWeighings(prev => [...prev, weighing]);
setModalOpen(false);
};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">Pesées</h1>
    <p className="text-gray-600">Suivi du poids des lots de volailles</p>
</div>
<Button onClick={() => setModalOpen(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Nouvelle pesée
</Button>
</div>

{/* Graphe */}
<Card>
<CardHeader>
    <div className="flex items-center justify-between">
    <CardTitle>Évolution du poids</CardTitle>
    <select title="Évolution du poids"
        value={selectedFlockId}
        onChange={e => setSelectedFlockId(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    >
        {mockFlocks.map(f => (
        <option key={f.id} value={f.id}>{f.name}</option>
        ))}
    </select>
    </div>
</CardHeader>
<CardContent>
    {chartData.length === 0 ? (
    <div className="h-48 flex items-center justify-center text-gray-400">
        Aucune pesée pour ce lot
    </div>
    ) : (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis stroke="#666" unit=" kg" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Poids moyen (kg)" stroke="#2E7D32" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Poids min (kg)" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Poids max (kg)" stroke="#FB8C00" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 3 }} />
        </LineChart>
    </ResponsiveContainer>
    )}
</CardContent>
</Card>

{/* Historique */}
<Card>
<CardHeader>
    <CardTitle>Historique des pesées</CardTitle>
</CardHeader>
<CardContent>
    <div className="overflow-x-auto">
    <table className="w-full text-sm">
        <thead>
        <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 text-gray-600 font-medium">Date</th>
            <th className="pb-3 text-gray-600 font-medium">Lot</th>
            <th className="pb-3 text-gray-600 font-medium">Nb animaux</th>
            <th className="pb-3 text-gray-600 font-medium">Poids moyen</th>
            <th className="pb-3 text-gray-600 font-medium">Min / Max</th>
            <th className="pb-3 text-gray-600 font-medium">Écart-type</th>
            <th className="pb-3 text-gray-600 font-medium">Agent</th>
            <th className="pb-3 text-gray-600 font-medium">Notes</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
        {[...weighings]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(w => {
            const flock = mockFlocks.find(f => f.id === w.flockId);
            const agent = mockUsers.find(u => u.id === w.agentId);
            return (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 text-gray-900">{new Date(w.date).toLocaleDateString("fr-FR")}</td>
                <td className="py-3 font-medium text-gray-900">{flock?.name ?? "-"}</td>
                <td className="py-3 text-gray-600">{w.weights.length}</td>
                <td className="py-3 font-semibold text-gray-900">{w.averageWeight} kg</td>
                <td className="py-3 text-gray-600">{w.minWeight} / {w.maxWeight} kg</td>
                <td className="py-3 text-gray-600">±{w.stdDeviation} kg</td>
                <td className="py-3 text-gray-600">{agent?.name ?? "-"}</td>
                <td className="py-3 text-gray-500 text-xs">{w.notes ?? "-"}</td>
                </tr>
            );
            })}
        </tbody>
    </table>
    </div>
</CardContent>
</Card>

{/* Modal */}
{modalOpen && (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Nouvelle pesée</h2>
        <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
    </div>
    <div className="p-6">
        <WeighingForm
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
        />
    </div>
    </div>
</div>
)}
</div>
);

}

export default weighingPage;