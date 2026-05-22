import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { mockFlocks, mockDiseases } from "../../data/mockData";
import { Vaccination } from "../../types";

interface VaccinationFormProps {
open: boolean;
onClose: () => void;
onSubmit: (data: Omit<Vaccination, "id" | "veterinarianId">) => void;
}

export  function VaccinationForm({ open, onClose, onSubmit }: VaccinationFormProps) {
const [formData, setFormData] = useState({
flockId: "",
vaccine: "",
diseaseId: "",
administrationDate: new Date().toISOString().split("T")[0],
nextDueDate: "",
method: "drinking_water" as Vaccination["method"],
quantity: 0,
notes: "",
});

// Ajuste automatiquement la quantité de vaccins selon la taille du lot sélectionné
useEffect(() => {
if (formData.flockId) {
    const selectedFlock = mockFlocks.find((f) => f.id === formData.flockId);
    if (selectedFlock) {
    setFormData((prev) => ({ ...prev, quantity: selectedFlock.quantity }));
    }
}
}, [formData.flockId]);

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
onSubmit(formData);
onClose();
// Réinitialisation
setFormData({
    flockId: "",
    vaccine: "",
    diseaseId: "",
    administrationDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    method: "drinking_water",
    quantity: 0,
    notes: "",
});
};

if (!open) return null;

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto shadow-xl">
    <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Nouvelle Vaccination</h2>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Sélection du Lot */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lot de volailles *</label>
        <select title="Lot de volailles"
            required
            value={formData.flockId}
            onChange={(e) => setFormData({ ...formData, flockId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Sélectionner un lot</option>
            {mockFlocks.map((f) => (
            <option key={f.id} value={f.id}>{f.name} ({f.quantity.toLocaleString()} sujets)</option>
            ))}
        </select>
        </div>

        {/* Nom du Vaccin */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du vaccin *</label>
        <Input
            required
            placeholder="Ex: Gumboro, Newcastle..."
            value={formData.vaccine}
            onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
        />
        </div>

        {/* Maladie Cible */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Maladie cible *</label>
        <select title="Maladie"
            required
            value={formData.diseaseId}
            onChange={(e) => setFormData({ ...formData, diseaseId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Sélectionner la pathologie</option>
            {mockDiseases.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
            ))}
        </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
        {/* Quantité d'animaux */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doses / Quantité *</label>
            <Input
            type="number"
            min={1}
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
        </div>

        {/* Méthode d'administration */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Méthode *</label>
            <select title="Méthode d'administration"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as Vaccination["method"] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="drinking_water">Eau de boisson</option>
                <option value="injection">Injection</option>
                <option value="spray">Pulvérisation</option>
                <option value="eye_drop">Goutte oculaire</option>
            </select>
        </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
        {/* Date Administration */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date admin. *</label>
            <Input
            type="date"
            required
            value={formData.administrationDate}
            onChange={(e) => setFormData({ ...formData, administrationDate: e.target.value })}
            />
        </div>

        {/* Prochain Rappel */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prochain rappel</label>
            <Input
            type="date"
            value={formData.nextDueDate}
            onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
            />
        </div>
        </div>

        {/* Notes */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Observations</label>
        <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ex: Numéro de lot du vaccin, réactions..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
        />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Annuler
        </Button>
        <Button type="submit" className="flex-1">
            Enregistrer
        </Button>
        </div>
    </form>
    </div>
</div>
);
}
