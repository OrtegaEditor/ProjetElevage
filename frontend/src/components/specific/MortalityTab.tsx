// frontend/src/components/specific/MortalityTab.tsx
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "../common/input";
import { Select } from "../common/select";
import { Button } from "../common/button";

interface MortalityTabProps {
flockId: string;
flockQuantity: number;
onSave: (data: { quantity: number; cause: string }) => void;
onCancel: () => void;
loading?: boolean;
}

export function MortalityTab({ flockQuantity, onSave, onCancel, loading }: MortalityTabProps) {
const [quantity, setQuantity] = useState(0);
const [cause, setCause] = useState('');

const mortalityRate = (quantity / flockQuantity) * 100;
const isHighRisk = mortalityRate > 5;
const isMediumRisk = mortalityRate > 2;

const handleSubmit = () => {
if (quantity > 0 && quantity <= flockQuantity) {
    if (mortalityRate > 10 && !confirm(`Attention: Taux de mortalité élevé (${mortalityRate.toFixed(1)}%). Continuer?`)) {
    return;
    }
    onSave({ quantity, cause });
}
};

return (
<div className="space-y-5">
    <div className="flex items-center gap-2 mb-2">
    <AlertCircle className="w-5 h-5 text-red-600" />
    <h3 className="font-semibold text-gray-800">Enregistrement mortalité</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Nombre de sujets morts
        </label>
        <Input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Math.min(Number(e.target.value), flockQuantity))}
        placeholder="Nombre"
        min={0}
        max={flockQuantity}
        />
        <p className="text-xs text-gray-500 mt-1">
        Maximum: {flockQuantity} sujets
        </p>
    </div>
    
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Cause (optionnelle)
        </label>
        <Select
        value={cause}
        onChange={(e) => setCause(e.target.value)}
        >
        <option value="">Non spécifiée</option>
        <option value="maladie">Maladie</option>
        <option value="cannibalisme">Cannibalisme</option>
        <option value="stress">Stress thermique</option>
        <option value="asphyxie">Asphyxie</option>
        <option value="malformation">Malformation congénitale</option>
        <option value="autre">Autre</option>
        </Select>
    </div>
    </div>

    {/* Indicateur de taux */}
    {quantity > 0 && (
    <div className={`p-3 rounded-lg ${isHighRisk ? 'bg-red-50' : isMediumRisk ? 'bg-orange-50' : 'bg-green-50'}`}>
        <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Taux de mortalité</span>
        <span className={`font-bold ${isHighRisk ? 'text-red-600' : isMediumRisk ? 'text-orange-600' : 'text-green-600'}`}>
            {mortalityRate.toFixed(1)}%
        </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
            className={`rounded-full h-2 transition-all ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(mortalityRate, 100)}%` }}
        />
        </div>
        <p className="text-xs text-gray-600 mt-2">
        {flockQuantity - quantity} sujets restants après enregistrement
        </p>
        {isHighRisk && (
        <p className="text-xs text-red-600 mt-2">
            Alerte: Taux de mortalité élevé, une inspection sanitaire est recommandée
        </p>
        )}
    </div>
    )}

    {/* Boutons d'action */}
    <div className="flex gap-3 pt-2">
    <Button variant="outline" onClick={onCancel} className="flex-1">
        Annuler
    </Button>
    <Button onClick={handleSubmit} disabled={loading || quantity === 0} className="flex-1 bg-red-600 hover:bg-red-700">
        {loading ? 'Enregistrement...' : 'Enregistrer la mortalité'}
    </Button>
    </div>
</div>
);
}