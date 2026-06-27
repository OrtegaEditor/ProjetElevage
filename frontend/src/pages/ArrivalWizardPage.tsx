import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Truck, ClipboardList, Building2, FileText } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent } from "../components/common/card";
import { farmsAPI } from "../services/api";
import { Step1BandForm } from "../components/forms/Step1BandForm";
import { Step2Verification } from "../components/forms/Step2Verification";
import { Step3RoomAllocation } from "@/components/forms/Step3RoomAllocation";
import { Step4Summary } from "@/components/forms/Step4Summary";
import type { Farm } from "../types";

export interface BandData {
name: string;
farmId: string;
especeId: string;
quantity: number;
supplier: string;
prixUnitaire: number;
restockDate: string;
initialAge: number; 
CurrentAge : number;
cycleDuration: number;
notes: string;
}

export interface VerificationData {
receivedQuantity: number;
mortalityOnArrival: number;
healthyQuantity: number;
observations: string;
}

export interface RoomAllocation {
poultryHouseId: string;
poultryHouseName: string;
quantity: number;
capacity: number;
occupancyRate: number;
}

export function ArrivalWizardPage() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();
const farmId = searchParams.get("farmId");

const [step, setStep] = useState(1);
const [farm, setFarm] = useState<Farm | null>(null);
const [loading, setLoading] = useState(true);

// Données des étapes
const [bandData, setBandData] = useState<BandData | undefined>(undefined);
const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
const [allocations, setAllocations] = useState<RoomAllocation[]>([]);

const totalSteps = 4;

useEffect(() => {
if (farmId) {
    fetchFarm();
}
}, [farmId]);

const fetchFarm = async () => {
try {
    const farms = await farmsAPI.getAll();
    const currentFarm = farms.find((f: Farm) => f.id === farmId);
    setFarm(currentFarm || null);
} catch (err) {
    console.error("Erreur chargement ferme:", err);
} finally {
    setLoading(false);
}
};

const handleNext = () => {
if (step < totalSteps) {
    setStep(step + 1);
    window.scrollTo(0, 0);
}
};

const handlePrev = () => {
if (step > 1) {
    setStep(step - 1);
    window.scrollTo(0, 0);
}
};

const handleComplete = () => {
navigate(`/poultry-houses/farm/${farmId}`);
};

const getStepIcon = (stepNumber: number) => {
switch (stepNumber) {
    case 1: return <Truck className="w-5 h-5" />;
    case 2: return <ClipboardList className="w-5 h-5" />;
    case 3: return <Building2 className="w-5 h-5" />;
    case 4: return <FileText className="w-5 h-5" />;
    default: return <ChevronRight className="w-5 h-5" />;
}
};

const getStepTitle = (stepNumber: number) => {
switch (stepNumber) {
    case 1: return "Informations arrivage";
    case 2: return "Vérification des sujets";
    case 3: return "Répartition dans les salles";
    case 4: return "Récapitulatif";
    default: return "";
}
};

if (loading) {
return (
    <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
    <p className="text-gray-500">Chargement...</p>
    </div>
);
}

if (!farm) {
return (
    <div className="p-6 text-center">
    <p className="text-red-600">Ferme non trouvée</p>
    <Button variant="primary" className="mt-4" onClick={() => navigate("/farms")}>
        Retour aux fermes
    </Button>
    </div>
);
}

return (
<div className="min-h-screen bg-gray-50">
    {/* Header */}
    <div className="bg-white border-b sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
            <h1 className="text-xl font-semibold text-gray-900">Nouvel arrivage</h1>
            <p className="text-sm text-gray-500">{farm.name}</p>
        </div>
        </div>
    </div>
    </div>
    
    {/* Progress Steps */}
    <div className="bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center flex-1">
            <div className="flex items-center">
                <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    step >= stepNumber
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                >
                {step > stepNumber ? (
                    <Check className="w-5 h-5" />
                ) : (
                    getStepIcon(stepNumber)
                )}
                </div>
                <div className="ml-3 hidden md:block">
                <p className="text-xs text-gray-500">Étape {stepNumber}</p>
                <p className="text-sm font-medium text-gray-700">{getStepTitle(stepNumber)}</p>
                </div>
            </div>
            {stepNumber < totalSteps && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: step > stepNumber ? "100%" : "0%" }}
                />
                </div>
            )}
            </div>
        ))}
        </div>
    </div>
    </div>
    
    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 py-8">
    <Card>
        <CardContent className="p-6 md:p-8">
        {step === 1 && (
            <Step1BandForm
            farmId={farmId!}
            initialData={bandData || undefined}
            onDataChange={setBandData}
            onNext={handleNext}
            />
        )}
        
        {step === 2 && (
            <Step2Verification
            bandData={bandData!}
            initialData={verificationData}
            onDataChange={setVerificationData}
            onNext={handleNext}
            onPrev={handlePrev}
            />
        )}
        
        {step === 3 && (
            <Step3RoomAllocation
            farmId={farmId!}
            bandData={bandData!}
            verificationData={verificationData!}
            initialAllocations={allocations}
            onDataChange={setAllocations}
            onNext={handleNext}
            onPrev={handlePrev}
            />
        )}
        
        {step === 4 && (
            <Step4Summary
            farm={farm}
            bandData={bandData!}
            verificationData={verificationData!}
            allocations={allocations}
            onPrev={handlePrev}
            onComplete={handleComplete}
            />
        )}
        </CardContent>
    </Card>
    </div>
</div>
);
}
export type { Farm };