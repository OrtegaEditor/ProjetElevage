import { useState } from "react";
import { Button } from "../common/button";
import { Plus, Trash2 } from "lucide-react";
import { flocksAPI } from "../../services/api";

interface WeighingFormProps {
  flockId?: string;
  flockName?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface WeighingStats {
  averageWeight: number;
  minWeight: number;
  maxWeight: number;
  stdDeviation: number;
}

const calcStats = (weights: number[]): WeighingStats | null => {
  if (weights.length === 0) return null;
  
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const variance = weights.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / weights.length;
  const std = Math.sqrt(variance);
  
  return {
    averageWeight: parseFloat(avg.toFixed(3)),
    minWeight: parseFloat(min.toFixed(3)),
    maxWeight: parseFloat(max.toFixed(3)),
    stdDeviation: parseFloat(std.toFixed(3)),
  };
};

export default function WeighingForm({ flockId, flockName, onSave, onCancel }: WeighingFormProps) {
  const [weights, setWeights] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validWeights = weights
    .map(w => parseFloat(w))
    .filter(w => !isNaN(w) && w > 0);
  
  const stats = validWeights.length > 0 ? calcStats(validWeights) : null;

  const addWeightField = () => {
    setWeights([...weights, ""]);
  };

  const updateWeight = (index: number, value: string) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
    setError(null);
  };

  const removeWeight = (index: number) => {
    if (weights.length > 1) {
      setWeights(weights.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!flockId) {
      setError("Lot non spécifié");
      return;
    }

    if (validWeights.length === 0) {
      setError("Veuillez ajouter au moins un poids valide");
      return;
    }

    if (!stats) {
      setError("Impossible de calculer les statistiques");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await flocksAPI.addWeighing({
        flockId: flockId,
        weights: validWeights,
        notes: notes || undefined,
        averageWeight: stats.averageWeight,
        minWeight: stats.minWeight,
        maxWeight: stats.maxWeight,
        stdDeviation: stats.stdDeviation,
      });

      console.log("Pesée enregistrée:", response);
      
      // Afficher un message de confirmation
      alert(`Pesée enregistrée avec succès!\n\nPoids moyen: ${stats.averageWeight} kg\nMin: ${stats.minWeight} kg\nMax: ${stats.maxWeight} kg`);
      
      onSave();
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de la pesée :", error);
      const errorMessage = error.response?.data?.detail || "Erreur lors de l'enregistrement de la pesée";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatsSummary = () => {
    if (!stats) return null;
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs font-medium text-gray-700 mb-2">Résumé des mesures:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Nombre de mesures: <b>{validWeights.length}</b></div>
          <div>Poids moyen: <b>{stats.averageWeight} kg</b></div>
          <div>Min: <b>{stats.minWeight} kg</b></div>
          <div>Max: <b>{stats.maxWeight} kg</b></div>
          <div className="col-span-2">Écart-type: <b>{stats.stdDeviation} kg</b></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Titre */}
      <div className="border-b pb-2">
        <h3 className="font-semibold text-gray-800">Nouvelle pesée</h3>
        {flockName && (
          <p className="text-xs text-gray-500 mt-1">Lot: {flockName}</p>
        )}
      </div>

      {/* Liste des poids */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Poids (kg) <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addWeightField}
            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            title="Ajouter un poids"
          >
            <Plus className="w-3 h-3" /> Ajouter une mesure
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50">
          {weights.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Aucune mesure</p>
          ) : (
            weights.map((weight, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={weight}
                  onChange={(e) => updateWeight(index, e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Ex: ${(1.5 + index * 0.1).toFixed(2)}`}
                  title={`Poids ${index + 1} en kg`}
                />
                <button
                  type="button"
                  title="Supprimer"
                  onClick={() => removeWeight(index)}
                  className="p-1.5 text-red-500 hover:text-red-700 transition"
                  disabled={weights.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        {validWeights.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {validWeights.length} mesure(s) valide(s)
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700">Notes (optionnel)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Observations, conditions de pesée..."
          title="Notes additionnelles"
        />
      </div>

      {/* Résumé des statistiques */}
      {getStatsSummary()}

      {/* Message d'erreur */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
          title="Annuler"
        >
          Annuler
        </button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !stats || validWeights.length === 0}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          title="Enregistrer la pesée"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Enregistrement...
            </span>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </div>
  );
}