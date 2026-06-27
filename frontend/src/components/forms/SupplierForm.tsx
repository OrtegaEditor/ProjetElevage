// frontend/src/components/forms/SupplierForm.tsx
import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import type { Farm } from "../../types";

interface SupplierFormProps {
initialData?: {
id?: string;
name: string;
email: string;
phone: string;
address: string;
company: string;
suppliedCategories: string[];
farmIds: string[];
notes: string;
};
farms: Farm[];
onSubmit: (data: any) => void;
onCancel: () => void;
isLoading?: boolean;
}

const categoryOptions = [
{ value: "feed", label: "Alimentation" },
{ value: "vaccine", label: "Vaccins" },
{ value: "medication", label: "Medicaments" },
{ value: "equipment", label: "Equipements" },
{ value: "other", label: "Autres" }
];

export function SupplierForm({ initialData, farms, onSubmit, onCancel, isLoading }: SupplierFormProps) {
const [formData, setFormData] = useState({
name: "",
email: "",
phone: "",
address: "",
company: "",
suppliedCategories: [] as string[],
farmIds: [] as string[],
notes: ""
});

useEffect(() => {
if (initialData) {
    setFormData({
    name: initialData.name,
    email: initialData.email,
    phone: initialData.phone,
    address: initialData.address,
    company: initialData.company,
    suppliedCategories: initialData.suppliedCategories,
    farmIds: initialData.farmIds,
    notes: initialData.notes
    });
} else {
    // Par defaut, selectionner toutes les fermes
    setFormData(prev => ({
    ...prev,
    farmIds: farms.map(f => f.id)
    }));
}
}, [initialData, farms]);

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (!formData.name || !formData.phone) return;

// Conversion camelCase -> snake_case pour le backend
const payload = {
    name: formData.name,
    email: formData.email || null,
    phone: formData.phone,
    address: formData.address || null,
    company: formData.company || null,
    supplied_categories: formData.suppliedCategories,
    notes: formData.notes || null,
    active: true,
    farm_ids: formData.farmIds
};
onSubmit(payload);
};

return (
<form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Nom */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
        <Input
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
        />
    </div>

    {/* Telephone */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telephone *</label>
        <Input
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
        />
    </div>

    {/* Email */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <Input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
    </div>

    {/* Entreprise */}
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
        <Input
        value={formData.company}
        onChange={(e) => setFormData({...formData, company: e.target.value})}
        />
    </div>

    {/* Adresse */}
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
        <Input
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
    </div>

    {/* Categories fournies */}
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Categories fournies</label>
        <div className="flex flex-wrap gap-2">
        {categoryOptions.map(opt => (
            <button
            key={opt.value}
            type="button"
            onClick={() => {
                const current = formData.suppliedCategories;
                setFormData({
                ...formData,
                suppliedCategories: current.includes(opt.value)
                    ? current.filter(c => c !== opt.value)
                    : [...current, opt.value]
                });
            }}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                formData.suppliedCategories.includes(opt.value)
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            >
            {opt.label}
            </button>
        ))}
        </div>
    </div>

    {/* Fermes associees */}
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Fermes associees</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50">
        {farms.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune ferme disponible</p>
        ) : (
            farms.map(farm => (
            <button
                key={farm.id}
                type="button"
                onClick={() => {
                const current = formData.farmIds;
                setFormData({
                    ...formData,
                    farmIds: current.includes(farm.id)
                    ? current.filter(id => id !== farm.id)
                    : [...current, farm.id]
                });
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                formData.farmIds.includes(farm.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-emerald-400'
                }`}
            >
                {farm.name}
            </button>
            ))
        )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
        {formData.farmIds.length} ferme(s) selectionnee(s)
        </p>
    </div>

    {/* Notes */}
    <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea title="notes"
        value={formData.notes}
        onChange={(e) => setFormData({...formData, notes: e.target.value})}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
        rows={2}
        />
    </div>
    </div>

    {/* Boutons */}
    <div className="flex justify-end gap-3 pt-4 border-t">
    <Button type="button" variant="outline" onClick={onCancel}>
        Annuler
    </Button>
    <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
        {isLoading ? "Enregistrement..." : (initialData?.id ? "Mettre a jour" : "Enregistrer")}
    </Button>
    </div>
</form>
);
}