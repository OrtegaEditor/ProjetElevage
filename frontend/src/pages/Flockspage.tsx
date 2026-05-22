import { Card,CardContent,CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Plus, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { mockFlocks, mockPoultryHouses } from "../data/mockData";
import { useState } from "react";
import { Flock, Sensor } from "../types";
import { FlocksForm } from "../components/forms/FlocksForm";
import { SensorFormModal } from "../components/forms/SensorFormModal";




export function Flockspage() {

const [isSensorModalOpen, setSensorModalOpen] = useState(false);
const [flocks, setFlocks] = useState<Flock[]>(mockFlocks);
const [modalOpen, setModalOpen] = useState(false);
const [selectedFlock, setSelectedFlock] = useState<Flock| null>(null);
const [detailModalOpen, setDetailModalOpen] = useState(false);

const activeFlocks = mockFlocks.filter((l) => l.status === "active");
const totalBirds = mockFlocks.reduce((sum, flock) => sum + flock.quantity, 0);

const handleSave = (saved: Flock) => {setFlocks(prev =>prev.find(s => s.id === saved.id)
    ? prev.map(s => s.id === saved.id ? saved : s): [...prev, saved]);
};

const handleView = (flock:Flock) => {setSelectedFlock(flock);
    setDetailModalOpen(true);
};

const getPoultryTypeLabel = (type: string) => {
const labels: Record<string, string> = {
broiler: "Poulets de chair",
layer: "Poules pondeuses",
turkey: "Dindes",
duck: "Canards",
goose: "Oies",
};
return labels[type] || type;
};

const getStatusBadge = (status: string) => {
switch (status) {
case "active":
return <Badge variant="success">Actif</Badge>;
case "transferred":
return <Badge variant="info">Transféré</Badge>;
case "sold":
return <Badge variant="default">Vendu</Badge>;
case "closed":
return <Badge variant="outline">Clôturé</Badge>;
default:
return <Badge>{status}</Badge>;
}
};

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Gestion des lots de volailles
    </h1>
    <p className="text-gray-600">
    Suivi des lots et performances avicoles
    </p>
</div>
    <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => { setSelectedFlock(null); setModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2" />
            Nouveau lot
        </Button>
    </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">Lots actifs</p>
        <p className="text-2xl font-semibold text-gray-900">
            {activeFlocks.length}
        </p>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
        <Activity className="w-6 h-6 text-green-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Total volailles
        </p>
        <p className="text-2xl font-semibold text-gray-900">
            {totalBirds.toLocaleString()}
        </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Poids moyen
        </p>
        <p className="text-2xl font-semibold text-gray-900">
            {(
            mockFlocks.reduce((sum, flock) => sum + flock.averageWeight, 0) /
            mockFlocks.length
            ).toFixed(1)}{" "}
            kg
        </p>
        </div>
        <div className="p-3 bg-orange-100 rounded-lg">
        <Activity className="w-6 h-6 text-orange-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Mortalité totale
        </p>
        <p className="text-2xl font-semibold text-gray-900">
            {mockFlocks.reduce((sum, flock) => sum + flock.mortality, 0)}
        </p>
        </div>
        <div className="p-3 bg-red-100 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
    </div>
    </CardContent>
</Card>
</div>

<Card>
<CardHeader>
    <CardTitle>Tous les lots</CardTitle>
</CardHeader>
<CardContent>
    <div className="space-y-4">
    {mockFlocks.map((flock) => {
        const house = mockPoultryHouses.find((h) => h.id === flock.poultryHouseId);
        return (
        <div
            key={flock.id}
            className="p-5 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
            <div className="flex items-start justify-between mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                    Lot {flock.name}
                </h3>
                <Badge variant="info">{getPoultryTypeLabel(flock.poultryType)}</Badge>
                </div>
                <p className="text-sm text-gray-600">
                {house?.name || "Poulailler non trouvé"}
                </p>
            </div>
            {getStatusBadge(flock.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div>
                <p className="text-xs text-gray-500 mb-1">Quantité</p>
                <p className="font-semibold text-gray-900">
                {flock.quantity.toLocaleString()} volailles
                </p>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">Poids moyen</p>
                <p className="font-semibold text-gray-900">
                {flock.averageWeight} kg
                </p>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">Mortalité</p>
                <p className="font-semibold text-red-600">{flock.mortality}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">Âge</p>
                <p className="font-semibold text-gray-900">
                {flock.age} jours
                </p>
            </div>
            <div>
                <p className="text-xs text-gray-500 mb-1">Date début</p>
                <p className="font-semibold text-gray-900">
                {new Date(flock.startDate).toLocaleDateString("fr-FR")}
                </p>
            </div>
            </div>

            <div className="flex gap-2">
            <Button size="sm" variant="primary">
                Voir détails
            </Button>
            <Button size="sm" variant="outline">
                Nouvelle pesée
            </Button>
            <Button size="sm" variant="outline">
                Déclarer mortalité
            </Button>
            </div>
        </div>
        );
    })}
    </div>
</CardContent>
</Card>
    {modalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-xl p-6 rounded-lg relative">
        {/* CROIX */}
        <button
            onClick={() => {
            setModalOpen(false);
            setSelectedFlock(null);
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl">
            ✕
        </button>
        <FlocksForm flock={selectedFlock} onClose={() => {setModalOpen(false); setSelectedFlock(null);}}
            onSave={handleSave}
        />
        </div>
    </div>
    )}
        {isSensorModalOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg rounded-lg p-6 relative">
        {/* bouton fermer */}
        <button
            className="absolute top-2 right-2"
            onClick={() => setSensorModalOpen(false)}
        >
            ✕
        </button>
        {/* ton formulaire existant */}
        <SensorFormModal
            onSave={() => setSensorModalOpen(false)}
            onClose={() => setSensorModalOpen(false)}
        />
    </div>
  </div>
)}
</div>
);
}
