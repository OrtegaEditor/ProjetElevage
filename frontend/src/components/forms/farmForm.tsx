import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { Drawer } from "../common/Drawer";
import { farmsAPI } from "../../services/api";
import type { Farm, PoultryType } from "../../types";

interface FarmFormDrawerProps {
open: boolean;
onClose: () => void;
onSuccess: () => void;
initialData?: Farm | null;
}

export function FarmFormDrawer({ open, onClose, onSuccess, initialData }: FarmFormDrawerProps) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [formData, setFormData] = useState({
name: "",
address: "",
totalCapacity: 0,
description: "",
active: true,
});

const [selectedTypes, setSelectedTypes] = useState<PoultryType[]>(["broiler"]);

useEffect(() => {
if (open) {
    if (initialData) {
    setFormData({
        name: initialData.name || "",
        address: initialData.address || "",
        totalCapacity: initialData.totalCapacity || 0,
        description: initialData.description || "",
        active: initialData.active !== false,
    });
    setSelectedTypes(initialData.poultry_types || ["broiler"]);
    } else {
    resetForm();
    }
}
}, [open, initialData]);

const resetForm = () => {
setFormData({
    name: "",
    address: "",
    totalCapacity: 0,
    description: "",
    active: true,
});
setSelectedTypes(["broiler"]);
setError(null);
};

const poultryTypes: PoultryType[] = ["broiler", "layer", "turkey", "duck", "goose"];

const getPoultryTypeLabel = (type: PoultryType): string => {
switch (type) {
    case "broiler": return "Poulets de chair";
    case "layer": return "Poules pondeuses";
    case "turkey": return "Dindes";
    case "duck": return "Canards";
    case "goose": return "Oies";
    default: return type;
}
};

const handleTypeChange = (poultryType: PoultryType) => {
setSelectedTypes(prev =>
    prev.includes(poultryType)
    ? prev.filter(t => t !== poultryType)
    : [...prev, poultryType]
);
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);

if (!formData.name.trim()) {
    setError("Le nom de la ferme est requis");
    setLoading(false);
    return;
}
if (!formData.address.trim()) {
    setError("L'adresse de la ferme est requise");
    setLoading(false);
    return;
}
if (selectedTypes.length === 0) {
    setError("Sélectionnez au moins un type de volaille");
    setLoading(false);
    return;
}
if (formData.totalCapacity <= 0) {
    setError("La capacité totale doit être supérieure à 0");
    setLoading(false);
    return;
}

try {
    const farmData = {
    name: formData.name,
    address: formData.address,
    poultry_types: selectedTypes,
    description: formData.description,
    totalCapacity: formData.totalCapacity,
    active: formData.active,
    };

    if (initialData) {
    await farmsAPI.update(initialData.id, farmData);
    } else {
    await farmsAPI.create(farmData);
    }

    onSuccess();
    onClose();
    resetForm();
} catch (err: any) {
    console.error("Erreur:", err);
    setError(err.response?.data?.detail || "Une erreur est survenue");
} finally {
    setLoading(false);
}
};

return (
<Drawer 
    open={open} 
    onClose={onClose} 
    title={initialData ? "Modifier la ferme" : "Nouvelle ferme"}
    width="md"
>
    <form onSubmit={handleSubmit} className="space-y-5">
    {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
        </div>
    )}

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Nom de la ferme <span className="text-red-500">*</span>
        </label>
        <Input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
        placeholder="Ex: Complexe Avicole Ouest"
        required
        />
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Adresse <span className="text-red-500">*</span>
        </label>
        <Input
        type="text"
        value={formData.address}
        onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
        placeholder="Ex: Yaoundé, Mvan"
        required
        />
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Capacité totale <span className="text-red-500">*</span>
        </label>
        <Input
        type="number"
        min={1}
        value={formData.totalCapacity || ""}
        onChange={(e) => setFormData(f => ({ ...f, totalCapacity: parseInt(e.target.value) || 0 }))}
        placeholder="Nombre total d'animaux"
        required
        />
        <p className="text-xs text-gray-400 mt-1">Capacité maximale d'accueil de la ferme</p>
    </div>

    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
        Types de volaille <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
        {poultryTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
            <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
                {getPoultryTypeLabel(type)}
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
        value={formData.description}
        onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        placeholder="Informations supplémentaires sur la ferme..."
        rows={3}
        />
    </div>

    <div className="flex items-center gap-2">
        <input
        type="checkbox"
        id="active"
        checked={formData.active}
        onChange={(e) => setFormData(f => ({ ...f, active: e.target.checked }))}
        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
        Ferme active
        </label>
    </div>

    <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
        Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
        {loading ? "Enregistrement..." : (initialData ? "Modifier" : "Créer")}
        </Button>
    </div>
    </form>
</Drawer>
);
}