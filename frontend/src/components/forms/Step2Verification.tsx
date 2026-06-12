import { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import type { BandData, VerificationData } from "../../pages/ArrivalWizardPage";

interface Step2VerificationProps {
  bandData: BandData;
  initialData: VerificationData | null;
  onDataChange: (data: VerificationData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step2Verification({ bandData, initialData, onDataChange, onNext, onPrev }: Step2VerificationProps) {
  const [formData, setFormData] = useState<VerificationData>({
    receivedQuantity: bandData.quantity,
    mortalityOnArrival: 0,
    healthyQuantity: bandData.quantity,
    observations: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, []);
  
  const handleQuantityChange = (received: number, mortality: number) => {
    const healthy = received - mortality;
    setFormData(prev => ({
      ...prev,
      receivedQuantity: received,
      mortalityOnArrival: mortality,
      healthyQuantity: healthy >= 0 ? healthy : 0,
    }));
    if (errors.receivedQuantity) setErrors(prev => ({ ...prev, receivedQuantity: "" }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.receivedQuantity <= 0) {
      newErrors.receivedQuantity = "La quantité reçue doit être supérieure à 0";
    }
    if (formData.mortalityOnArrival > formData.receivedQuantity) {
      newErrors.mortalityOnArrival = "La mortalité ne peut pas dépasser la quantité reçue";
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
  
  const difference = bandData.quantity - formData.receivedQuantity;
  const isShortage = difference > 0;
  const isExcess = difference < 0;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Vérification des sujets</h2>
        <p className="text-sm text-gray-500 mb-6">
          Confirmez la quantité reçue et l'état sanitaire des volailles
        </p>
      </div>
      
      {/* Récapitulatif commande */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Rappel de la commande</p>
        <p className="text-2xl font-bold text-gray-900">{bandData.quantity.toLocaleString()} sujets</p>
        <p className="text-xs text-gray-500 mt-1">{bandData.name}</p>
      </div>
      
      {/* Alerte si écart */}
      {(isShortage || isExcess) && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${isShortage ? "bg-yellow-50 border border-yellow-200" : "bg-blue-50 border border-blue-200"}`}>
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${isShortage ? "text-yellow-600" : "text-blue-600"}`} />
          <div>
            <p className={`font-medium ${isShortage ? "text-yellow-800" : "text-blue-800"}`}>
              {isShortage ? `Manque ${Math.abs(difference)} sujet(s)` : `Excédent de ${Math.abs(difference)} sujet(s)`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isShortage 
                ? "Le fournisseur a livré moins que prévu. Vérifiez le bon de livraison." 
                : "Plus de sujets que prévu. Vérifiez les capacités des salles."}
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-5">
        {/* Quantité reçue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité réellement reçue <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            placeholder="Nombre de sujets reçus"
            value={formData.receivedQuantity || ""}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0, formData.mortalityOnArrival)}
            className={errors.receivedQuantity ? "border-red-500" : ""}
          />
          {errors.receivedQuantity && <p className="text-xs text-red-500 mt-1">{errors.receivedQuantity}</p>}
        </div>
        
        {/* Mortalité à l'arrivée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mortalité constatée à l'arrivée
          </label>
          <Input
            type="number"
            min={0}
            placeholder="Nombre de sujets morts"
            value={formData.mortalityOnArrival || ""}
            onChange={(e) => handleQuantityChange(formData.receivedQuantity, parseInt(e.target.value) || 0)}
            className={errors.mortalityOnArrival ? "border-red-500" : ""}
          />
          {errors.mortalityOnArrival && <p className="text-xs text-red-500 mt-1">{errors.mortalityOnArrival}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Les sujets morts seront déduits automatiquement du stock disponible
          </p>
        </div>
        
        {/* Sujets sains */}
        <div className="bg-emerald-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Sujets sains disponibles</p>
          <p className="text-3xl font-bold text-emerald-700">{formData.healthyQuantity.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 mt-1">
            À répartir dans les salles
          </p>
        </div>
        
        {/* Observations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observations
          </label>
          <textarea
            rows={3}
            value={formData.observations}
            onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="État général des sujets, anomalies constatées..."
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          Suivant
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}