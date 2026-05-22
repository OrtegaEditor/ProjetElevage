import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { mockFarms, mockPoultryHouses, mockFlocks } from "../data/mockData";
import type { PoultryHouse, Sensor } from "../types"; // Import du type Sensor ajouté
import { PoultryHouseForm } from "../components/forms/PoultryHousesForm";
import { PoultryHouseDetailModal } from "../components/specific/PoultryHouseDetailModal";
import { SensorFormModal } from "@/components/forms/SensorFormModal";

export function PoultryHousesPage() {
const navigate = useNavigate();
const { farmId } = useParams<{ farmId: string }>();

// ─── States ────────────────────────────────────────────────────────────
const [rooms, setRooms] = useState(
mockPoultryHouses.filter((h) => h.farmId === farmId)
);

// Modal : Détails
const [detailModal, setDetailModal] = useState({
open: false,
house: null as PoultryHouse | null,
});

// Modal : Formulaire (Ajouter/Modifier)
const [formModal, setFormModal] = useState({
open: false,
house: null as PoultryHouse | null,
});

// Modal : Capteurs (Automatisation) - Adapté pour stocker l'état complet du formulaire
const [sensorModal, setSensorModal] = useState({
open: false,
houseId: null as string | null,
sensor: null as Sensor | null,
});

// ─── Données ⸺
const farm = mockFarms.find((f) => f.id === farmId);
if (!farm) return <div>Poulailler non trouvé</div>;

const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
const totalOccupancy = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
const occupancyRate = totalCapacity > 0
? ((totalOccupancy / totalCapacity) * 100).toFixed(1)
: "0";

// ─── Fonctions utilitaires ──────
const getFlocksByRoom = (roomId: string) =>
mockFlocks.filter((f) => f.poultryHouseId === roomId).length;

const getAnimalsInRoom = (roomId: string) =>
mockFlocks
    .filter((f) => f.poultryHouseId === roomId)
    .reduce((sum, f) => sum + f.quantity, 0);

// ─── Handlers ──────
const handleOpenDetail = (house: PoultryHouse) => {
setDetailModal({ open: true, house });
};

const handleCloseDetail = () => {
setDetailModal({ open: false, house: null });
};

const handleOpenForm = (house?: PoultryHouse) => {
setFormModal({
    open: true,
    house: house || null,
});
};

const handleCloseForm = () => {
setFormModal({ open: false, house: null });
};

const handleSavePoultryHouse = (data: PoultryHouse) => {
if (formModal.house) {
    console.log("Modifier salle :", data);
    // TODO: appel API pour mise à jour
} else {
    console.log("Ajouter nouvelle salle :", data);
    // TODO: appel API pour création
}
handleCloseForm();
};

// Modifié : Ouvre directement le formulaire de capteurs quand on clique sur Automatiser
const handleAutomate = (house: PoultryHouse) => {
setSensorModal({
    open: true,
    houseId: house.id,
    sensor: null, // Mode ajout par défaut pour un nouveau capteur
});
handleCloseDetail();
};

const handleCloseSensorModal = () => {
setSensorModal({ open: false, houseId: null, sensor: null });
};

// Handler ajouté : Gère la sauvegarde du nouveau capteur
const handleSaveSensor = (sensorData: Sensor) => {
console.log("Nouveau capteur enregistré :", sensorData);
// TODO: Relier à votre système (Ex: appel API ou ajout dans un mockState)
handleCloseSensorModal();
};

const handleDelete = (house: PoultryHouse) => {
if (confirm(`Êtes-vous sûr de vouloir supprimer "${house.name}" ?`)) {
    setRooms((prev) => prev.filter((r) => r.id !== house.id));
    console.log("Supprimer salle :", house.id);
    // TODO: appel API
}
};

const handleSearch = (searchTerm: string) => {
const filtered = mockPoultryHouses
    .filter((h) => h.farmId === farmId)
    .filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
setRooms(filtered);
};

const handleFilter = (poultryType: string) => {
const filtered = mockPoultryHouses
    .filter((h) => h.farmId === farmId)
    .filter((h) => !poultryType || h.poultryType === poultryType);
setRooms(filtered);
};

// ─── Render ────────────────────────────────────────────────────────────
return (
<div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
        <Button
        onClick={() => navigate("/poultry-houses")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">
            {farm.name}
        </h1>
        <p className="text-gray-600 text-sm">{farm.address}</p>
        </div>
    </div>

    <Button
        onClick={() => handleOpenForm()}
        className="gap-2"
    >
        <Plus className="w-4 h-4" />
        Nouvelle Salle
    </Button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Total salles</p>
        <h2 className="text-3xl font-bold text-gray-900">
            {rooms.length}
        </h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Capacité totale</p>
        <h2 className="text-3xl font-bold text-gray-900">
            {totalCapacity}
        </h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Occupation</p>
        <h2 className="text-3xl font-bold text-gray-900">
            {totalOccupancy}
        </h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Taux occupation</p>
        <h2 className="text-3xl font-bold text-gray-900">
            {occupancyRate}%
        </h2>
        </CardContent>
    </Card>
    </div>

    {/* Recherche & Filtre */}
    <div className="flex gap-4">
    <Input
        type="text"
        placeholder="Rechercher une salle..."
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    />
    <select
        title="Critère"
        onChange={(e) => handleFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    >
        <option value="">Tous les types</option>
        <option value="broiler">Poulets de chair</option>
        <option value="layer">Poules pondeuses</option>
        <option value="turkey">Dindes</option>
        <option value="duck">Canards</option>
        <option value="goose">Oies</option>
    </select>
    </div>

    {/* Grille des salles */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {rooms.map((room: PoultryHouse) => {
        const percentage = (
        (room.currentOccupancy / room.capacity) *
        100
        ).toFixed(1);
        const flocksCount = getFlocksByRoom(room.id);
        const animalsCount = getAnimalsInRoom(room.id);

        return (
        <Card
            key={room.id}
            className="hover:shadow-lg transition-shadow"
        >
            <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                <CardTitle>{room.name}</CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                    {room.poultryType}
                </p>
                </div>
                {room.hasAutomation && (
                <Badge variant="success">Automatisée</Badge>
                )}
            </div>
            </CardHeader>

            <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Capacité</p>
                <p className="font-semibold text-gray-900">
                    {room.capacity}
                </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Occupation</p>
                <p className="font-semibold text-gray-900">
                    {room.currentOccupancy} ({percentage}%)
                </p>
                </div>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
                <p>Lots actifs : {flocksCount}</p>
                <p>Volailles totales : {animalsCount}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={() => handleOpenDetail(room)}>
                    <Eye className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenForm(room)}>
                    <Pencil className="w-4 h-4 text-blue-500" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(room)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
            </CardContent>
        </Card>
        );
    })}
    </div>

        {/* Modal : Détails du bâtiment */}
    <PoultryHouseDetailModal
      open={detailModal.open}
      onClose={handleCloseDetail}
      poultryHouse={detailModal.house}
      onAutomate={handleAutomate}
    />

    {/* Modal : Ajouter / Modifier salle */}
    {formModal.open && (
      <PoultryHouseForm
      open={formModal.open}
        onClose={handleCloseForm}
        onSave={handleSavePoultryHouse}
        initialData={formModal.house || undefined}
      />
    )}

    {/* Modal : Ajouter capteur */}
    {sensorModal.open && (
      <SensorFormModal
        open={sensorModal.open}
        onClose={handleCloseSensorModal}
        onSave={handleSaveSensor}
        sensor={sensorModal.sensor}
      />
    )}
    
  </div>
);
}