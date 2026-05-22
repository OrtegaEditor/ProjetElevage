import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Scale, Activity, ShoppingCart, Printer } from "lucide-react"; // Icône Printer ajoutée
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { mockFlocks, mockTreatments } from "../data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weightHistory = [
{ age: 7, poidsReel: 0.18, poidsObjectif: 0.19 },
{ age: 14, poidsReel: 0.45, poidsObjectif: 0.48 },
{ age: 21, poidsReel: 0.92, poidsObjectif: 0.95 },
{ age: 28, poidsReel: 1.42, poidsObjectif: 1.45 },
{ age: 35, poidsReel: 1.85, poidsObjectif: 1.90 },
];

export function FlockDetailPage() {
const navigate = useNavigate();
const { flockId } = useParams<{ flockId: string }>();

const flock = mockFlocks.find((f) => f.id === flockId) || mockFlocks[0];

if (!flock) return <div className="p-6">Lot introuvable</div>;

// ─── CALCULS DE PERFORMANCE ─────────────────────────────────────────
const totalInjected = flock.quantity;
const currentLiving = totalInjected - flock.mortality;
const realMortalityRate = (flock.mortality / totalInjected) * 100;
const prixKiloMoyen = 1400; 
const valeurMarchandeEstimee = currentLiving * flock.averageWeight * prixKiloMoyen;
const indiceConsommation = 1.72; 

const isReadyForSale = flock.age >= 35 && flock.averageWeight >= 1.8;
const hasSanitaryRisk = realMortalityRate > 4 || mockTreatments.some(t => t.flockId === flock.id && new Date(t.endDate) >= new Date());

const handleTriggerSale = () => {
if (confirm(`Confirmer la mise en vente du lot ${flock.name} (${currentLiving} sujets) ?`)) {
    navigate("/sales");
}
};

// ─── FONCTION IMPRESSION / EXPORT PDF ────────────────────────────────
const handlePrint = () => {
window.print();
};

return (
<div className="space-y-6 p-2 print:p-0 print:space-y-4 bg-white">
    
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="flex items-center gap-4">
        {/* Masqué sur le PDF/Impression */}
        <Button variant="outline" className="p-2 border print:hidden" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Analyse de Performance : {flock.name}</h1>
            <Badge variant={flock.status === "active" ? "success" : "info"}>
            {flock.status === "active" ? "En croissance" : "Archivé"}
            </Badge>
        </div>
        <p className="text-sm text-gray-500">Bâtiment affecté : {flock.poultryHouseId} • Souche: {flock.poultryType}</p>
        </div>
    </div>

    {/* BLOC BOUTONS D'ACTION (Masqués sur le PDF d'analyse final) */}
    <div className="flex gap-3 w-full md:w-auto print:hidden">
        <Button variant="outline" onClick={handlePrint} className="gap-2 border-gray-300">
        <Printer className="w-4 h-4" />
        Imprimer / PDF
        </Button>
        
        {isReadyForSale && (
        <Button onClick={handleTriggerSale} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white gap-2 font-semibold">
            <ShoppingCart className="w-4 h-4" />
            Lancer l'ordre de Vente
        </Button>
        )}
    </div>
    </div>

    {/* PANNEAU DE RECOMMANDATION LOGIQUE */}
    <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
    isReadyForSale ? "bg-green-50 border-green-200 print:bg-white" : "bg-blue-50 border-blue-200 print:bg-white"
    }`}>
    <div className="flex gap-3">
        <div className={`p-3 rounded-lg print:hidden ${isReadyForSale ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
        <TrendingUp className="w-6 h-6" />
        </div>
        <div>
        <h3 className={`font-bold ${isReadyForSale ? "text-green-900" : "text-blue-900"}`}>
            {isReadyForSale ? "Recommandation : Objectif de poids atteint !" : "Statut : Croissance en cours"}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">
            {isReadyForSale 
            ? `Le lot a atteint un poids moyen de ${flock.averageWeight} kg à ${flock.age} jours. Maintenir le lot au-delà de ce cycle augmentera l'Indice de Consommation sans valeur ajoutée. Commercialisation recommandée.`
            : `Le lot est actuellement à ${flock.age} jours. Le rythme de croissance est conforme aux objectifs de la souche.`}
        </p>
        </div>
    </div>
    </div>

    {/* COMPTEURS KPI */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-2">
    <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="p-4 flex items-center justify-between">
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Effectif Vivant</p>
            <h3 className="text-xl font-bold text-gray-900">{currentLiving.toLocaleString()} <span className="text-xs text-gray-400">/ {totalInjected.toLocaleString()}</span></h3>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg print:hidden"><Activity className="w-5 h-5" /></div>
        </CardContent>
    </Card>

    <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="p-4 flex items-center justify-between">
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Poids Moyen</p>
            <h3 className="text-xl font-bold text-gray-900">{flock.averageWeight} kg</h3>
        </div>
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg print:hidden"><Scale className="w-5 h-5" /></div>
        </CardContent>
    </Card>

    <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="p-4 flex items-center justify-between">
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Taux Mortalité</p>
            <h3 className={`text-xl font-bold ${hasSanitaryRisk ? "text-red-600" : "text-gray-900"}`}>{realMortalityRate.toFixed(1)}%</h3>
        </div>
        <div className={`p-2 rounded-lg print:hidden ${hasSanitaryRisk ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}`}><AlertTriangle className="w-5 h-5" /></div>
        </CardContent>
    </Card>

    <Card className="print:shadow-none print:border-gray-300">
        <CardContent className="p-4 flex items-center justify-between">
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Valeur Estimée</p>
            <h3 className="text-xl font-bold text-green-700">{valeurMarchandeEstimee.toLocaleString()} FCFA</h3>
        </div>
        <div className="p-2 bg-green-50 text-green-600 rounded-lg print:hidden"><DollarSign className="w-5 h-5" /></div>
        </CardContent>
    </Card>
    </div>

    {/* ZONE GRAPHIQUE ET DETAILS */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
    {/* Graphique de croissance */}
    <Card className="lg:col-span-2 print:border-gray-300 print:shadow-none">
        <CardHeader><CardTitle>Suivi Pondéral vs Standard de la Souche</CardTitle></CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weightHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="age" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="poidsReel" stroke="#2E7D32" strokeWidth={3} name="Poids Réel" dot={true} />
            <Line type="monotone" dataKey="poidsObjectif" stroke="#94A3B8" strokeDasharray="5 5" name="Objectif" dot={false} />
            </LineChart>
        </ResponsiveContainer>
        </CardContent>
    </Card>

    {/* Efficacité */}
    <Card className="print:border-gray-300 print:shadow-none">
        <CardHeader><CardTitle>Indicateurs d'Efficacité</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Âge actuel</span>
            <span className="font-semibold text-gray-900">{flock.age} jours</span>
        </div>
        <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Durée du cycle</span>
            <span className="font-semibold text-gray-900">{flock.cycle} jours</span>
        </div>
        <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Indice de Consommation</span>
            <span className="font-semibold text-blue-600">{indiceConsommation}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Statut Sanitaire</span>
            <Badge variant={hasSanitaryRisk ? "danger" : "success"}>
            {hasSanitaryRisk ? "Alerte" : "Sain"}
            </Badge>
        </div>
        </CardContent>
    </Card>
    </div>
</div>
);
}
