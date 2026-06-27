// components/specific/FlockInfoCard.tsx
import { FlockData } from "@/types";

interface FlockInfoCardProps {
flock: FlockData;
}

export function FlockInfoCard({ flock }: FlockInfoCardProps) {
return (
<div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-lg p-4">
    <div className="grid grid-cols-4 gap-4 text-sm">
    <div>
        <span className="text-gray-600">Effectif actuel:</span>
        <p className="font-semibold text-lg">{flock.quantity.toLocaleString()} sujets</p>
    </div>
    <div>
        <span className="text-gray-600">Âge:</span>
        <p className="font-semibold text-lg">{flock.age} jours</p>
    </div>
    <div>
        <span className="text-gray-600">Poids moyen:</span>
        <p className="font-semibold text-lg">{flock.averageWeight} kg</p>
    </div>
    <div>
        <span className="text-gray-600">Bâtiment:</span>
        <p className="font-semibold text-lg truncate">{flock.poultryHouseId}</p>
    </div>
    </div>
</div>
);
}