import { useState, useEffect } from "react";
import { Button } from "../../components/common/button";
import { Input } from "../../components/common/input";
import { flocksAPI, poultryHousesAPI, tasksAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface TaskPlanningFormProps {
onClose: () => void;
onSuccess: () => void;
initialData?: {
id: string;
title: string;
type: string;
flockId: string;
poultryHouseId: string;
time: string;
// assignedTo: string;
};
isEditMode?: boolean;
}

interface Flock {
id: string;
name: string;
}

interface PoultryHouse {
id: string;
name: string;
}

export function TaskPlanningForm({ onClose, onSuccess, initialData, isEditMode }: TaskPlanningFormProps) {
const { user } = useAuth();
const [loading, setLoading] = useState(false);
const [flocks, setFlocks] = useState<Flock[]>([]);
const [poultryHouses, setPoultryHouses] = useState<PoultryHouse[]>([]);
const [loadingData, setLoadingData] = useState(true);

const [formData, setFormData] = useState({
title: "",
type: "",
flockId: "",
poultryHouseId: "",
time: "",
});

// Initialiser le formulaire avec les données existantes en mode édition
useEffect(() => {
if (initialData && isEditMode) {
    setFormData({
    title: initialData.title || "",
    type: initialData.type || "",
    flockId: initialData.flockId || "",
    poultryHouseId: initialData.poultryHouseId || "",
    time: initialData.time ? new Date(initialData.time).toISOString().slice(0, 16) : "",
    });
}
}, [initialData, isEditMode]);

useEffect(() => {
loadData();
}, []);

const loadData = async () => {
setLoadingData(true);
try {
    console.log("Chargement des lots et salles...");
    
    const [flocksData, housesData] = await Promise.all([
    flocksAPI.getAll(),
    poultryHousesAPI.getAll()
    ]);
    
    console.log("Réponse flocksAPI:", flocksData);
    console.log("Réponse poultryHousesAPI:", housesData);
    
    // Normalisation des lots
    let flocksArray: Flock[] = [];
    if (Array.isArray(flocksData)) {
    flocksArray = flocksData;
    } else if (flocksData?.items && Array.isArray(flocksData.items)) {
    flocksArray = flocksData.items;
    } else if (flocksData?.data && Array.isArray(flocksData.data)) {
    flocksArray = flocksData.data;
    }
    
    // Normalisation des salles
    let housesArray: PoultryHouse[] = [];
    if (Array.isArray(housesData)) {
    housesArray = housesData;
    } else if (housesData?.items && Array.isArray(housesData.items)) {
    housesArray = housesData.items;
    } else if (housesData?.data && Array.isArray(housesData.data)) {
    housesArray = housesData.data;
    }
    
    console.log("Lots après normalisation:", flocksArray.length);
    console.log("Salles après normalisation:", housesArray.length);
    
    setFlocks(flocksArray);
    setPoultryHouses(housesArray);
    
} catch (error) {
    console.error("Erreur détaillée chargement données:", error);
} finally {
    setLoadingData(false);
}
};

const handleSubmit = async (e: React.FormEvent, resetAfterSubmit = false) => {
e.preventDefault();
setLoading(true);

try {
    const taskData = {
    type: formData.type,
    title: formData.title,
    assignedTo: user?.id,
    flockId: formData.flockId,
    poultryHouseId: formData.poultryHouseId || null,
    time: formData.time,
    status: "pending"
    };

    console.log("Tâche data:", taskData);
    
    if (isEditMode && initialData?.id) {
    await tasksAPI.update(initialData.id, taskData);
    } else {
    await tasksAPI.create(taskData);
    }
    
    if (resetAfterSubmit) {
    setFormData({
        title: "",
        type: "",
        flockId: "",
        poultryHouseId: "",
        time: "",
    });
    } else {
    onSuccess();
    onClose();
    }
} catch (error) {
    console.error("Erreur création/mise à jour tâche:", error);
    alert("Erreur lors de l'enregistrement de la tâche");
} finally {
    setLoading(false);
}
};

const taskTypes = [
{ value: "feeding", label: "Alimentation" },
{ value: "weighing", label: "Pesée" },
{ value: "mortality", label: "Mortalité" },
{ value: "egg_collection", label: "Collecte d'œufs" },
{ value: "cleaning", label: "Nettoyage" },
{ value: "vaccination", label: "Vaccination" },
];

if (loadingData) {
return (
    <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900">
        {isEditMode ? "Modifier la tâche" : "Nouvelle tâche"}
    </h2>
    <div className="text-center py-8 text-gray-500">Chargement des données...</div>
    </div>
);
}

return (
<form className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-900">
    {isEditMode ? "Modifier la tâche" : "Nouvelle tâche"}
    </h2>
    
    <input
    type="text"
    placeholder="Titre de la tâche"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    />
    
    <select
    value={formData.type}
    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    >
    <option value="">Type de tâche</option>
    {taskTypes.map(type => (
        <option key={type.value} value={type.value}>{type.label}</option>
    ))}
    </select>

    <select
    value={formData.flockId}
    onChange={(e) => setFormData({ ...formData, flockId: e.target.value })}
    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    >
    <option value="">Sélectionner un lot</option>
    {flocks.length === 0 ? (
        <option disabled>Aucun lot disponible</option>
    ) : (
        flocks.map((flock) => (
        <option key={flock.id} value={flock.id}>{flock.name}</option>
        ))
    )}
    </select>
    {flocks.length === 0 && !loadingData && (
    <p className="text-xs text-amber-600">Aucun lot trouvé. Veuillez d'abord créer des lots.</p>
    )}

    <select hidden
    value={formData.poultryHouseId}
    onChange={(e) => setFormData({ ...formData, poultryHouseId: e.target.value })}
    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    required
    >
    <option value="">Sélectionner une salle</option>
    {poultryHouses.length === 0 ? (
        <option disabled>Aucune salle disponible</option>
    ) : (
        poultryHouses.map((house) => (
        <option key={house.id} value={house.id}>{house.name}</option>
        ))
    )}
    </select>
    {poultryHouses.length === 0 && !loadingData && (
    <p className="text-xs text-amber-600">Aucune salle trouvée. Veuillez d'abord créer des salles.</p>
    )}

    <Input
    type="datetime-local"
    value={formData.time}
    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
    required
    />

    <div className="flex justify-end gap-3 pt-4">
    <Button type="button" variant="outline" onClick={onClose}>
        Annuler
    </Button>
    <Button type="submit" onClick={(e) => handleSubmit(e, false)} disabled={loading}>
        {loading ? "Enregistrement..." : (isEditMode ? "Modifier" : "Valider")}
    </Button>
    {!isEditMode && (
        <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, true)} disabled={loading}>
        Valider et recommencer
        </Button>
    )}
    </div>
</form>
);
}