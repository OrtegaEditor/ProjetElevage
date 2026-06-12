// frontend/src/components/forms/TreatmentForm.tsx
import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { treatmentsAPI, flocksAPI, diseasesAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useStockCheck } from "../../hooks/useStockCheck";

interface TreatmentModalProps {
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

export function TreatmentForm({
  open,
  onClose,
  onSuccess,
  selectedFlockId
}: TreatmentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { checkStock, checking, stockResult, clearResult } = useStockCheck();
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    flockId: "",
    diseaseId: "",
    medication: "",
    dosage: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
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

  // Pré-sélectionner le lot si fourni
  useEffect(() => {
    if (open && selectedFlockId) {
      setFormData(prev => ({
        ...prev,
        flockId: selectedFlockId
      }));
    }
  }, [selectedFlockId, open]);

  // Réinitialiser le formulaire quand on ferme
  useEffect(() => {
    if (!open) {
      setFormData({
        flockId: "",
        diseaseId: "",
        medication: "",
        dosage: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
      });
      setError(null);
      setStockError(null);
      setShowRestockDialog(false);
      clearResult();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.medication) {
      setError("Veuillez saisir un médicament");
      return;
    }

    if (!formData.dosage) {
      setError("Veuillez saisir la posologie");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Veuillez saisir les dates de début et fin");
      return;
    }

    const selectedFlock = flocks.find(f => f.id === formData.flockId);
    if (!selectedFlock) {
      setError("Veuillez sélectionner un lot");
      return;
    }

    const farmId = (selectedFlock as any).farmId || (selectedFlock as any).farm_id;
    
    // Vérification du stock AVANT de continuer
    if (farmId) {
      setStockError(null);
      const stockCheck = await checkStock("medication", formData.medication, 1, farmId);
      
      if (!stockCheck.available) {
        setStockError(stockCheck.message);
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
      const startDateObj = new Date(formData.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      
      const endDateObj = new Date(formData.endDate);
      endDateObj.setHours(23, 59, 59, 999);
      
      const treatmentData = {
        diseaseId: formData.diseaseId || null,
        flockId: formData.flockId,
        veterinarian_id: user?.id || null,
        medication: formData.medication,
        dosage: formData.dosage,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        notes: formData.notes || null,
      };
      
      await treatmentsAPI.create(treatmentData);
      
      // Réinitialiser le formulaire
      setFormData({
        flockId: "",
        diseaseId: "",
        medication: "",
        dosage: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
      });
      
      if (onSuccess) onSuccess();
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
          <h2 className="text-xl font-semibold">Nouveau Traitement</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
            <div className="space-y-4">
              {/* Lot */}
              <div>
                <label htmlFor="flockId" className="block text-sm font-medium text-gray-700 mb-1">
                  Choisir le lot *
                </label>
                <select
                  id="flockId"
                  required
                  value={formData.flockId}
                  onChange={(e) => setFormData(p => ({ ...p, flockId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={!!selectedFlockId}
                >
                  <option value="">Sélectionner un lot</option>
                  {flocks.map((flock) => (
                    <option key={flock.id} value={flock.id}>
                      {flock.name} ({flock.quantity} sujets)
                    </option>
                  ))}
                </select>
              </div>

              {/* Maladie */}
              <div>
                <label htmlFor="diseaseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Maladie / Pathologie
                </label>
                <select
                  id="diseaseId"
                  value={formData.diseaseId}
                  onChange={(e) => setFormData(p => ({ ...p, diseaseId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Sélectionner une maladie (optionnel)</option>
                  {Array.isArray(diseases) && diseases.map((disease) => (
                    <option key={disease.id} value={disease.id}>
                      {disease.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Médicament */}
              <div>
                <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                  Médicament *
                </label>
                <Input
                  id="medication"
                  required
                  value={formData.medication}
                  onChange={(e) => setFormData(p => ({ ...p, medication: e.target.value }))}
                  placeholder="Ex: Amoxicilline, Tylosine"
                />
              </div>

              {/* Posologie */}
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                  Posologie *
                </label>
                <Input
                  id="dosage"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="Ex: 1ml / litre d'eau pendant 5 jours"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début *
                  </label>
                  <Input
                    type="date"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin *
                  </label>
                  <Input
                    type="date"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Observations
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                  placeholder="Observations, remarques particulières..."
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || isLoadingData || checking}>
              {loading ? "Enregistrement..." : checking ? "Vérification stock..." : "Enregistrer"}
            </Button>
          </div>
        </form>

        {/* Dialog de réapprovisionnement */}
        {showRestockDialog && stockResult && !stockResult.available && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock insuffisant</h3>
              <p className="text-gray-600 mb-4">{stockResult.message}</p>
              
              {stockResult.current_stock > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  Stock actuel: {stockResult.current_stock} {stockResult.unit}
                </p>
              )}
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowRestockDialog(false);
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
                    window.location.href = `/stock?action=add&category=medication&name=${encodeURIComponent(formData.medication)}`;
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