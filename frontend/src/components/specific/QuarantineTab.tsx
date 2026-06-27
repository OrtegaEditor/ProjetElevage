// frontend/src/components/specific/QuarantineTab.tsx
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "../common/input";
import { Select } from "../common/select";
import { Button } from "../common/button";

interface QuarantineTabProps {
flockName: string;
flockQuantity: number;
onSave: (data: { quantity: number; reason: string; newFlockName: string }) => void;
onCancel: () => void;
loading?: boolean;
}

export function QuarantineTab({ flockName, flockQuantity, onSave, onCancel, loading }: QuarantineTabProps) {
const [quantity, setQuantity] = useState(0);
const [reason, setReason] = useState('');
const [newFlockName, setNewFlockName] = useState('');

const handleSubmit = () => {
if (quantity > 0 && quantity < flockQuantity && reason) {
    onSave({ quantity, reason, newFlockName: newFlockName || `Quarantaine - ${flockName}` });
}
};

const isValid = quantity > 0 && quantity < flockQuantity && reason;

return (
<div className="space-y-5">
    <div className="flex items-center gap-2 mb-2">
    <AlertTriangle className="w-5 h-5 text-yellow-600" />
    <h3 className="font-semibold text-gray-800">Mise en quarantaine</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre de sujets à isoler
        </label>
        <Input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Math.min(Number(e.target.value), flockQuantity - 1))}
        placeholder="Nombre"
        min={1}
        max={flockQuantity - 1}
        />
        <p className="text-xs text-gray-500 mt-1">
        Maximum: {flockQuantity - 1} sujets (le lot original doit garder au moins 1 sujet)
        </p>
    </div>
    
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Raison de la quarantaine
        </label>
        <Select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        >
        <option value="">Sélectionner une raison</option>
        <option value="maladie">Suspicion de maladie</option>
        <option value="blessure">Sujets blessés</option>
        <option value="faible_poids">Faible poids / retard de croissance</option>
        <option value="aggressivite">Agressivité / Cannibalisme</option>
        <option value="controle">Contrôle sanitaire</option>
        </Select>
    </div>
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
        Nom du nouveau lot (optionnel)
    </label>
    <Input
        type="text"
        value={newFlockName}
        onChange={(e) => setNewFlockName(e.target.value)}
        placeholder={`Ex: Quarantaine - ${flockName}`}
    />
    </div>

    {/* Conséquences */}
    {quantity > 0 && (
    <div className="bg-yellow-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
        <div className="text-sm">
            <p className="font-medium text-yellow-800">Conséquences de l'opération</p>
            <ul className="text-yellow-700 mt-1 space-y-0.5 text-xs">
            <li>{quantity} sujets seront déplacés vers un nouveau lot</li>
            <li>Le lot original aura {flockQuantity - quantity} sujets</li>
            <li>Le nouveau lot sera marqué comme "Quarantaine"</li>
            <li>Une alerte sera créée pour informer l'équipe</li>
            </ul>
        </div>
        </div>
    </div>
    )}

    {/* Boutons d'action */}
    <div className="flex gap-3 pt-2">
    <Button variant="outline" onClick={onCancel} className="flex-1">
        Annuler
    </Button>
    <Button onClick={handleSubmit} disabled={loading || !isValid} className="flex-1 bg-yellow-600 hover:bg-yellow-700">
        {loading ? 'Création...' : 'Créer le lot de quarantaine'}
    </Button>
    </div>
</div>
);
}