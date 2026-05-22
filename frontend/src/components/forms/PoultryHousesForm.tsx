import { useState, useEffect } from "react"; // Ajout de useState et useEffect
import { mockFarms } from "../../data/mockData";
import { PoultryHouse } from "../../types";
import { Button } from "../common/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface PoultryHouseFormProps {
open: boolean;
onClose: () => void;
onSave: (flock: PoultryHouse) => void;
initialData?: PoultryHouse;
}

export function PoultryHouseForm({open, onClose, onSave, initialData}: PoultryHouseFormProps) {
    // 1. État local calqué sur la structure exacte de vos champs
    const [formData, setFormData] = useState({
        name: "",
        farmId: "",
        capacity: "",
        currentOccupancy: "",
        poultryType: "broiler",
        hasAutomation: false,
        description: ""
    });

    // 2. Met à jour les champs quand initialData change (clic sur modifier) ou se réinitialise (clic sur ajouter)
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                farmId: initialData.farmId || "",
                capacity: initialData.capacity?.toString() || "",
                currentOccupancy: initialData.currentOccupancy?.toString() || "",
                poultryType: initialData.poultryType || "broiler",
                hasAutomation: !!initialData.hasAutomation,
                description: initialData.description || ""
            });
        } else {
            setFormData({
                name: "",
                farmId: "",
                capacity: "",
                currentOccupancy: "",
                poultryType: "broiler",
                hasAutomation: false,
                description: ""
            });
        }
    }, [initialData, open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>
                {initialData ? "Modifier la salle" : "Nouvelle salle d'élevage"}
            </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
            {/* Liaison des valeurs (value) et des changements (onChange) */}
            <input
                className="border p-2 w-full"
                placeholder="Nom de la salle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <select
                title="Ferme"
                className="border p-2 w-full"
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
            >
                <option value="">Sélectionner une ferme</option>
                {mockFarms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                    {farm.name}
                </option>
                ))}
            </select>

            <input
                type="number"
                className="border p-2 w-full"
                placeholder="Capacité maximale"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />

            <input
                type="number"
                className="border p-2 w-full"
                placeholder="Occupation actuelle"
                value={formData.currentOccupancy}
                onChange={(e) => setFormData({ ...formData, currentOccupancy: e.target.value })}
            />

            <select 
                title="Type volaille" 
                className="border p-2 w-full"
                value={formData.poultryType}
                onChange={(e) => setFormData({ ...formData, poultryType: e.target.value })}
            >
                <option value="broiler">Poulets de chair</option>
                <option value="layer">Poules pondeuses</option>
                <option value="turkey">Dindes</option>
                <option value="duck">Canards</option>
                <option value="goose">Oies</option>
            </select>

            <label className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={formData.hasAutomation}
                    onChange={(e) => setFormData({ ...formData, hasAutomation: e.target.checked })}
                />
                Salle automatisée
            </label>

            <textarea
                className="border p-2 w-full"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="flex gap-2">
                <Button className="w-full">
                Enregistrer
                </Button>

                <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full"
                >
                Annuler
                </Button>
            </div>

            </div>
        </DialogContent>
        </Dialog>
    );
}
