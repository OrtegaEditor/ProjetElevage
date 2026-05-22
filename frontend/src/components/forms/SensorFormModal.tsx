import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../common/button";
import { Sensor } from "../../types";
import { mockPoultryHouses } from "../../data/mockData";
import { Input } from "../../components/common/input";
import { Select } from "../../components/common/select";


interface SensorFormModalProps {
sensor?: Sensor | null;
open : boolean;
onClose: () => void;
onSave: (sensor: Sensor) => void;
}

const sensorTypes = ["temperature", "light", "ammoniac"];

export function SensorFormModal({ sensor,open, onClose, onSave }: SensorFormModalProps) {
if (!open) return null;
const [form, setForm] = useState({
name: "",
type: "temperature",
poultryHouseId: mockPoultryHouses[0]?.id ?? "",
unit: "°C",
minValue: "",
maxValue: "",
status: "online",
calibrationOffset: sensor?.calibrationOffset?.toString() ?? "0",
});

useEffect(() => {
if (sensor) {
    setForm({
    name: sensor.name,
    type: sensor.type,
    poultryHouseId: sensor.poultryHouseId,
    unit: sensor.unit,
    minValue: sensor.minValue?.toString() ?? "",
    maxValue: sensor.maxValue?.toString() ?? "",
    status: sensor.status,
    calibrationOffset: sensor?.calibrationOffset?.toString() ?? "0",
    });
}
}, [sensor]);

const handleSubmit = () => {
const saved: Sensor = {
    id: sensor?.id ?? `sensor-${Date.now()}`,
    name: form.name,
    type: form.type as Sensor["type"],
    poultryHouseId: form.poultryHouseId,
    value: sensor?.value ?? 0,
    unit: form.unit,
    status: form.status as "online" | "warning" | "error",
    lastUpdate: new Date().toISOString(),
    minValue: form.minValue ? parseFloat(form.minValue) : undefined,
    maxValue: form.maxValue ? parseFloat(form.maxValue) : undefined,
};
onSave(saved);
onClose();
};

return (
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
        {sensor ? "Modifier le capteur" : "Ajouter un capteur"}
        </h2>
        <Button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
        <X className="w-5 h-5" />
        </Button>
    </div>

    <div className="p-6 space-y-4">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <Input
        required
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            placeholder="Ex: Température Poulailler A"
        />
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select title="Type capteur"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
            {sensorTypes.map(t => (
                <option key={t} value={t}>{t}</option>
            ))}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
            <input
            type="text"
            value={form.unit}
            onChange={e => setForm({ ...form, unit: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            placeholder="°C, %, ppm..."
            />
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Poulailler</label>
        <select required title="poulailler"
            value={form.poultryHouseId}
            onChange={e => setForm({ ...form, poultryHouseId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        >
            {mockPoultryHouses.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
            ))}
        </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil min</label>
            <input title="Seuil minimun"
            required
            type="number"
            value={form.minValue}
            onChange={e => setForm({ ...form, minValue: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil max</label>
            <input title="Seuil maximum" type="number" value={form.maxValue}
            onChange={e => setForm({ ...form, maxValue: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            />
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
        <select required title="Statut" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        >
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
        </select>
        </div>
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Sensibilité
        </label>
        <input
            required
            type="number"
            step="0.1"
            value={form.calibrationOffset} onChange={e => setForm({ ...form, calibrationOffset: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            placeholder="Ex: +0.5 ou -1.2"
        />
        <p className="text-xs text-gray-500 mt-1">
        </p>
        </div>
    </div>
    <div className="p-6 border-t border-gray-200 flex gap-3">
        <button
        onClick={onClose}
        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
        Annuler
        </button>
        <Button onClick={handleSubmit} className="flex-1">
        {sensor ? "Enregistrer" : "Ajouter"}
        </Button>
    </div>
    </div>
</div>
);
}