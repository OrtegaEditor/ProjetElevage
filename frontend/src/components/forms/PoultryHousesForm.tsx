import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { Drawer } from "../common/Drawer";
import { poultryHousesAPI, farmsAPI } from "../../services/api";
import type { PoultryHouse, Farm } from "../../types";

interface PoultryHouseFormProps {
open: boolean;
onClose: () => void;
onSuccess: () => void;
initialData?: PoultryHouse;
preselectedFarmId?: string;
}

export function PoultryHouseForm({ open, onClose, onSuccess, initialData, preselectedFarmId }: PoultryHouseFormProps) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [farms, setFarms] = useState<Farm[]>([]);

const [formData, setFormData] = useState({
name: "",
farmId: "",
capacity: 0,
currentOccupancy: 0,  // ← AJOUTER CETTE LIGNE
poultryType: "broiler",
hasAutomation: false,
description: "",
});

useEffect(() => {
if (open) {
    fetchFarms();
    
    if (initialData) {
    setFormData({
        name: initialData.name || "",
        farmId: initialData.farmId || "",
        capacity: initialData.capacity || 0,
        currentOccupancy: initialData.currentOccupancy || 0,  // ← AJOUTER
        poultryType: initialData.poultryType || "broiler",
        hasAutomation: initialData.hasAutomation || false,
        description: initialData.description || "",
    });
    } else if (preselectedFarmId) {
    setFormData(prev => ({ ...prev, farmId: preselectedFarmId }));
    } else {
    resetForm();
    }
}
}, [open, initialData, preselectedFarmId]);

const fetchFarms = async () => {
try {
    const data = await farmsAPI.getAll();
    setFarms(data || []);
} catch (err) {
    console.error("Erreur chargement fermes:", err);
}
};

const resetForm = () => {
setFormData({
    name: "",
    farmId: "",
    capacity: 0,
    currentOccupancy: 0,  // ← AJOUTER
    poultryType: "broiler",
    hasAutomation: false,
    description: "",
});
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);

try {
    const houseData = {
    name: formData.name,
    farmId: formData.farmId,
    capacity: formData.capacity,
    currentOccupancy: formData.currentOccupancy,  // ← AJOUTER
    poultryType: formData.poultryType,
    hasAutomation: formData.hasAutomation,
    description: formData.description || null,
    };

    console.log("Données envoyées:", houseData);  // ← DEBUG

    if (initialData) {
    await poultryHousesAPI.update(initialData.id, houseData);
    } else {
    await poultryHousesAPI.create(houseData);
    }

    onSuccess();
    onClose();
    resetForm();
} catch (err: any) {
    console.error("Erreur:", err);
    console.error("Détails:", err.response?.data);  // ← DEBUG
    if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d.message).join(", "));
    } else {
        setError(detail);
    }
    } else {
    setError("Une erreur est survenue");
    }
} finally {
    setLoading(false);
}
};

const handleChange = (field: string, value: string | number | boolean) => {
setFormData(prev => ({ ...prev, [field]: value }));
};

return (
<Drawer 
    open={open} 
    onClose={onClose} 
    title={initialData ? "Modifier la salle" : "Nouvelle salle d'élevage"}
    width="md"
>
    <form onSubmit={handleSubmit} className="space-y-5">
    {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
        </div>
    )}

    {/* Nom de la salle */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Nom de la salle *
        </label>
        <Input
        required
        placeholder="Ex: Bâtiment A"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        />
    </div>

    {/* Ferme */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Ferme *
        </label>
        <select
        required
        value={formData.farmId}
        onChange={(e) => handleChange("farmId", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!!preselectedFarmId}
        >
        <option value="">Sélectionner une ferme</option>
        {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
            {farm.name}
            </option>
        ))}
        </select>
    </div>

    {/* Capacité */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Capacité maximale *
        </label>
        <Input
        type="number"
        required
        min={1}
        value={formData.capacity}
        onChange={(e) => handleChange("capacity", parseInt(e.target.value) || 0)}
        placeholder="Nombre d'animaux maximum"
        />
    </div>

    {/* Occupation actuelle */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Occupation actuelle
        </label>
        <Input
        type="number"
        min={0}
        value={formData.currentOccupancy}
        onChange={(e) => handleChange("currentOccupancy", parseInt(e.target.value) || 0)}
        placeholder="Nombre d'animaux actuellement"
        />
    </div>

    {/* Type de volaille */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Type de volaille *
        </label>
        <select
        required
        value={formData.poultryType}
        onChange={(e) => handleChange("poultryType", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="broiler">Poulets de chair</option>
        <option value="layer">Poules pondeuses</option>
        <option value="turkey">Dindes</option>
        <option value="duck">Canards</option>
        <option value="goose">Oies</option>
        </select>
    </div>

    {/* Automatisation */}
    <label className="flex items-center gap-2 cursor-pointer">
        <input
        type="checkbox"
        checked={formData.hasAutomation}
        onChange={(e) => handleChange("hasAutomation", e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Salle automatisée</span>
    </label>

    {/* Description */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Description
        </label>
        <textarea
        rows={3}
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Informations supplémentaires..."
        />
    </div>

    <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
        Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
        {loading ? "Enregistrement..." : initialData ? "Modifier" : "Enregistrer"}
        </Button>
    </div>
    </form>
</Drawer>
);
}