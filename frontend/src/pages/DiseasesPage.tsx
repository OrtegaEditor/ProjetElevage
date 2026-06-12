import { useState, useEffect } from "react";
import { Button } from "../components/common/button";
import { Input } from "../components/common/input";
import { diseasesAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

interface Disease {
id: string;
name: string;
type: string;
symptoms: string[] | null;
severity: string;
description: string | null;
created_at: string;
updated_at: string;
}

interface DiseaseFormData {
name: string;
type: string;
symptoms: string;
severity: string;
description: string;
}

const DISEASE_TYPES = [
{ value: "viral", label: "Virale" },
{ value: "bacterial", label: "Bactérienne" },
{ value: "parasitic", label: "Parasitaire" },
{ value: "nutritional", label: "Nutritionnelle" },
];

const SEVERITY_LEVELS = [
{ value: "low", label: "Faible", color: "text-green-600 bg-green-50" },
{ value: "medium", label: "Moyenne", color: "text-yellow-600 bg-yellow-50" },
{ value: "high", label: "Haute", color: "text-red-600 bg-red-50" },
];

export function DiseasesPage() {
const { user } = useAuth();
const [diseases, setDiseases] = useState<Disease[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");

// Modal states
const [isModalOpen, setIsModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
const [formData, setFormData] = useState<DiseaseFormData>({
name: "",
type: "viral",
symptoms: "",
severity: "low",
description: "",
});
const [submitting, setSubmitting] = useState(false);

const isAdminOrVet = user?.role === "admin" || user?.role === "veterinarian";
const isAdmin = user?.role === "admin";

// Charger les maladies
const loadDiseases = async () => {
try {
    setLoading(true);
    const data = await diseasesAPI.getAll();
    setDiseases(Array.isArray(data) ? data : data.items || []);
    setError(null);
} catch (err: any) {
    console.error("Erreur lors du chargement:", err);
    setError(err.response?.data?.detail || "Impossible de charger les maladies");
} finally {
    setLoading(false);
}
};

useEffect(() => {
loadDiseases();
}, []);

// Filtrer les maladies par recherche
const filteredDiseases = diseases.filter(disease =>
disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
(disease.description && disease.description.toLowerCase().includes(searchTerm.toLowerCase()))
);

// Ouvrir le modal d'ajout
const handleAdd = () => {
setSelectedDisease(null);
setFormData({
    name: "",
    type: "viral",
    symptoms: "",
    severity: "low",
    description: "",
});
setIsModalOpen(true);
};

// Ouvrir le modal d'édition
const handleEdit = (disease: Disease) => {
setSelectedDisease(disease);
setFormData({
    name: disease.name,
    type: disease.type,
    symptoms: disease.symptoms ? disease.symptoms.join(", ") : "",
    severity: disease.severity,
    description: disease.description || "",
});
setIsModalOpen(true);
};

// Ouvrir le modal de suppression
const handleDeleteClick = (disease: Disease) => {
setSelectedDisease(disease);
setIsDeleteModalOpen(true);
};

// Soumettre le formulaire (création ou modification)
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setSubmitting(true);
setError(null);

try {
    const symptomsArray = formData.symptoms
    .split(",")
    .map(s => s.trim())
    .filter(s => s !== "");

    const diseaseData = {
    name: formData.name,
    type: formData.type,
    symptoms: symptomsArray.length > 0 ? symptomsArray : null,
    severity: formData.severity,
    description: formData.description || null,
    };

    if (selectedDisease) {
    // Modification
    await diseasesAPI.update(selectedDisease.id, diseaseData);
    } else {
    // Création
    await diseasesAPI.create(diseaseData);
    }

    setIsModalOpen(false);
    loadDiseases();
} catch (err: any) {
    console.error("Erreur lors de l'enregistrement:", err);
    setError(err.response?.data?.detail || "Une erreur est survenue");
} finally {
    setSubmitting(false);
}
};

// Supprimer une maladie
const handleDelete = async () => {
if (!selectedDisease) return;

setSubmitting(true);
try {
    await diseasesAPI.delete(selectedDisease.id);
    setIsDeleteModalOpen(false);
    loadDiseases();
} catch (err: any) {
    console.error("Erreur lors de la suppression:", err);
    setError(err.response?.data?.detail || "Impossible de supprimer cette maladie");
} finally {
    setSubmitting(false);
}
};

// Obtenir le libellé de la sévérité
const getSeverityLabel = (severity: string) => {
return SEVERITY_LEVELS.find(s => s.value === severity) || SEVERITY_LEVELS[0];
};

// Obtenir le libellé du type
const getTypeLabel = (type: string) => {
return DISEASE_TYPES.find(t => t.value === type)?.label || type;
};

return (
<div className="p-6 max-w-7xl mx-auto">
    {/* En-tête */}
    <div className="flex justify-between items-center mb-6">
    <div>
        <h1 className="text-2xl font-bold text-gray-900">Maladies</h1>
        <p className="text-gray-500 mt-1">Gestion du catalogue des maladies</p>
    </div>
    {isAdminOrVet && (
        <Button onClick={handleAdd} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Nouvelle maladie
        </Button>
    )}
    </div>

    {/* Barre de recherche */}
    <div className="mb-6">
    <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
        type="text"
        placeholder="Rechercher une maladie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
        />
    </div>
    </div>

    {/* Message d'erreur */}
    {error && (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
    </div>
    )}

    {/* Chargement */}
    {loading ? (
    <div className="text-center py-12 text-gray-500">Chargement des maladies...</div>
    ) : filteredDiseases.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">
        {searchTerm ? "Aucune maladie ne correspond à votre recherche" : "Aucune maladie enregistrée"}
        </p>
        {!searchTerm && isAdminOrVet && (
        <Button onClick={handleAdd} variant="outline" className="mt-4">
            Créer la première maladie
        </Button>
        )}
    </div>
    ) : (
    /* Liste des maladies */
    <div className="grid gap-4">
        {filteredDiseases.map((disease) => (
        <div
            key={disease.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900">{disease.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityLabel(disease.severity).color}`}>
                    {getSeverityLabel(disease.severity).label}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                    {getTypeLabel(disease.type)}
                </span>
                </div>
                
                {disease.symptoms && disease.symptoms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {disease.symptoms.map((symptom, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {symptom}
                    </span>
                    ))}
                </div>
                )}
                
                {disease.description && (
                <p className="mt-2 text-sm text-gray-500">{disease.description}</p>
                )}
            </div>
            
            {isAdminOrVet && (
                <div className="flex gap-2 ml-4">
                <button
                    onClick={() => handleEdit(disease)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Modifier"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                {isAdmin && (
                    <button
                    onClick={() => handleDeleteClick(disease)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Supprimer"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                )}
                </div>
            )}
            </div>
        </div>
        ))}
    </div>
    )}

    {/* Modal d'ajout/modification */}
    {isModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
            {selectedDisease ? "Modifier la maladie" : "Nouvelle maladie"}
            </h2>
            <button
            onClick={() => setIsModalOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nom */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la maladie *
            </label>
            <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maladie de Newcastle"
            />
            </div>

            {/* Type */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
            </label>
            <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {DISEASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                    {type.label}
                </option>
                ))}
            </select>
            </div>

            {/* Sévérité */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Sévérité *
            </label>
            <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {SEVERITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                    {level.label}
                </option>
                ))}
            </select>
            </div>

            {/* Symptômes */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptômes
            </label>
            <Input
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Ex: fièvre, diarrhée, léthargie (séparés par des virgules)"
            />
            <p className="text-xs text-gray-400 mt-1">
                Séparez les symptômes par des virgules
            </p>
            </div>

            {/* Description */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
            </label>
            <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée de la maladie..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            </div>

            <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Enregistrement..." : (selectedDisease ? "Modifier" : "Créer")}
            </Button>
            </div>
        </form>
        </div>
    </div>
    )}

    {/* Modal de confirmation de suppression */}
    {isDeleteModalOpen && selectedDisease && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Confirmer la suppression</h2>
        </div>
        <div className="p-6">
            <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer la maladie <span className="font-semibold">{selectedDisease.name}</span> ?
            </p>
            <p className="text-sm text-red-500 mt-2">
            Cette action est irréversible.
            </p>
        </div>
        <div className="px-6 py-4 border-t flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
            Annuler
            </Button>
            <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Suppression..." : "Supprimer"}
            </Button>
        </div>
        </div>
    </div>
    )}
</div>
);
}