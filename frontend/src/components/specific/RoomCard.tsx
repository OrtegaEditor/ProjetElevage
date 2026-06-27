// components/rooms/RoomCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Card,CardContent } from "@/components/common/card";

interface RoomCardProps {
room: {
id: string;
name: string;
type: string;
capacity: number;
currentOccupation: number;
activeFlock?: {
    id: string;
    name: string;
    quantity: number;
    age: number;
    status: string;
    averageWeight: number;
} | null;
};
onViewDetails: (roomId: string, flock?: any) => void;
}

export function RoomCard({ room, onViewDetails }: RoomCardProps) {
const navigate = useNavigate();
const occupationRate = (room.currentOccupation / room.capacity) * 100;

const handleViewDetails = () => {
if (room.activeFlock) {
    // Rediriger vers la page du lot actif
    navigate(`/flocks/${room.activeFlock.id}`);
} else {
    // Rediriger vers la page de la salle
    navigate(`/rooms/${room.id}`);
}
};

return (
<Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
    <div className="flex justify-between items-start mb-3">
        <div>
        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
        <p className="text-sm text-gray-500">{room.type}</p>
        </div>
        {room.activeFlock && (
        <Badge variant="success" className="animate-pulse">
            Actif
        </Badge>
        )}
    </div>

    <div className="space-y-3 mb-4">
        <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Occupation</span>
            <span className="font-medium">
            {room.currentOccupation} / {room.capacity} ({Math.round(occupationRate)}%)
            </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div
            className="bg-emerald-500 rounded-full h-2 transition-all"
            style={{ width: `${Math.min(occupationRate, 100)}%` }}
            />
        </div>
        </div>

        {room.activeFlock && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">
                Lot actif: {room.activeFlock.name}
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <span className="text-gray-600">Sujets:</span>
                <span className="ml-2 font-semibold">
                {room.activeFlock.quantity}
                </span>
            </div>
            <div>
                <span className="text-gray-600">Âge:</span>
                <span className="ml-2 font-semibold">
                {room.activeFlock.age} jours
                </span>
            </div>
            <div>
                <span className="text-gray-600">Poids moyen:</span>
                <span className="ml-2 font-semibold">
                {room.activeFlock.averageWeight} kg
                </span>
            </div>
            </div>
        </div>
        )}
    </div>

    <Button
        variant="primary"
        onClick={handleViewDetails}
        className="w-full gap-2"
    >
        <Eye className="w-4 h-4" />
        Voir les détails
    </Button>
    </CardContent>
</Card>
);
}