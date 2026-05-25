import { useState } from "react";
import { Button } from "../../components/common/button";
import { Input } from "../../components/common/input";
import { mockFlocks, mockDiseases } from "../../data/mockData";
import { Treatment } from "../../types";   // ← ton fichier de types

interface TreatmentModalProps {
open: boolean;
onClose: () => void;
onSubmit: (data: Omit<Treatment, "id" | "veterinarianId">) => void;
}

export function TreatmentForm({
open,
onClose,
onSubmit
}: TreatmentModalProps) {

const [formData, setFormData] = useState({
flockId: "",
diseaseId: "",
animalsCount: 0,
medication: "",
dosage: "",
startDate: new Date().toISOString().split("T")[0],
endDate: "",
notes: "",
});

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

onSubmit(formData);
onClose();

// Reset
setFormData({
    flockId: "",
    diseaseId: "",
    animalsCount: 0,
    medication: "",
    dosage: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
});
};

if (!open) return null;

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto shadow-xl">
    {/* Header */}
    <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Nouveau Traitement</h2>
    </div>

    {/* Formulaire */}
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-4">

        {/* Lot */}
        <div>
            <label htmlFor="flockId">Choisir le lot </label>
            <select
            id="flockId"
            required
            value={formData.flockId}
            onChange={(e) => setFormData(p => ({ ...p, flockId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <option value="">Sélectionner un lot</option>
            {mockFlocks.map((flock) => (
                <option key={flock.id} value={flock.id}>
                {flock.name} ({flock.name} animaux)
                </option>
            ))}
            </select>
        </div>

        {/* Maladie */}
        <div>
            <label htmlFor="diseaseId">Maladie / Pathologie *</label>
            <select
            id="diseaseId"
            required
            value={formData.diseaseId}
            onChange={(e) => setFormData(p => ({ ...p, diseaseId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <option value="">Sélectionner une maladie</option>
            {mockDiseases.map((disease) => (
                <option key={disease.id} value={disease.id}>
                {disease.name}
                </option>
            ))}
            </select>
        </div>

        {/* Nombre d'animaux */}
        <div>
            <label htmlFor="animalsCount">Nombre d'animaux traités *</label>
            <Input
            type="number"
            id="animalsCount"
            min={1}
            required
            value={formData.animalsCount}
            onChange={(e) => setFormData(p => ({ ...p, animalsCount: parseInt(e.target.value) || 0 }))}
            />
        </div>

        {/* Médicament */}
        <div>
            <label htmlFor="medication">Médicament *</label>
            <Input
            id="medication"
            required
            value={formData.medication}
            onChange={(e) => setFormData(p => ({ ...p, medication: e.target.value }))}
            placeholder="Ex: Amoxicilline, Tylosine"
            />
        </div>

        {/* Posologie */}
        <div>
            <label htmlFor="dosage">Posologie *</label>
            <Input
            id="dosage"
            required
            value={formData.dosage}
            onChange={(e) => setFormData(p => ({ ...p, dosage: e.target.value }))}
            placeholder="Ex: 1ml / litre d'eau pendant 5 jours"
            />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label htmlFor="startDate">Date de début *</label>
            <Input
                type="date"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
            />
            </div>
            <div>
            <label htmlFor="endDate">Date de fin *</label>
            <Input
                type="date"
                id="endDate"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
            />
            </div>
        </div>

        {/* Notes */}
        <div>
            <label htmlFor="notes">Notes / Observations</label>
            <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Observations, remarques particulières..."
            />
        </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4 border-t">
        <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
        >
            Annuler
        </Button>
        <Button
            type="submit"
            className="flex-1"
        >
            Enregistrer le traitement
        </Button>
        </div>
    </form>
    </div>
</div>
);
}