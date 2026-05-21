import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Input } from "../components/common/input";
import { mockFarms, mockPoultryHouses, mockFlocks } from "../data/mockData";
import { PoultryHouse } from "../types";

export function PoultryHousesPage() {
const navigate = useNavigate();
const { farmId } = useParams<{ farmId: string }>();
const [rooms, setRooms] = useState(
mockPoultryHouses.filter(h => h.farmId === farmId)
);

const farm = mockFarms.find(f => f.id === farmId);
if (!farm) return <div>Poulailler non trouvé</div>;

// Stats
const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
const totalOccupancy = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
const occupancyRate = ((totalOccupancy / totalCapacity) * 100).toFixed(1);

// Lots par salle
const getFlocksByRoom = (roomId: string) =>
mockFlocks.filter(f => f.poultryHouseId === roomId).length;

const getAnimalsInRoom = (roomId: string) =>
mockFlocks
    .filter(f => f.poultryHouseId === roomId)
    .reduce((sum, f) => sum + f.quantity, 0);

return (
<div className="space-y-6">
    {/* HEADER */}
        <div className="flex justify-end">
            <Button> <Plus className="w-4 h-4 mr-2" />
                Nouvelle salle
            </Button>
        </div>
    <div className="flex items-center gap-4 mb-6">
    <Button
        onClick={() => navigate("/poultry-houses")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
        <ArrowLeft className="w-5 h-5 text-white-600" />
    </Button>
    <div>
        <h1 className="text-2xl font-semibold text-gray-900">{farm.name}</h1>
        <p className="text-gray-600 text-sm">{farm.address}</p>
    </div>
    </div>

    {/* STATS */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Total salles</p>
        <h2 className="text-3xl font-bold text-gray-900">{rooms.length}</h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Capacité totale</p>
        <h2 className="text-3xl font-bold text-gray-900">{totalCapacity}</h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Occupation</p>
        <h2 className="text-3xl font-bold text-gray-900">{totalOccupancy}</h2>
        </CardContent>
    </Card>

    <Card>
        <CardContent className="pt-6">
        <p className="text-sm text-gray-500 mb-1">Taux occupation</p>
        <h2 className="text-3xl font-bold text-gray-900">{occupancyRate}%</h2>
        </CardContent>
    </Card>
    </div>
    {/* RECHERCHE & FILTRE */}
    <div className="flex gap-4">
    <Input type="text" placeholder="Rechercher une salle..."  onChange={(e) => {
        const filtered = mockPoultryHouses
            .filter(h => h.farmId === farmId)
            .filter(h => h.name.toLowerCase().includes(e.target.value.toLowerCase()));
        setRooms(filtered);
        }}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    />
    <select title="Critère" onChange={(e) => {const filtered = mockPoultryHouses.filter(h => h.farmId === farmId)
            .filter(h => !e.target.value || h.poultryType === e.target.value);
        setRooms(filtered);
        }}
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
    {/* GRILLE SALLES */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {rooms.map((room: PoultryHouse) => {
        const percentage = ((room.currentOccupancy / room.capacity) * 100).toFixed(1);
        const flocksCount = getFlocksByRoom(room.id);
        const animalsCount = getAnimalsInRoom(room.id);

        return (
        <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
            <div className="flex items-start justify-between">
                <div>
                <CardTitle>{room.name}</CardTitle>
                <p className="text-xs text-gray-500 mt-1">{room.poultryType}</p>
                </div>
                {room.hasAutomation && (
                <Badge variant="success">Automatisée</Badge>
                )}
            </div>
            </CardHeader>

            <CardContent className="space-y-4">
            {/* Infos principales */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Capacité</p>
                <p className="font-semibold text-gray-900">{room.capacity}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Occupation</p>
                <p className="font-semibold text-gray-900">{room.currentOccupancy}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Lots actifs</p>
                <p className="font-semibold text-gray-900">{flocksCount}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total sujets</p>
                <p className="font-semibold text-gray-900">{animalsCount}</p>
                </div>
            </div>

            {/* Barre occupation */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Occupation</span>
                <span className="font-semibold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#2E7D32] transition-all"
                    style={{ width: `${percentage}%` }}
                />
                </div>
            </div>

            {/* Statuts IoT */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 border rounded-lg text-center">
                <p className="text-gray-500">Ventilation</p>
                <p className="font-semibold text-gray-900 mt-1">{room.ventilationStatus}</p>
                </div>
                <div className="p-2 border rounded-lg text-center">
                <p className="text-gray-500">Lumière</p>
                <p className="font-semibold text-gray-900 mt-1">{room.lightingStatus}</p>
                </div>
                <div className="p-2 border rounded-lg text-center">
                <p className="text-gray-500">Chauffage</p>
                <p className="font-semibold text-gray-900 mt-1">{room.heatingStatus}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Button variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
                </Button>
                <Button className="p-2 border bg-white border-gray-300 rounded-lg hover:bg-gray-100">
                <Pencil className="w-4 h-4 text-blue-600" />
                </Button>
                <Button className="p-2 border bg-white border-gray-300 rounded-lg hover:bg-red-50">
                <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>
            </CardContent>
        </Card>
        );
    })}
    </div>
</div>
);
}