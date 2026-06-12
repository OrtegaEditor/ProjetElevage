import { useState, useEffect } from "react";
import { ChevronRight} from "lucide-react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { especesAPI, suppliersAPI } from "../../services/api";
import type { BandData } from "../../pages/ArrivalWizardPage";

interface Step1BandFormProps {
  farmId: string;
  initialData: BandData | null;
  onDataChange: (data: BandData) => void;
  onNext: () => void;
}

interface Espece {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export function Step1BandForm({ farmId, initialData, onDataChange, onNext }: Step1BandFormProps) {
  const [formData, setFormData] = useState<BandData>({
    name: "",
    farmId: farmId,
    especeId: "",
    quantity: 0,
    supplier: "",
    prixUnitaire: 0,
    restockDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  
  const [especes, setEspeces] = useState<Espece[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    loadEspeces();
    loadSuppliers();
  }, []);
  
  const loadEspeces = async () => {
    try {
      const data = await especesAPI.getAll();
      let especesArray: Espece[] = [];
      if (Array.isArray(data)) {
        especesArray = data;
      } else if (data?.items) {
        especesArray = data.items;
      }
      setEspeces(especesArray);
    } catch (err) {
      console.error("Erreur chargement espèces:", err);
    }
  };
  
  const loadSuppliers = async () => {
    try {
      const data = await suppliersAPI.getAll();
      setSuppliers(data || []);
    } catch (err) {
      console.error("Erreur chargement fournisseurs:", err);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de la bande est requis";
    }
    if (!formData.especeId) {
      newErrors.especeId = "Le type de volaille est requis";
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "La quantité doit être supérieure à 0";
    }
    if (!formData.restockDate) {
      newErrors.restockDate = "La date d'arrivée est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onDataChange(formData);
      onNext();
    }
  };
  
  const handleChange = (field: keyof BandData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Informations générales</h2>
        <p className="text-sm text-gray-500 mb-6">
          Renseignez les informations relatives à l'arrivage des volailles
        </p>
      </div>
      
      <div className="space-y-5">
        {/* Nom de la bande */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la bande <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Ex: Arrivage Mars 2025"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        
        {/* Type de volaille */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de volaille <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.especeId}
            onChange={(e) => handleChange("especeId", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.especeId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Sélectionner un type</option>
            {especes.map((espece) => (
              <option key={espece.id} value={espece.id}>
                {espece.name}
              </option>
            ))}
          </select>
          {errors.especeId && <p className="text-xs text-red-500 mt-1">{errors.especeId}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Quantité commandée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité commandée <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              placeholder="Nombre de sujets"
              value={formData.quantity || ""}
              onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>
          
          {/* Date d'arrivée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'arrivée <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.restockDate}
              onChange={(e) => handleChange("restockDate", e.target.value)}
              className={errors.restockDate ? "border-red-500" : ""}
            />
            {errors.restockDate && <p className="text-xs text-red-500 mt-1">{errors.restockDate}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Fournisseur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => handleChange("supplier", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Sélectionner un fournisseur</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Prix unitaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix unitaire (FCFA)
            </label>
            <Input
              type="number"
              min={0}
              step={100}
              placeholder="0"
              value={formData.prixUnitaire || ""}
              onChange={(e) => handleChange("prixUnitaire", parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Informations supplémentaires sur l'arrivage..."
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          Suivant
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}