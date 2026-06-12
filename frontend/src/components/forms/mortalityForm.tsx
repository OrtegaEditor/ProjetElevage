import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { flocksAPI } from '@/services/api';

interface MortalityFormProps {
flockId?: string;
flockName?: string;
onSave: () => void;
onCancel: () => void;
}

interface MortalityFormData {
flock_id: string;
quantity: number;
mortality_date: string;
cause: string;
}

const MortalityForm: React.FC<MortalityFormProps> = ({ flockId, flockName, onSave, onCancel }) => {
const [loading, setLoading] = useState(false);
const [currentFlockName, setCurrentFlockName] = useState(flockName || '');
const [flockOptions, setFlockOptions] = useState<{ id: string; name: string }[]>([]);
const [showFlockSelect, setShowFlockSelect] = useState(!flockId);

const { register, handleSubmit, setValue, formState: { errors } } = useForm<MortalityFormData>({
defaultValues: {
    flock_id: flockId || "",
    quantity: 1,
    mortality_date: new Date().toISOString().split('T')[0],
    cause: ""
}
});

useEffect(() => {
if (!flockId) {
    loadFlocks();
} else {
    loadFlockName();
}
}, [flockId]);

const loadFlocks = async () => {
try {
    const flocks = await flocksAPI.getAll();
    const options = flocks.map((flock: any) => ({
    id: flock.id,
    name: flock.name
    }));
    setFlockOptions(options);
} catch (error) {
    console.error("Erreur chargement des lots:", error);
}
};

const loadFlockName = async () => {
if (!flockId) return;
try {
    const flock = await flocksAPI.getById(flockId);
    setCurrentFlockName(flock.name);
} catch (error) {
    console.error("Erreur chargement du lot:", error);
}
};

const onSubmit = async (data: MortalityFormData) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('access_token');
    
    const payload = {
      flock_id: data.flock_id,
      quantity: parseInt(data.quantity.toString()),
      mortality_date: data.mortality_date,
      cause: data.cause || null
    };

    const response = await axios.post('http://127.0.0.1:8000/api/v1/flocks/mortalities', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Reponse API:", response.data);
    
    // Afficher les nouvelles stats
    if (response.data.flock) {
      alert(`Mortalite enregistree!\n\nLot: ${response.data.flock.name}\nEffectif initial: ${response.data.flock.initial_quantity}\nMortalite totale: ${response.data.flock.total_mortality}\nEffectif actuel: ${response.data.flock.current_quantity}`);
    }
    
    // Forcer le rechargement
    onSave();
    
  } catch (error) {
    console.error("Erreur envoi:", error);
    alert("Erreur lors de l'enregistrement de la mortalite.");
  } finally {
    setLoading(false);
  }
};

const handleFlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
const selectedId = e.target.value;
setValue('flock_id', selectedId);
const selectedFlock = flockOptions.find(f => f.id === selectedId);
if (selectedFlock) {
    setCurrentFlockName(selectedFlock.name);
}
};

return (
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
    <h3 className="font-bold text-lg text-gray-800">Enregistrer une mortalite</h3>

    <div className="bg-gray-50 p-3 rounded-md">
    <label className="block text-sm font-medium text-gray-700">Lot concerne</label>
    {showFlockSelect ? (
        <select
        title="Selectionner le lot"
        {...register("flock_id", { required: true })}
        onChange={handleFlockChange}
        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
        <option value="">-- Selectionner un lot --</option>
        {flockOptions.map(flock => (
            <option key={flock.id} value={flock.id}>{flock.name}</option>
        ))}
        </select>
    ) : (
        <div className="mt-1 p-2 bg-gray-100 border rounded text-gray-700 font-medium">
        {currentFlockName || 'Lot non specifie'}
        <input type="hidden" {...register("flock_id")} />
        </div>
    )}
    {errors.flock_id && <span className="text-red-500 text-xs">Veuillez selectionner un lot</span>}
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700">Quantite (nombre d'animaux morts)</label>
    <input
        type="number"
        title="Quantite"
        {...register("quantity", { required: true, min: 1 })}
        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    {errors.quantity && <span className="text-red-500 text-xs">Quantite requise (minimum 1)</span>}
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700">Date de mortalite</label>
    <input
        type="date"
        title="Date de mortalite"
        {...register("mortality_date", { required: true })}
        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    {errors.mortality_date && <span className="text-red-500 text-xs">Date requise</span>}
    </div>

    <div>
    <label className="block text-sm font-medium text-gray-700">Cause (optionnel)</label>
    <textarea
        title="Cause"
        {...register("cause")}
        rows={3}
        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Ex: Maladie respiratoire, Chaleur excessive, etc."
    />
    </div>

    <div className="flex space-x-3 pt-2">
    <button
        type="submit"
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
    >
        {loading ? 'Enregistrement...' : 'Enregistrer la mortalite'}
    </button>
    <button
        type="button"
        onClick={onCancel}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
    >
        Annuler
    </button>
    </div>

    <div className="text-xs text-gray-400 mt-2">
    Note: L'effectif du lot sera automatiquement mis a jour apres l'enregistrement.
    </div>
</form>
);
};

export default MortalityForm;