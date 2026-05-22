import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Activity, Search, Printer, Download } from "lucide-react"; // Import des icônes ajouté
import { Button } from "@/components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { mockFlocks, mockTreatments, mockDiseases, mockVaccinations } from "../data/mockData";

export function HealthRegisterPage() {
const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState<"all" | "treatment" | "vaccination">("all");

// 1. Fusion et formatage chronologique des données
const entries = [
...mockTreatments.map((t) => ({
    id: `t-${t.id}`,
    date: t.startDate,
    flockName: mockFlocks.find((f) => f.id === t.flockId)?.name ?? "Lot inconnu",
    type: "treatment" as const,
    title: mockDiseases.find((d) => d.id === t.diseaseId)?.name ?? "Pathologie non spécifiée",
    product: t.medication,
    details: `Posologie : ${t.dosage}`,
    endDate: t.endDate,
    notes: t.notes,
})),
...mockVaccinations.map((v) => ({
    id: `v-${v.id}`,
    date: v.administrationDate,
    flockName: mockFlocks.find((f) => f.id === v.flockId)?.name ?? "Lot inconnu",
    type: "vaccination" as const,
    title: `Vaccin : ${v.vaccine}`,
    product: v.vaccine,
    details: v.method === "drinking_water" ? "Via eau de boisson" : v.method === "spray" ? "Par pulvérisation" : "Injection",
    endDate: v.nextDueDate ?? null,
    notes: v.notes,
})),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// 2. Filtrage applicatif
const filteredEntries = entries.filter((entry) => {
const matchesSearch =
    entry.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.product.toLowerCase().includes(searchTerm.toLowerCase());

const matchesType = filterType === "all" || entry.type === filterType;

return matchesSearch && matchesType;
});

// ─── FONCTION EXPORT CSV ─────────────────────────────────────────────
const exportToCSV = () => {
// En-têtes du fichier CSV
const headers = ["Date", "Lot", "Type", "Evenement", "Produit", "Details", "Date Fin/Rappel", "Notes"];

// Conversion des lignes filtrées en texte CSV
const rows = filteredEntries.map(entry => [
    new Date(entry.date).toLocaleDateString("fr-FR"),
    entry.flockName,
    entry.type === "treatment" ? "Soin medical" : "Immunisation",
    entry.title,
    entry.product,
    entry.details,
    entry.endDate ? new Date(entry.endDate).toLocaleDateString("fr-FR") : "-",
    entry.notes ?? "-"
]);

// Assemblage final avec encodage universel (UTF-8 avec BOM pour Excel)
const csvContent = "\uFEFF" + [headers, ...rows]
    .map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(";"))
    .join("\n");

const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", `registre_sanitaire_${new Date().toISOString().split('T')[0]}.csv`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
};

// ─── FONCTION IMPRESSION ─────────────────────────────────────────────
const handlePrint = () => {
window.print();
};

return (
<div className="space-y-6">
    {/* Retour et En-tête avec les nouveaux boutons d'action */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
        <Button
        onClick={() => navigate("/dashboard")}
        variant="outline"
        className="p-2 border rounded-lg hover:bg-gray-50 print:hidden"
        >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">Registre Sanitaire Officiel</h1>
        <p className="text-gray-600 text-sm print:hidden">Suivi réglementaire et traçabilité médicale des lots de volailles</p>
        </div>
    </div>

    {/* AJOUT : BOUTONS EXPORT ET IMPRESSION */}
    <div className="flex gap-3 w-full md:w-auto print:hidden">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />
        Imprimer
        </Button>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
        <Download className="w-4 h-4" />
        Exporter en CSV
        </Button>
    </div>
    </div>

    {/* Barre de Recherche et Filtres */}
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border print:hidden">
    <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
        placeholder="Rechercher par lot, maladie ou produit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
        />
    </div>
    <div className="flex gap-2 w-full md:w-auto">
        <Button variant={filterType === "all" ? "primary" : "outline"} size="sm" onClick={() => setFilterType("all")}>
        Tout voir
        </Button>
        <Button variant={filterType === "treatment" ? "primary" : "outline"} size="sm" onClick={() => setFilterType("treatment")}>
        Traitements
        </Button>
        <Button variant={filterType === "vaccination" ? "primary" : "outline"} size="sm" onClick={() => setFilterType("vaccination")}>
        Vaccinations
        </Button>
    </div>
    </div>

    {/* Registre sous forme de Tableau */}
    <Card className="print:border-none print:shadow-none">
    <CardHeader className="print:pb-2">
        <CardTitle>Entrées du registre d'élevage</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead>
            <tr className="border-b border-gray-200 text-gray-500 font-medium bg-gray-50/50 print:bg-transparent">
                <th className="p-3">Date intervention</th>
                <th className="p-3">Lot concerné</th>
                <th className="p-3">Nature / Événement</th>
                <th className="p-3">Substance / Produit</th>
                <th className="p-3">Détails d'administration</th>
                <th className="p-3">Date de fin / Rappel</th>
                <th className="p-3">Notes de suivi</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors print:hover:bg-transparent">
                <td className="p-3 font-medium text-gray-600 whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="p-3">
                    <Badge variant="outline" className="font-semibold text-gray-800 print:border-none print:p-0">
                    {entry.flockName}
                    </Badge>
                </td>
                <td className="p-3">
                    <div className="flex items-center gap-2">
                    {entry.type === "treatment" ? (
                        <span className="flex items-center text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium print:bg-transparent print:text-black print:border-none print:p-0">
                        <Pill className="w-3 h-3 mr-1 print:hidden" /> Soin médical
                        </span>
                    ) : (
                        <span className="flex items-center text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium print:bg-transparent print:text-black print:border-none print:p-0">
                        <Activity className="w-3 h-3 mr-1 print:hidden" /> Immunisation
                        </span>
                    )}
                    <span className="text-gray-900 font-medium">{entry.title}</span>
                    </div>
                </td>
                <td className="p-3 text-gray-900 font-semibold">{entry.product}</td>
                <td className="p-3 text-gray-600 text-xs">{entry.details}</td>
                <td className="p-3 text-gray-500 whitespace-nowrap">
                    {entry.endDate ? new Date(entry.endDate).toLocaleDateString("fr-FR") : "-"}
                </td>
                <td className="p-3 text-gray-500 max-w-xs truncate print:max-w-none print:white-space-normal" title={entry.notes}>
                    {entry.notes ?? "-"}
                </td>
                </tr>
            ))}
            {filteredEntries.length === 0 && (
                <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                    Aucune donnée sanitaire enregistrée correspondant aux critères.
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    </CardContent>
    </Card>
</div>
);
}
