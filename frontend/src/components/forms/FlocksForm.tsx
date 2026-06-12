import { useState, useEffect } from 'react';
import { Button } from "../common/button";
import { flocksAPI, farmsAPI, poultryHousesAPI, bandsAPI } from "../../services/api";
import { Flock, Farm, PoultryHouse, Band, PoultryType } from "../../types";

interface FlocksFormProps {
flock?: Flock | null;
onClose: () => void;
onSave: (flock: Flock) => void;
}

export function FlocksForm({ flock, onClose, onSave }: FlocksFormProps) {
const [loading, setLoading] = useState(false);
const [loadingHouses, setLoadingHouses] = useState(false);
const [loadingBands, setLoadingBands] = useState(false);

const [farms, setFarms] = useState<Farm[]>([]);
const [poultryHouses, setPoultryHouses] = useState<PoultryHouse[]>([]);
const [bands, setBands] = useState<Band[]>([]);

const [formData, setFormData] = useState({
name: '',
farmId: '',
poultryHouseId: '',
bandId: '',
especeId: '',
poultryType: '' as PoultryType | '',
quantity: '',
cycle: '',
age: '',              // ← Garder en string pour l'input
startDate: '',
status: 'active' as 'active' | 'closed',
});

// Charger les fermes du manager connecté
useEffect(() => {
loadManagerFarms();
}, []);

// Charger le formulaire en mode édition
useEffect(() => {
if (flock) {
    setFormData({
    name: flock.name || '',
    farmId: flock.farmId || '',
    poultryHouseId: flock.poultryHouseId || '',
    bandId: flock.bandId || '',
    especeId: (flock as any).especeId || '',  // ← Cast pour éviter l'erreur TypeScript
    poultryType: flock.poultryType || '',
    quantity: flock.quantity?.toString() || '',
    cycle: flock.cycle?.toString() || '',
    age: flock.age?.toString() || '',         // ← number → string
    startDate: flock.startDate ? new Date(flock.startDate).toISOString().slice(0, 16) : '',
    status: flock.status || 'active',
    });
    
    if (flock.farmId) {
    loadPoultryHousesByFarm(flock.farmId);
    loadBandsByFarm(flock.farmId);
    }
}
}, [flock]);

const loadManagerFarms = async () => {
try {
    const farmsData = await farmsAPI.getMyManagedFarms();
    setFarms(farmsData);
} catch (error) {
    console.error("Erreur chargement des fermes:", error);
}
};

const loadPoultryHousesByFarm = async (farmId: string) => {
if (!farmId) {
    setPoultryHouses([]);
    setFormData(prev => ({ ...prev, poultryHouseId: '' }));
    return;
}

setLoadingHouses(true);
try {
    const housesData = await poultryHousesAPI.getByFarm(farmId);
    const activeHouses = housesData.filter((house: PoultryHouse) => house.active !== false);
    setPoultryHouses(activeHouses);
    setFormData(prev => ({ ...prev, poultryHouseId: '' }));
} catch (error) {
    console.error("Erreur chargement des salles:", error);
    setPoultryHouses([]);
} finally {
    setLoadingHouses(false);
}
};

const loadBandsByFarm = async (farmId: string) => {
if (!farmId) {
    setBands([]);
    setFormData(prev => ({ ...prev, bandId: '', especeId: '' }));
    return;
}

setLoadingBands(true);
try {
    const bandsData = await bandsAPI.getByFarm(farmId);
    const activeBands = bandsData.filter((band: Band) => band.status === 'active');
    setBands(activeBands);
    setFormData(prev => ({ ...prev, bandId: '', especeId: '' }));
} catch (error) {
    console.error("Erreur chargement des bandes:", error);
    setBands([]);
} finally {
    setLoadingBands(false);
}
};

const handleFarmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
const farmId = e.target.value;
setFormData(prev => ({ ...prev, farmId, poultryHouseId: '', bandId: '', especeId: '' }));
loadPoultryHousesByFarm(farmId);
loadBandsByFarm(farmId);
};

const handleBandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
const bandId = e.target.value;
const selectedBand = bands.find(band => band.id === bandId);

setFormData(prev => ({
    ...prev,
    bandId: bandId,
    especeId: selectedBand?.espece_id || '',
}));
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);

try {
    const payload = {
    name: formData.name,
    farm_id: formData.farmId,
    poultry_house_id: formData.poultryHouseId,
    band_id: formData.bandId,
    espece_id: formData.especeId,
    poultry_type: formData.poultryType,
    quantity: parseInt(formData.quantity) || 0,
    cycle: parseInt(formData.cycle) || 0,
    age: parseInt(formData.age) || 0,           // ← string → number
    start_date: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
    status: formData.status,
    };


    let savedFlock;
    
    if (flock) {
    savedFlock = await flocksAPI.update(flock.id, payload);
    } else {
    savedFlock = await flocksAPI.create(payload);
    }
    
    onSave(savedFlock);
    onClose();
} catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    alert("Erreur lors de l'enregistrement du lot");
} finally {
    setLoading(false);
}
};

return (
<form onSubmit={handleSubmit} className="space-y-4">
    {/* Nom du lot */}
    <input
    type="text"
    name="name"
    value={formData.name}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    placeholder="Nom du lot"
    required
    />

    {/* Ferme */}
    <select title='ferme'
    name="farmId"
    value={formData.farmId}
    onChange={handleFarmChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    disabled={!!flock}
    >
    <option value="">Sélectionner la ferme</option>
    {farms.map((farm) => (
        <option key={farm.id} value={farm.id}>{farm.name}</option>
    ))}
    </select>

    {/* Salle d'élevage */}
    <select title='salle'
    name="poultryHouseId"
    value={formData.poultryHouseId}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    disabled={!formData.farmId || loadingHouses}
    >
    <option value="">
        {loadingHouses ? 'Chargement...' : 'Sélectionner la salle'}
    </option>
    {poultryHouses.map((house) => (
        <option key={house.id} value={house.id}>{house.name}</option>
    ))}
    </select>

    {/* Bande */}
    <select title='Bande'
    name="bandId"
    value={formData.bandId}
    onChange={handleBandChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    disabled={!formData.farmId || loadingBands}
    >
    <option value="">
        {loadingBands ? 'Chargement...' : 'Sélectionner la bande'}
    </option>
    {bands.map((band) => (
        <option key={band.id} value={band.id}>{band.name}</option>
    ))}
    </select>

    {/* Type de volaille
    <select title='type'
    name="poultryType"
    value={formData.poultryType}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    > 
    <option value="">Sélectionner le type</option>
    <option value="broiler">Poulet de chair (Broiler)</option>
    <option value="layer">Poule pondeuse (Layer)</option>
    <option value="turkey">Dinde (Turkey)</option>
    <option value="duck">Canard (Duck)</option>
    <option value="goose">Oie (Goose)</option>
    </select>*/}

    {/* Effectif initial */}
    <input
    type="number"
    name="quantity"
    value={formData.quantity}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    placeholder="Effectif initial"
    required
    />

    {/* Cycle (en jours) */}
    <input
    type="number"
    name="cycle"
    value={formData.cycle}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    placeholder="Cycle (en jours)"
    required
    />

    {/* Âge (en jours) */}
    <input
    type="number"
    name="age"
    value={formData.age}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    placeholder="Âge (en jours)"
    required
    />

    {/* Date d'entrée */}
    <input title='date entree'
    type="datetime-local"
    name="startDate"
    value={formData.startDate}
    onChange={handleChange}
    className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    />

    {/* Statut (uniquement en mode édition) */}
    {flock && (
    <select title="statut"
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
        <option value="active">Actif</option>
        <option value="closed">Fermé</option>
    </select>
    )}

    {/* Boutons */}
    <div className="flex gap-3 pt-4">
    <Button 
        type="submit" 
        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
        disabled={loading || !formData.farmId || !formData.poultryHouseId || !formData.bandId}
    >
        {loading ? 'Enregistrement...' : (flock ? 'Modifier' : 'Enregistrer')}
    </Button>
    <button
        type="button"
        onClick={onClose}
        className="flex-1 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        disabled={loading}
    >
        Annuler
    </button>
    </div>
</form>
);
}