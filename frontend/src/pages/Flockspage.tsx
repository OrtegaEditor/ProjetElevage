import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye } from "lucide-react";

import { Card, CardContent } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Modal } from "@/components/forms/modal";
import { FlocksForm } from "../components/forms/FlocksForm";
import { FeedingTab } from "@/components/specific/FeedingTab";
import MortalityForm from "../components/forms/mortalityForm";
import { flocksAPI } from "../services/api";
import { Flock, Mortality } from "../types";

export function Flockspage() {
const navigate = useNavigate();
const [flocks, setFlocks] = useState<Flock[]>([]);
const [loading, setLoading] = useState(true);
const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
const [modalOpen, setModalOpen] = useState(false);
const [isWeighingOpen, setIsWeighingOpen] = useState(false);
const [isMortalityOpen, setIsMortalityOpen] = useState(false);

const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");
const [selectedFarmId, setSelectedFarmId] = useState<string>("all");

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

useEffect(() => {
fetchData();
}, []);

const fetchData = async () => {
try {
    setLoading(true);
    const data = await flocksAPI.getAll();
    console.log("Lots recus:", data);
    setFlocks(data || []);
} catch (err) {
    console.error("Erreur chargement des lots:", err);
    setFlocks([]);
} finally {
    setLoading(false);
}
};

const farmsWithFlocks = useMemo(() => {
let filteredFlocks = flocks;

if (searchTerm) {
    filteredFlocks = filteredFlocks.filter(flock =>
    flock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

if (statusFilter !== "all") {
    filteredFlocks = filteredFlocks.filter(flock => flock.status === statusFilter);
}

if (selectedFarmId !== "all") {
    filteredFlocks = filteredFlocks.filter(flock => flock.farmId === selectedFarmId);
}

const farmMap = new Map<string, { farmId: string; farmName: string; flocks: Flock[] }>();

filteredFlocks.forEach(flock => {
    const farmId = flock.farmId;
    if (!farmMap.has(farmId)) {
    farmMap.set(farmId, {
        farmId: farmId,
        farmName: flock.farmName,
        flocks: []
    });
    }
    farmMap.get(farmId)!.flocks.push(flock);
});

return Array.from(farmMap.values());
}, [flocks, searchTerm, statusFilter, selectedFarmId]);

const farmOptions = useMemo(() => {
const farms = new Map<string, string>();
flocks.forEach(flock => {
    if (flock.farmId && !farms.has(flock.farmId)) {
    farms.set(flock.farmId, flock.farmName);
    }
});
return Array.from(farms.entries()).map(([id, name]) => ({ id, name }));
}, [flocks]);

const paginatedFarms = useMemo(() => {
const start = (currentPage - 1) * itemsPerPage;
return farmsWithFlocks.slice(start, start + itemsPerPage);
}, [farmsWithFlocks, currentPage]);

const totalPages = Math.ceil(farmsWithFlocks.length / itemsPerPage);

const stats = useMemo(() => {
const totalBirds = flocks.reduce((sum, f) => sum + (f.quantity || 0), 0);
const totalMortality = flocks.reduce((acc: number, f: Flock) => 
    acc + (f.mortality?.reduce((sum: number, m: Mortality) => sum + m.quantity, 0) || 0), 0);
return {
    active: flocks.filter((l) => l.status === "active").length,
    total: flocks.length,
    birds: totalBirds,
    mortality: totalMortality,
    avgWeight: flocks.length > 0 
    ? (flocks.reduce((sum, f) => sum + (f.averageWeight || 0), 0) / flocks.length).toFixed(1) 
    : "0"
};
}, [flocks]);

const [refreshTrigger, setRefreshTrigger] = useState(0);

const handleMortalitySaved = async () => {
    console.log("Mortalite enregistree, rechargement des lots...");
    await fetchData();
    setRefreshTrigger(prev => prev + 1);
    setIsMortalityOpen(false);
    setSelectedFlock(null);
};


const handleRefresh = async () => {
await fetchData();
setModalOpen(false);
setIsWeighingOpen(false);
setIsMortalityOpen(false);
setSelectedFlock(null);
};

const handleViewDetail = (flockId: string) => {
navigate(`/flocks/${flockId}`);
};

useEffect(() => {
setCurrentPage(1);
}, [searchTerm, statusFilter, selectedFarmId]);

if (loading) {
return (
    <div className="flex justify-center items-center h-64">
    <div className="text-gray-500">Chargement des lots...</div>
    </div>
);
}

return (
<div className="space-y-6 p-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
    <h1 className="text-2xl font-semibold">Gestion des lots</h1>
    <Button 
        variant="primary" 
        onClick={() => { 
        setSelectedFlock(null); 
        setModalOpen(true); 
        }}
    >
        <Plus className="w-5 h-5 mr-2" /> Nouveau lot
    </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
    <Card>
        <CardContent className="p-4">
        <p className="text-sm text-gray-500">Total lots</p>
        <p className="text-2xl font-semibold">{stats.total}</p>
        </CardContent>
    </Card>
    <Card>
        <CardContent className="p-4">
        <p className="text-sm text-gray-500">Lots actifs</p>
        <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
        </CardContent>
    </Card>
    <Card>
        <CardContent className="p-4">
        <p className="text-sm text-gray-500">Total volailles</p>
        <p className="text-2xl font-semibold">{stats.birds.toLocaleString()}</p>
        </CardContent>
    </Card>
    <Card>
        <CardContent className="p-4">
        <p className="text-sm text-gray-500">Poids moyen</p>
        <p className="text-2xl font-semibold">{stats.avgWeight} kg</p>
        </CardContent>
    </Card>
    <Card>
        <CardContent className="p-4">
        <p className="text-sm text-gray-500">Mortalite totale</p>
        <p className="text-2xl font-semibold text-red-600">{stats.mortality.toLocaleString()}</p>
        </CardContent>
    </Card>
    </div>

    <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
    <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
            type="text"
            placeholder="Rechercher un lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Rechercher un lot par nom"
        />
        </div>
        
        <select
        title="Filtrer par statut"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as any)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
        <option value="all">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="closed">En vente</option>
        </select>
        
        <select
        title="Filtrer par ferme"
        value={selectedFarmId}
        onChange={(e) => setSelectedFarmId(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
        <option value="all">Toutes les fermes</option>
        {farmOptions.map(farm => (
            <option key={farm.id} value={farm.id}>{farm.name}</option>
        ))}
        </select>
    </div>
    
    <div className="text-sm text-gray-500">
        {farmsWithFlocks.length} ferme(s) avec lots
    </div>
    </div>

    {paginatedFarms.length === 0 ? (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucun lot trouve</p>
        <Button 
        variant="primary" 
        className="mt-4"
        onClick={() => { setSelectedFlock(null); setModalOpen(true); }}
        >
        <Plus className="w-5 h-5 mr-2" /> Creer votre premier lot
        </Button>
    </div>
    ) : (
    <>
        {paginatedFarms.map((farm) => (
        <div key={farm.farmId} className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-emerald-700 border-l-4 border-emerald-600 pl-3">
            {farm.farmName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.flocks.map((flock) => {
                const totalMortality = flock.mortality?.reduce((sum, m) => sum + m.quantity, 0) || 0;
                const currentQuantity = (flock.quantity || 0) - totalMortality;
                const mortalityRate = flock.quantity > 0 ? (totalMortality / flock.quantity * 100).toFixed(1) : 0;
                
                return (
                <div key={flock.id} className="p-5 border rounded-lg hover:shadow-md bg-white transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">Lot {flock.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                        Salle: {flock.poultryHouseName}
                        </p>
                        <p className="text-xs text-gray-500">
                        Debut: {flock.startDate ? new Date(flock.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <Badge variant={flock.status === 'active' ? 'success' : 'outline'}>
                        {flock.status === 'active' ? 'Actif' : 'En vente'}
                    </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Initial</div>
                        <b>{flock.quantity?.toLocaleString()}</b>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Mortalite</div>
                        <b className="text-red-600">{totalMortality.toLocaleString()}</b>
                        <div className="text-xs text-gray-400">{mortalityRate}%</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500">Actuel</div>
                        <b className="text-blue-600">{currentQuantity.toLocaleString()}</b>
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                    <div>Cycle: {flock.cycle} jours</div>
                    <div>Age: {flock.age || 0} jours</div>
                    <div>Poids moyen: {flock.averageWeight || 0} kg</div>
                    {flock.bandName && <div>Bande: {flock.bandName}</div>}
                    </div>
                    
                    <div className="flex gap-2 justify-end pt-4 border-t">
                    {/* <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => { 
                        setSelectedFlock(flock); 
                        setIsWeighingOpen(true); 
                        }}
                        disabled={flock.status !== 'active'}
                        title="Alimentation"
                    >
                        Alimentation
                    </Button> */}
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => { 
                        setSelectedFlock(flock); 
                        setIsMortalityOpen(true); 
                        }}
                        disabled={flock.status !== 'active'}
                        title="Declarer une mortalite"
                    >
                        Mortalite
                    </Button>
                    <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={() => handleViewDetail(flock.id)}
                        title="Voir les details du lot"
                    >
                        <Eye className="w-4 h-4 mr-1" /> Voir detail
                    </Button>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        ))}
        
        {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
            <Button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            variant="secondary"
            title="Page precedente"
            >
            Precedent
            </Button>
            <span className="self-center text-sm">
            Page {currentPage} sur {totalPages}
            </span>
            <Button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            variant="secondary"
            title="Page suivante"
            >
            Suivant
            </Button>
        </div>
        )}
    </>
    )}

    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Gestion Lot">
    <FlocksForm 
        flock={selectedFlock} 
        onClose={() => setModalOpen(false)} 
        onSave={handleRefresh} 
    />
    </Modal>

    <Modal isOpen={isMortalityOpen} onClose={() => setIsMortalityOpen(false)} title="Declarer mortalite">
    <MortalityForm
        flockId={selectedFlock?.id}
        flockName={selectedFlock?.name}
        onSave={handleMortalitySaved}
        onCancel={() => setIsMortalityOpen(false)}
    />
    </Modal>
</div>
);
}