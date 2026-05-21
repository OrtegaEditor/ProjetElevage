import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Select } from "../components/common/select";
import { mockSensors, mockPoultryHouses } from "../data/mockData";
import { SensorDetailModal } from "../components/specific/SensorDetailModal";
import { SensorFormModal } from "../components/forms/SensorFormModal";
import type { Sensor } from "../types";

import {
Thermometer,
Droplet,
Wind,
Activity,
AlertCircle,
RefreshCw,
Plus,
Download,
LightbulbIcon,
Pencil, Trash2,Eye,
} from "lucide-react";
import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
Legend,
} from "recharts";

const liveData = [
{ time: "10:00", temp: 21.5, light: 65, nh3: 1200 },
{ time: "10:15", temp: 21.8, light: 64, nh3: 1250 },
{ time: "10:30", temp: 22.1, light: 63, nh3: 1300 },
{ time: "10:45", temp: 22.5, light: 62, nh3: 1350 },
{ time: "11:00", temp: 22.8, light: 61, nh3: 1400 },
{ time: "11:15", temp: 23.2, light: 60, nh3: 1450 },
];

export function IoTMonitoring() {
const [selectedBuilding, setSelectedBuilding] = useState("all");
const [modalOpen, setModalOpen] = useState(false);
const buildingOptions = [
{ value: "all", label: "Tous les poulaillers" },
...mockPoultryHouses.map((h) => ({ value: h.id, label: h.name })),
];

const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
const [selectedSensor, setSelectedSensor] = useState<Sensor| null>(null);
const [detailModalOpen, setDetailModalOpen] = useState(false);
const handleEdit = (sensor: Sensor) => {setSelectedSensor(sensor);
    setModalOpen(true);
};

const handleSave = (saved: Sensor) => {setSensors(prev =>prev.find(s => s.id === saved.id)
    ? prev.map(s => s.id === saved.id ? saved : s): [...prev, saved]);
};

const handleView = (sensor:Sensor) => {setSelectedSensor(sensor);
    setDetailModalOpen(true);
};

const handleDelete = (id: string) => {setSensors(prev => prev.filter(s => s.id !== id));};

const getSensorIcon = (type: string) => {switch (type) {
    case "temperature":
    return <Thermometer className="w-5 h-5" />;
    case "light":
    return <Droplet className="w-5 h-5" />;
    case "ammoniac":
    return <Wind className="w-5 h-5" />;
    default:
    return <Activity className="w-5 h-5" />;
    }
};

const getSensorStatusColor = (status: string) => {
switch (status) {
case "online":
return "bg-green-100 text-green-700";
case "warning":
return "bg-orange-100 text-orange-700";
case "error":
return "bg-red-100 text-red-700";
default:
return "bg-gray-100 text-gray-700";
}
};

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Monitoring IoT Temps Réel
    </h1>
    <p className="text-gray-600">
    Supervision des capteurs et conditions d'élevage
    </p>
</div>
<div className="flex gap-3">
    <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" /></Button>
    <Select options={buildingOptions} value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}className="w-64"/>
    <Button variant="primary" onClick={() => { setSelectedSensor(null); setModalOpen(true); }}>
        <Plus className="w-5 h-5" /> Nouveau capteur
    </Button>
    <Button variant="primary"><Download className="w-5 h-5"/>Export Excel</Button>
    <Button variant="primary"><Download className="w-5 h-5"/>Export PDF</Button>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<Card>
    <CardHeader>
    <div className="flex items-center justify-between">
        <CardTitle>Température moyenne</CardTitle>
        <Thermometer className="w-5 h-5 text-orange-600" />
    </div>
    </CardHeader>
    <CardContent>
    <div className="text-3xl font-semibold text-gray-900 mb-2">22.8°C</div>
    <div className="flex items-center gap-2 text-sm">
        <Badge variant="success">Normal</Badge>
        <span className="text-gray-600">Plage: 18-24°C</span>
    </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
    <div className="flex items-center justify-between">
        <CardTitle>Taux d'ammoniac moyen</CardTitle>
        <Droplet className="w-5 h-5 text-blue-600" />
    </div>
    </CardHeader>
    <CardContent>
    <div className="text-3xl font-semibold text-gray-900 mb-2">61%</div>
    <div className="flex items-center gap-2 text-sm">
        <Badge variant="success">Normal</Badge>
        <span className="text-gray-600">Plage: 50-80%</span>
    </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
    <div className="flex items-center justify-between">
        <CardTitle>Luminosite moyenne</CardTitle>
        <LightbulbIcon className="w-5 h-5 text-purple-600" />
    </div>
    </CardHeader>
    <CardContent>
    <div className="text-3xl font-semibold text-gray-900 mb-2">1450 ppm</div>
    <div className="flex items-center gap-2 text-sm">
        <Badge variant="warning">Surveillé</Badge>
        <span className="text-gray-600">Seuil: 1500</span>
    </div>
    </CardContent>
</Card>
</div>

<Card>
<CardHeader>
    <CardTitle>Évolution temps réel - Dernière heure</CardTitle>
</CardHeader>
<CardContent>
    <ResponsiveContainer width="100%" height={350}>
    <LineChart data={liveData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" stroke="#666" />
        <YAxis yAxisId="left" stroke="#666" />
        <YAxis yAxisId="right" orientation="right" stroke="#666" />
        <Tooltip />
        <Legend />
        <Line
        yAxisId="left"
        type="monotone"
        dataKey="temp"
        stroke="#FB8C00"
        strokeWidth={2}
        name="Température (°C)"
        dot={{ r: 4 }}
        />
        <Line
        yAxisId="right"
        type="monotone"
        dataKey="light"
        stroke="#1E88E5"
        strokeWidth={2}
        name="lumiere (%)"
        dot={{ r: 4 }}
        />
        <Line
        yAxisId="right"
        type="monotone"
        dataKey="nh3"
        stroke="#9C27B0"
        strokeWidth={2}
        name="Ammoniac (ppm)"
        dot={{ r: 4 }}
        />
    </LineChart>
    </ResponsiveContainer>
</CardContent>
</Card>


<Card>
    <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>État des capteurs ({sensors.length})</CardTitle>
        </div>
    </CardHeader>
    <CardContent>
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
            <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 text-gray-600 font-medium">Nom</th>
            <th className="pb-3 text-gray-600 font-medium">Type</th>
            <th className="pb-3 text-gray-600 font-medium">Poulailler</th>
            <th className="pb-3 text-gray-600 font-medium">Valeur</th>
            <th className="pb-3 text-gray-600 font-medium">Seuil min/max</th>
            <th className="pb-3 text-gray-600 font-medium">Statut</th>
            <th className="pb-3 text-gray-600 font-medium">Dernière MAJ</th>
            <th className="pb-3 text-gray-600 font-medium">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {sensors.map((sensor) => (
            <tr key={sensor.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 font-medium text-gray-900">{sensor.name}</td>
                <td className="py-3 text-gray-600 capitalize">{sensor.type}</td>
                <td className="py-3 text-gray-600">
                {mockPoultryHouses.find(h => h.id === sensor.poultryHouseId)?.name ?? "-"}
                </td>
                <td className="py-3 font-semibold text-gray-900">
                {sensor.value} {sensor.unit}
                </td>
                <td className="py-3 text-gray-600">
                {sensor.minValue ?? "-"} / {sensor.maxValue ?? "-"} {sensor.unit}
                </td>
                <td className="py-3">
                <Badge variant={
                    sensor.status === "online" ? "success" :
                    sensor.status === "warning" ? "warning" : "danger"
                }>
                    {sensor.status}
                </Badge>
                </td>
                <td className="py-3 text-gray-500">
                {new Date(sensor.lastUpdate).toLocaleTimeString("fr-FR")}
                </td>
                <td className="py-3">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => handleView(sensor)}
                        className="p-1.5 bg-blue-100 text-gray-600 hover:bg-gray-50" >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => handleEdit(sensor)}
                        className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-50 ">
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => handleDelete(sensor.id)}
                        className="p-1.5 bg-blue-100  text-red-600 hover:bg-red-50  transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    </div>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
</div>

</CardContent>
</Card>
        {detailModalOpen && selectedSensor && (
        <SensorDetailModal
        sensor={selectedSensor}
        onClose={() => { setDetailModalOpen(false); setSelectedSensor(null); }}
/>
)}
{modalOpen && (
    <SensorFormModal
        sensor={selectedSensor}
        onClose={() => { setModalOpen(false); setSelectedSensor(null); }}
        onSave={handleSave}
    />
    )}
</div>
);
}
