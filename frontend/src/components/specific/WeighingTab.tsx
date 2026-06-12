// frontend/src/components/specific/WeighingTab.tsx
import { useState, useEffect } from "react";
import { Scale, TrendingUp } from "lucide-react";
import { Button } from "../common/button";
import { Input } from "../common/input";

interface WeighingTabProps {
  flockQuantity: number;
  flockAge: number;
  onSave: (data: { averageWeight: number; sampleSize: number; stdDeviation: number; weights: number[] }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function WeighingTab({ flockQuantity, flockAge, onSave, onCancel, loading }: WeighingTabProps) {
  const [precision, setPrecision] = useState<'5' | '10' | '15'>('10');
  const [sampleSize, setSampleSize] = useState(0);
  const [weights, setWeights] = useState<number[]>([]);
  const [averageWeight, setAverageWeight] = useState(0);
  const [stdDeviation, setStdDeviation] = useState(0);

  // Calculer la taille d'échantillon recommandée selon la précision
  const calculateSampleSize = () => {
    const population = flockQuantity;
    const precisionValue = parseInt(precision) / 100;
    
    const z = 1.96;
    const p = 0.5;
    const e = precisionValue;
    
    let n = (z * z * p * (1 - p)) / (e * e);
    
    if (population < 10000) {
      n = n / (1 + (n - 1) / population);
    }
    
    return Math.max(5, Math.ceil(n));
  };

  // Suggestion basée sur la taille du lot
  const getSuggestion = () => {
    if (flockQuantity < 100) return Math.max(5, Math.ceil(flockQuantity * 0.15));
    if (flockQuantity < 500) return Math.max(10, Math.ceil(flockQuantity * 0.1));
    if (flockQuantity < 1000) return Math.max(20, Math.ceil(flockQuantity * 0.07));
    return Math.max(30, Math.ceil(Math.sqrt(flockQuantity) * 1.5));
  };

  // Mettre à jour la taille d'échantillon quand la précision change
  useEffect(() => {
    const recommended = calculateSampleSize();
    setSampleSize(Math.min(recommended, flockQuantity));
    setWeights(new Array(Math.min(recommended, flockQuantity)).fill(0));
  }, [precision, flockQuantity]);

  // Appliquer la suggestion
  const applySuggestion = () => {
    const suggested = getSuggestion();
    setSampleSize(Math.min(suggested, flockQuantity));
    setWeights(new Array(Math.min(suggested, flockQuantity)).fill(0));
  };

  // Mettre à jour un poids individuel
  const updateWeight = (index: number, value: number) => {
    const newWeights = [...weights];
    newWeights[index] = value;
    setWeights(newWeights);
    
    const validWeights = newWeights.filter(w => w > 0);
    if (validWeights.length > 0) {
      const avg = validWeights.reduce((a, b) => a + b, 0) / validWeights.length;
      setAverageWeight(parseFloat(avg.toFixed(2)));
      
      const variance = validWeights.reduce((acc, w) => acc + Math.pow(w - avg, 2), 0) / validWeights.length;
      setStdDeviation(parseFloat(Math.sqrt(variance).toFixed(3)));
    }
  };

  const handleSubmit = () => {
    if (averageWeight > 0) {
      const validWeights = weights.filter(w => w > 0);
      onSave({ 
        averageWeight, 
        sampleSize, 
        stdDeviation, 
        weights: validWeights 
      });
    }
  };

  const targetWeight = (flockAge * 0.045).toFixed(2);

  return (
    <div className="space-y-5">
      {/* Section précision */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Précision souhaitée</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setPrecision('15')}
            className={`p-3 rounded-lg text-center transition-all ${
              precision === '15' 
                ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500">Basse</div>
            <div className="font-bold text-lg">±15%</div>
          </button>
          <button
            onClick={() => setPrecision('10')}
            className={`p-3 rounded-lg text-center transition-all ${
              precision === '10' 
                ? 'bg-green-100 ring-2 ring-green-500 text-green-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500">Moyenne</div>
            <div className="font-bold text-lg">±10%</div>
          </button>
          <button
            onClick={() => setPrecision('5')}
            className={`p-3 rounded-lg text-center transition-all ${
              precision === '5' 
                ? 'bg-purple-100 ring-2 ring-purple-500 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500">Haute</div>
            <div className="font-bold text-lg">±5%</div>
          </button>
          <button
            onClick={applySuggestion}
            className="p-3 rounded-lg text-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-all"
          >
            <div className="text-xs text-gray-500">Suggestion</div>
            <div className="font-bold text-lg">{getSuggestion()}</div>
            <div className="text-xs">sujets</div>
          </button>
        </div>
      </div>

      {/* Taille de l'échantillon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de sujets à peser
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={sampleSize}
            onChange={(e) => {
              const size = Math.min(Number(e.target.value), flockQuantity);
              setSampleSize(size);
              setWeights(new Array(size).fill(0));
            }}
            min={1}
            max={flockQuantity}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => setSampleSize(calculateSampleSize())}>
            Calculer
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Pour {flockQuantity.toLocaleString()} sujets
        </p>
      </div>

      {/* Saisie des poids individuels */}
      {sampleSize > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poids individuels ({sampleSize} sujets)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-3 border rounded-lg bg-gray-50">
            {Array.from({ length: sampleSize }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="text-xs text-gray-500 w-7">#{idx + 1}</span>
                <Input
                  type="number"
                  step="0.01"
                  value={weights[idx] || ''}
                  onChange={(e) => updateWeight(idx, parseFloat(e.target.value) || 0)}
                  placeholder="kg"
                  className="text-sm py-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats calculés */}
      {averageWeight > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Poids moyen</p>
              <p className="text-2xl font-bold text-blue-700">{averageWeight} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Écart-type</p>
              <p className="text-2xl font-bold text-blue-700">{stdDeviation} kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparaison avec objectif */}
      <div className="bg-yellow-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-yellow-800">Objectif à {flockAge} jours</p>
            <p className="text-xl font-bold text-yellow-900">{targetWeight} kg</p>
          </div>
          {averageWeight > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-yellow-800">Écart</p>
              <p className={`text-lg font-bold ${averageWeight > parseFloat(targetWeight) ? 'text-green-600' : 'text-red-600'}`}>
                {((averageWeight - parseFloat(targetWeight)) / parseFloat(targetWeight) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={loading || averageWeight === 0} className="flex-1 bg-green-600 hover:bg-green-700">
          {loading ? 'Enregistrement...' : 'Enregistrer la pesée'}
        </Button>
      </div>
    </div>
  );
}