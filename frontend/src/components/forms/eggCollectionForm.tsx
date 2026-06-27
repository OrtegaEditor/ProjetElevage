// frontend/src/components/specific/EggCollectionTab.tsx
import { useState } from "react";
import { Egg, Scale } from "lucide-react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { Select } from "../common/select";
import { Textarea } from "../ui/textarea";

interface EggCollectionTabProps {
  flockId: string;
  onSave: (data: { eggCount: number; eggSize: 'small' | 'medium' | 'large'; notes: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EggCollectionTab({ onSave, onCancel, loading }: EggCollectionTabProps) {
  const [eggCount, setEggCount] = useState(0);
  const [eggSize, setEggSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (eggCount > 0) {
      onSave({ eggCount, eggSize, notes });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Egg className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-gray-800">Collecte d'œufs</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'œufs collectés
          </label>
          <Input
            type="number"
            value={eggCount}
            onChange={(e) => setEggCount(Math.max(0, Number(e.target.value)))}
            placeholder="Ex: 120"
            min={0}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calibre des œufs
          </label>
          <Select
            value={eggSize}
            onChange={(e) => setEggSize(e.target.value as any)}
          >
            <option value="small">Petit (moins de 53g)</option>
            <option value="medium">Moyen (53-63g)</option>
            <option value="large">Gros (plus de 63g)</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optionnel)
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Qualité, anomalies, remarques..."
          rows={3}
        />
      </div>

      {/* Statistiques suggérées */}
      {eggCount > 0 && (
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Estimation</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Poids total estimé:</span>
              <span className="ml-2 font-semibold">
                {(eggCount * (eggSize === 'small' ? 0.050 : eggSize === 'medium' ? 0.058 : 0.068)).toFixed(1)} kg
              </span>
            </div>
            <div>
              <span className="text-gray-600">Prix estimé:</span>
              <span className="ml-2 font-semibold text-green-700">
                {(eggCount * (eggSize === 'small' ? 75 : eggSize === 'medium' ? 100 : 125)).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={loading || eggCount === 0} className="flex-1 bg-orange-600 hover:bg-orange-700">
          {loading ? 'Enregistrement...' : 'Enregistrer la collecte'}
        </Button>
      </div>
    </div>
  );
}