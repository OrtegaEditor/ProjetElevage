// frontend/src/components/forms/VaccinationForm.tsx
import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { vaccinationsAPI, flocksAPI, diseasesAPI } from "../../services/api";
import { useStockCheck } from "../../hooks/useStockCheck";

interface VaccinationFormProps {
open: boolean;
onClose: () => void;
onSuccess?: () => void;
selectedFlockId?: string | null;
}

interface Flock {
id: string;
name: string;
quantity: number;
farmId?: string;
}

interface Disease {
id: string;
name: string;
}

export function VaccinationForm({ open, onClose, onSuccess, selectedFlockId }: VaccinationFormProps) {
const { checkStock, checking, stockResult, clearResult } = useStockCheck();
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [flocks, setFlocks] = useState<Flock[]>([]);
const [diseases, setDiseases] = useState<Disease[]>([]);
const [isLoadingData, setIsLoadingData] = useState(false);
const [showRestockDialog, setShowRestockDialog] = useState(false);
const [stockError, setStockError] = useState<string | null>(null);

// Stocker les données pour le réapprovisionnement
const [pendingRestock, setPendingRestock] = useState<{
farmId: string;
vaccine: string;
stockItemId: string;
message: string;
currentStock: number;
unit: string;
} | null>(null);

const [formData, setFormData] = useState({
flockId: "",
vaccine: "",
diseaseId: "",
administrationDate: new Date().toISOString().split("T")[0],
nextDueDate: "",
method: "drinking_water" as string,
quantity: 0,
notes: "",
});

// Charger les lots et les maladies
useEffect(() => {
if (open) {
    const loadData = async () => {
    setIsLoadingData(true);
    setError(null);
    setStockError(null);
    try {
        const [flocksData, diseasesData] = await Promise.all([
        flocksAPI.getAll(),
        diseasesAPI.getAll()
        ]);
        
        let flocksArray: Flock[] = [];
        let diseasesArray: Disease[] = [];
        
        if (Array.isArray(flocksData)) {
        flocksArray = flocksData;
        } else if (flocksData?.items && Array.isArray(flocksData.items)) {
        flocksArray = flocksData.items;
        }
        
        if (Array.isArray(diseasesData)) {
        diseasesArray = diseasesData;
        } else if (diseasesData?.items && Array.isArray(diseasesData.items)) {
        diseasesArray = diseasesData.items;
        }
        
        setFlocks(flocksArray);
        setDiseases(diseasesArray);
    } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données nécessaires");
    } finally {
        setIsLoadingData(false);
    }
    };
    loadData();
}
}, [open]);

// Pré-sélectionner le lot et mettre à jour la quantité
useEffect(() => {
if (open && selectedFlockId && flocks.length > 0) {
    const selectedFlock = flocks.find(f => f.id === selectedFlockId);
    setFormData(prev => ({
    ...prev,
    flockId: selectedFlockId,
    quantity: selectedFlock?.quantity || 0,
    }));
}
}, [selectedFlockId, open, flocks]);

// Réinitialiser le formulaire quand on ferme
useEffect(() => {
if (!open) {
    setFormData({
    flockId: "",
    vaccine: "",
    diseaseId: "",
    administrationDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    method: "drinking_water",
    quantity: 0,
    notes: "",
    });
    setError(null);
    setStockError(null);
    setShowRestockDialog(false);
    setPendingRestock(null);
    clearResult();
}
}, [open]);

const handleFlockChange = (flockId: string) => {
const selectedFlock = flocks.find((f) => f.id === flockId);
setFormData((prev) => ({
    ...prev,
    flockId,
    quantity: selectedFlock?.quantity || 0,
}));
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

// Validation de base
if (!formData.vaccine) {
    setError("Veuillez saisir un vaccin");
    return;
}

if (formData.quantity <= 0) {
    setError("Veuillez saisir une quantité valide");
    return;
}

// Récupérer l'ID de la ferme depuis le lot sélectionné
const selectedFlock = flocks.find(f => f.id === formData.flockId);
if (!selectedFlock) {
    setError("Veuillez sélectionner un lot");
    return;
}

const farmId = selectedFlock.farmId;

// Vérification du stock AVANT de continuer
if (farmId) {
    setStockError(null);
    const stockCheckResult = await checkStock("vaccine", formData.vaccine, formData.quantity, farmId);
    
    if (!stockCheckResult.available) {
    setStockError(stockCheckResult.message);
    
    // Stocker les données pour le réapprovisionnement
    setPendingRestock({
        farmId: farmId,
        vaccine: formData.vaccine,
        stockItemId: stockCheckResult.stock_item?.id || "",
        message: stockCheckResult.message,
        currentStock: stockCheckResult.current_stock,
        unit: stockCheckResult.unit
    });
    
    setShowRestockDialog(true);
    return; // SORTIE IMMÉDIATE
    }
} else {
    console.warn("Impossible de vérifier le stock: farmId non disponible");
}

// Si stock OK, continuer avec l'envoi
setLoading(true);
setError(null);

try {
    const adminDateObj = new Date(formData.administrationDate);
    adminDateObj.setHours(12, 0, 0, 0);
    
    let nextDueDateObj = null;
    if (formData.nextDueDate) {
    nextDueDateObj = new Date(formData.nextDueDate);
    nextDueDateObj.setHours(12, 0, 0, 0);
    }
    
    const vaccinationData = {
    vaccine: formData.vaccine,
    diseaseId: formData.diseaseId || null,
    flockId: formData.flockId,
    quantity: formData.quantity,
    method: formData.method,
    administrationDate: adminDateObj.toISOString(),
    nextDueDate: nextDueDateObj ? nextDueDateObj.toISOString() : null,
    notes: formData.notes || null,
    };

    await vaccinationsAPI.create(vaccinationData);
    
    // Réinitialiser le formulaire
    setFormData({
    flockId: "",
    vaccine: "",
    diseaseId: "",
    administrationDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    method: "drinking_water",
    quantity: 0,
    notes: "",
    });
    
    if (onSuccess) {
    onSuccess();
    }
    onClose();
} catch (err: any) {
    console.error("Erreur:", err);
    setError(err.response?.data?.detail || "Une erreur est survenue");
} finally {
    setLoading(false);
}
};

if (!open) return null;

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto shadow-xl">
    <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Nouvelle Vaccination</h2>
    </div>

    <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
        </div>
        )}
        
        {stockError && !showRestockDialog && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
            {stockError}
        </div>
        )}

        {isLoadingData ? (
        <div className="text-center py-8 text-gray-500">Chargement des données...</div>
        ) : (
        <>
            {/* Sélection du Lot */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot de volailles *
            </label>
            <select
                title="Lot de volailles"
                required
                value={formData.flockId}
                onChange={(e) => handleFlockChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!selectedFlockId}
            >
                <option value="">Sélectionner un lot</option>
                {flocks.map((f) => (
                <option key={f.id} value={f.id}>
                    {f.name} ({f.quantity?.toLocaleString() || 0} sujets)
                </option>
                ))}
            </select>
            </div>

            {/* Nom du Vaccin */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du vaccin *
            </label>
            <Input
                required
                placeholder="Ex: Gumboro, Newcastle..."
                value={formData.vaccine}
                onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
            />
            </div>

            {/* Maladie Cible */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Maladie cible
            </label>
            <select
                title="Maladie"
                value={formData.diseaseId}
                onChange={(e) => setFormData({ ...formData, diseaseId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Sélectionner la pathologie (optionnel)</option>
                {diseases.length > 0 ? (
                diseases.map((d) => (
                    <option key={d.id} value={d.id}>
                    {d.name}
                    </option>
                ))
                ) : (
                <option disabled>Aucune maladie disponible</option>
                )}
            </select>
            {diseases.length === 0 && !isLoadingData && (
                <p className="text-xs text-amber-600 mt-1">
                Aucune maladie trouvée. Veuillez d'abord créer des maladies.
                </p>
            )}
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Doses / Quantité *
                </label>
                <Input
                type="number"
                min={1}
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode *
                </label>
                <select
                title="Méthode d'administration"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="drinking_water">Eau de boisson</option>
                <option value="injection">Injection</option>
                <option value="spray">Pulvérisation</option>
                <option value="eye_drop">Goutte oculaire</option>
                </select>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Date admin. *
                </label>
                <Input
                type="date"
                required
                value={formData.administrationDate}
                onChange={(e) => setFormData({ ...formData, administrationDate: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Prochain rappel
                </label>
                <Input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                />
            </div>
            </div>

            {/* Notes */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes / Observations
            </label>
            <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Numéro de lot du vaccin, réactions..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
            />
            </div>
        </>
        )}

        <div className="flex gap-3 pt-2 border-t">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={loading || isLoadingData || checking}>
            {loading ? "Enregistrement..." : checking ? "Vérification stock..." : "Enregistrer"}
        </Button>
        </div>
    </form>

    {/* Dialog de réapprovisionnement */}
    {showRestockDialog && pendingRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock insuffisant</h3>
            <p className="text-gray-600 mb-4">{pendingRestock.message}</p>
            
            {pendingRestock.currentStock > 0 && (
            <p className="text-sm text-gray-500 mb-4">
                Stock actuel: {pendingRestock.currentStock} {pendingRestock.unit}
            </p>
            )}
            
            <div className="flex gap-3">
            <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                setShowRestockDialog(false);
                setPendingRestock(null);
                setStockError(null);
                clearResult();
                }}
            >
                Annuler
            </Button>
            <Button 
                type="button" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                setShowRestockDialog(false);
                const params = new URLSearchParams({
                    category: "vaccine",
                    name: encodeURIComponent(pendingRestock.vaccine),
                    farmId: pendingRestock.farmId,
                    stockItemId: pendingRestock.stockItemId
                });
                window.location.href = `/stock/restock?${params.toString()}`;
                }}
            >
                Réapprovisionner
            </Button>
            </div>
        </div>
        </div>
    )}
    </div>
</div>
);
}