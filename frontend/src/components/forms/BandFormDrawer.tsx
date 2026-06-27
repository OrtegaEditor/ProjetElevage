import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { Drawer } from "../common/Drawer";
import { bandsAPI, farmsAPI, especesAPI, suppliersAPI } from "../../services/api";
import type { Band, Farm, Espece, Supplier } from "../../types";

interface BandFormDrawerProps {
open: boolean;
onClose: () => void;
onSuccess: () => void;
initialData?: Band;
preselectedFarmId?: string;
}

export function BandFormDrawer({ open, onClose, onSuccess, initialData, preselectedFarmId }: BandFormDrawerProps) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [farms, setFarms] = useState<Farm[]>([]);
const [especes, setEspeces] = useState<Espece[]>([]);
const [suppliers, setSuppliers] = useState<Supplier[]>([]);

const [formData, setFormData] = useState({
name: "",
farmId: "",
especeId: "",
quantity: 0,
supplierId: "",
prixUnitaire: 0,
restockDate: new Date().toISOString().split("T")[0],
notes: "",
});

useEffect(() => {
if (open) {
    fetchFarms();
    fetchEspeces();
    fetchSuppliers();
    
    if (initialData) {
    setFormData({
        name: initialData.name || "",
        farmId: initialData.farmId || "",
        especeId: initialData.espece_id || "",
        quantity: initialData.quantity || 0,
        supplierId: initialData.fournisseur || "",
        prixUnitaire: initialData.prixUnitaire || 0,
        restockDate: initialData.createdDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        notes: initialData.notes || "",
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

const fetchEspeces = async () => {
  try {
    const data = await especesAPI.getAll();
    console.log("Espèces data brutes:", data);
    
    // Force un tableau valide
    let especesArray: Espece[] = [];
    
    if (data) {
      if (Array.isArray(data)) {
        especesArray = data;
      } else if (data.items && Array.isArray(data.items)) {
        especesArray = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        especesArray = data.data;
      }
    }
    
    setEspeces(especesArray);
  } catch (err) {
    console.error("Erreur chargement espèces:", err);
    setEspeces([]);
  }
};
const fetchSuppliers = async () => {
try {
    const data = await suppliersAPI.getAll();
    setSuppliers(data || []);
} catch (err) {
    console.error("Erreur chargement fournisseurs:", err);
}
};

const resetForm = () => {
setFormData({
    name: "",
    farmId: "",
    especeId: "",
    quantity: 0,
    supplierId: "",
    prixUnitaire: 0,
    restockDate: new Date().toISOString().split("T")[0],
    notes: "",
});
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError(null);

try {
    const bandData = {
    name: formData.name,
    farmId: formData.farmId,
    especeId: formData.especeId,
    quantity: formData.quantity,
    supplier: formData.supplierId || null,
    prixUnitaire: formData.prixUnitaire || 0,
    restockDate: formData.restockDate,
    notes: formData.notes || null,
    };

    if (initialData) {
    await bandsAPI.update(initialData.id, bandData);
    } else {
    await bandsAPI.create(bandData);
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

const handleChange = (field: string, value: string | number) => {
setFormData(prev => ({ ...prev, [field]: value }));
};

return (
<Drawer 
    open={open} 
    onClose={onClose} 
    title={initialData ? "Modifier l'arrivage" : "Nouvel arrivage"}
    width="md"
>
    <form onSubmit={handleSubmit} className="space-y-5">
    {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error}
        </div>
    )}

    {/* Nom de la bande */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Nom de la bande *
        </label>
        <Input
        required
        placeholder="Ex: Arrivage Mars 2024"
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

    {/* Espèce */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Type de volaille *
        </label>
        <select
        required
        value={formData.especeId}
        onChange={(e) => handleChange("especeId", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="">Sélectionner une espèce</option>
        {especes.map((espece) => (
            <option key={espece.id} value={espece.id}>
            {espece.name}
            </option>
        ))}
        </select>
    </div>

    {/* Quantité */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Quantité *
        </label>
        <Input
        type="number"
        required
        min={1}
        value={formData.quantity}
        onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
        placeholder="Nombre d'animaux"
        />
    </div>

    {/* Fournisseur */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Fournisseur
        </label>
        <select
        value={formData.supplierId}
        onChange={(e) => handleChange("supplierId", e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="">Sélectionner un fournisseur</option>
        {suppliers.filter(s => s.active !== false).map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
            {supplier.name}
            </option>
        ))}
        </select>
    </div>

    {/* Prix unitaire */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Prix unitaire (FCFA)
        </label>
        <Input
        type="number"
        min={0}
        step={100}
        value={formData.prixUnitaire}
        onChange={(e) => handleChange("prixUnitaire", parseFloat(e.target.value) || 0)}
        placeholder="0"
        />
    </div>

    {/* Date d'arrivée */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Date d'arrivée *
        </label>
        <Input
        type="date"
        required
        value={formData.restockDate}
        onChange={(e) => handleChange("restockDate", e.target.value)}
        />
    </div>

    {/* Notes */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Notes
        </label>
        <textarea
        rows={3}
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
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