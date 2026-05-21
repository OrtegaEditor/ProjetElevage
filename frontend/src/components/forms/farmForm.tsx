import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Farm, PoultryType } from "../../types";

interface FarmFormProps {
farm?: Farm | null;
onClose: () => void;
onSave?: (farm: Farm) => void;
}

export function FarmForm({ farm, onClose, onSave }: FarmFormProps) {
const [form, setForm] = useState({
name: "",
address: "",
totalCapacity: 0,
description: "",
active: true,
});
const [selectedTypes, setSelectedTypes] = useState<PoultryType[]>([]);

useEffect(() => {
if (farm) {
    setForm({
    name: farm.name,
    address: farm.address,
    totalCapacity: farm.totalCapacity || 0,
    description: farm.description,
    active: farm.active ?? true,
    });
    setSelectedTypes(farm.type);
} else {
    setSelectedTypes(["broiler"]);
}
}, [farm]);

const handleTypeChange = (poultryType: PoultryType) => {
setSelectedTypes(prev =>
    prev.includes(poultryType)
    ? prev.filter(t => t !== poultryType)
    : [...prev, poultryType]
);
};

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

const savedFarm: Farm = {
    id: farm?.id ?? `farm-${Date.now()}`,
    name: form.name,
    address: form.address,
    type: selectedTypes,
    totalCapacity: form.totalCapacity,
    description: form.description,
    createdAt: farm?.createdAt ?? new Date().toISOString().split("T")[0],
    active: form.active,
};

if (onSave) {
    onSave(savedFarm);
}
onClose();
};

const poultryTypes: PoultryType[] = ["broiler", "layer", "turkey", "duck", "goose"];

return (
<form onSubmit={handleSubmit} className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900">
    {farm ? "Modifier le poulailler" : "Ajouter un poulailler"}
    </h2>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        Nom du poulailler
    </label>
    <input
        type="text"
        value={form.name}
        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        placeholder="Ex: Poulailler Principal"
        required
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        Adresse
    </label>
    <input
        type="text"
        value={form.address}
        onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        placeholder="Ex: Bayangam, Ouest Cameroun"
        required
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        Capacité totale
    </label>
    <input
        type="number"
        value={form.totalCapacity}
        onChange={(e) => setForm(f => ({ ...f, totalCapacity: parseInt(e.target.value) || 0 }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        placeholder="26000"
        required
    />
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        Types de volailles
    </label>
    <div className="space-y-2">
        {poultryTypes.map(type => (
        <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
            type="checkbox"
            checked={selectedTypes.includes(type)}
            onChange={() => handleTypeChange(type)}
            className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 capitalize">
            {type === "broiler" && "Poulets de chair"}
            {type === "layer" && "Poules pondeuses"}
            {type === "turkey" && "Dindes"}
            {type === "duck" && "Canards"}
            {type === "goose" && "Oies"}
            </span>
        </label>
        ))}
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        Description
    </label>
    <textarea
        value={form.description}
        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
        placeholder="Notes sur le poulailler..."
        rows={3}
    />
    </div>

    <div className="flex items-center gap-2">
    <input
        type="checkbox"
        id="active"
        checked={form.active}
        onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
        className="rounded border-gray-300"
    />
    <label htmlFor="active" className="text-sm font-medium text-gray-700">
        Poulailler actif
    </label>
    </div>

    <div className="flex gap-3 pt-4">
    <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    >
        Annuler
    </button>
    <Button type="submit" className="flex-1">
        {farm ? "Enregistrer les modifications" : "Créer le poulailler"}
    </Button>
    </div>
</form>
);
}