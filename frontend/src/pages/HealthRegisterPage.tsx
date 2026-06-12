// frontend/src/pages/HealthRegisterPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, Activity, Search, Printer, Download, RefreshCw, X, Calendar } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { treatmentsAPI, vaccinationsAPI, flocksAPI } from "../services/api";

interface Entry {
id: string;
date: string;
flockName: string;
type: "treatment" | "vaccination";
title: string;
product: string;
details: string;
endDate: string | null;
notes: string | null;
}

interface Flock {
id: string;
name: string;
}

export function HealthRegisterPage() {
const navigate = useNavigate();
const [entries, setEntries] = useState<Entry[]>([]);
const [flocks, setFlocks] = useState<Flock[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState<"all" | "treatment" | "vaccination">("all");
const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });

useEffect(() => {
fetchData();
}, []);

const fetchData = async () => {
try {
    setLoading(true);
    const [treatments, vaccinations, flocksData] = await Promise.all([
    treatmentsAPI.getAll(),
    vaccinationsAPI.getAll(),
    flocksAPI.getAll()
    ]);
    
    setFlocks(flocksData || []);
    
    const getFlockName = (flockId: string) => {
    const flock = flocksData?.find((f: any) => f.id === flockId);
    return flock?.name || "Lot inconnu";
    };
    
    const treatmentEntries: Entry[] = (treatments || []).map((t: any) => ({
    id: `t-${t.id}`,
    date: t.startDate,
    flockName: getFlockName(t.flockId),
    type: "treatment",
    title: t.medication,
    product: t.medication,
    details: t.dosage ? `Posologie: ${t.dosage}` : "",
    endDate: t.endDate,
    notes: t.notes,
    }));
    
    const vaccinationEntries: Entry[] = (vaccinations || []).map((v: any) => ({
    id: `v-${v.id}`,
    date: v.administrationDate,
    flockName: getFlockName(v.flockId),
    type: "vaccination",
    title: `Vaccin: ${v.vaccine}`,
    product: v.vaccine,
    details: v.method === "drinking_water" ? "Via eau de boisson" : 
                v.method === "spray" ? "Par pulvérisation" : "Injection",
    endDate: v.nextDueDate || null,
    notes: v.notes,
    }));
    
    const allEntries = [...treatmentEntries, ...vaccinationEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setEntries(allEntries);
} catch (error) {
    console.error("Erreur chargement:", error);
} finally {
    setLoading(false);
}
};

const handleRefresh = async () => {
setRefreshing(true);
await fetchData();
setRefreshing(false);
};

const filteredEntries = entries.filter((entry) => {
// Filtre par recherche
const matchesSearch = 
    entry.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));

// Filtre par type
const matchesType = filterType === "all" || entry.type === filterType;

// Filtre par date
let matchesDate = true;
if (dateRange.start) {
    matchesDate = matchesDate && new Date(entry.date) >= new Date(dateRange.start);
}
if (dateRange.end) {
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    matchesDate = matchesDate && new Date(entry.date) <= endDate;
}

return matchesSearch && matchesType && matchesDate;
});

const clearFilters = () => {
setSearchTerm("");
setFilterType("all");
setDateRange({ start: "", end: "" });
};

const exportToCSV = () => {
const headers = ["Date", "Lot", "Type", "Evenement", "Produit", "Details", "Date Fin/Rappel", "Notes"];
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
const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(";")).join("\n");
const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", `registre_sanitaire_${new Date().toISOString().split('T')[0]}.csv`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
};

const handlePrint = () => { window.print(); };

if (loading) {
return (
    <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
);
}

return (
<div className="space-y-6 p-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="p-2 print:hidden">
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">Registre Sanitaire Officiel</h1>
        <p className="text-gray-600 text-sm print:hidden">Suivi réglementaire et traçabilité médicale des lots de volailles</p>
        </div>
    </div>
    <div className="flex gap-3 w-full md:w-auto print:hidden">
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Actualisation..." : "Actualiser"}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />Imprimer
        </Button>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
        <Download className="w-4 h-4" />Exporter en CSV
        </Button>
    </div>
    </div>

    {/* Barre de filtres */}
    <div className="bg-white p-4 rounded-xl border space-y-4 print:hidden">
    <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
            placeholder="Rechercher par lot, maladie, produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
        />
        </div>
        <div className="flex gap-2">
        <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
            type="date"
            placeholder="Date début"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="pl-9 w-40"
            />
        </div>
        <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
            type="date"
            placeholder="Date fin"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="pl-9 w-40"
            />
        </div>
        </div>
    </div>
    
    <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2">
        <Button 
            variant={filterType === "all" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setFilterType("all")}
        >
            Tout voir
        </Button>
        <Button 
            variant={filterType === "treatment" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setFilterType("treatment")}
        >
            Traitements
        </Button>
        <Button 
            variant={filterType === "vaccination" ? "primary" : "outline"} 
            size="sm" 
            onClick={() => setFilterType("vaccination")}
        >
            Vaccinations
        </Button>
        </div>
        
        {(searchTerm || filterType !== "all" || dateRange.start || dateRange.end) && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500">
            <X className="w-4 h-4 mr-1" />
            Effacer tous les filtres
        </Button>
        )}
    </div>
    </div>

    {/* Résumé des filtres actifs */}
    {(searchTerm || filterType !== "all" || dateRange.start || dateRange.end) && (
    <div className="flex flex-wrap gap-2 items-center text-sm">
        <span className="text-gray-500">Filtres actifs:</span>
        {searchTerm && (
        <Badge variant="outline" className="gap-1">
            Recherche: {searchTerm}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
        </Badge>
        )}
        {filterType !== "all" && (
        <Badge variant="outline" className="gap-1">
            Type: {filterType === "treatment" ? "Traitements" : "Vaccinations"}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterType("all")} />
        </Badge>
        )}
        {dateRange.start && (
        <Badge variant="outline" className="gap-1">
            Du: {new Date(dateRange.start).toLocaleDateString("fr-FR")}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setDateRange(prev => ({ ...prev, start: "" }))} />
        </Badge>
        )}
        {dateRange.end && (
        <Badge variant="outline" className="gap-1">
            Au: {new Date(dateRange.end).toLocaleDateString("fr-FR")}
            <X className="w-3 h-3 cursor-pointer" onClick={() => setDateRange(prev => ({ ...prev, end: "" }))} />
        </Badge>
        )}
        <span className="text-gray-400 ml-2">
        {filteredEntries.length} / {entries.length} entrées
        </span>
    </div>
    )}

    <Card className="print:border-none print:shadow-none">
    <CardHeader className="print:pb-2">
        <CardTitle>Entrées du registre d'élevage</CardTitle>
    </CardHeader>
    <CardContent>
        {filteredEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
            Aucune entrée ne correspond à vos critères
        </div>
        ) : (
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
                        <span className="flex items-center text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                            <Pill className="w-3 h-3 mr-1" /> Soin médical
                        </span>
                        ) : (
                        <span className="flex items-center text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                            <Activity className="w-3 h-3 mr-1" /> Immunisation
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
                    <td className="p-3 text-gray-500 max-w-xs truncate" title={entry.notes || ""}>
                    {entry.notes ?? "-"}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </CardContent>
    </Card>
</div>
);
}