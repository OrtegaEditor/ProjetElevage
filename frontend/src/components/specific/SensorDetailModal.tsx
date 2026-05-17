import { X, Thermometer, Droplet, Wind, Activity } from "lucide-react";
import { Badge } from "../common/badge";
import { Sensor } from "../../types";
import { mockPoultryHouses } from "../../data/mockData";

interface SensorDetailModalProps {
sensor: Sensor;
onClose: () => void;
}

const getSensorIcon = (type: string) => {
switch (type) {
    case "temperature": return <Thermometer className="w-6 h-6" />;
    case "light": return <Droplet className="w-6 h-6" />;
    case "ammoniac": return <Wind className="w-6 h-6" />;
    default: return <Activity className="w-6 h-6" />;
}
};

export function SensorDetailModal({ sensor, onClose }: SensorDetailModalProps) {
const house = mockPoultryHouses.find(h => h.id === sensor.poultryHouseId);

return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Détails du capteur</h2>
        <button title="Détails du capteur" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
        </button>
        </div>

        <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
            {getSensorIcon(sensor.type)}
            </div>
            <div>
            <h3 className="font-semibold text-gray-900">{sensor.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{sensor.type}</p>
            </div>
            <div className="ml-auto">
            <Badge variant={
                sensor.status === "online" ? "success" :
                sensor.status === "warning" ? "warning" : "danger"
            }>
                {sensor.status}
            </Badge>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Valeur actuelle</p>
            <p className="text-xl font-semibold text-gray-900">{sensor.value} {sensor.unit}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Poulailler</p>
            <p className="text-sm font-medium text-gray-900">{house?.name ?? "-"}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Seuil minimum</p>
            <p className="text-lg font-semibold text-gray-900">{sensor.minValue ?? "-"} {sensor.unit}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Seuil maximum</p>
            <p className="text-lg font-semibold text-gray-900">{sensor.maxValue ?? "-"} {sensor.unit}</p>
            </div>
        </div>

        <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Dernière mise à jour</p>
            <p className="text-sm font-medium text-gray-900">
            {new Date(sensor.lastUpdate).toLocaleString("fr-FR")}
            </p>
        </div>
        </div>

        <div className="p-6 border-t border-gray-200">
        <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
            Fermer
        </button>
        </div>
    </div>
    </div>
);
}