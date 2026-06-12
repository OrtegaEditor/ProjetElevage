import { Card, CardContent, CardHeader, CardTitle } from "../common/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthChartProps {
data: { date: string; weight: number }[];
title?: string;
}

export function GrowthChart({ data, title = "Évolution du poids" }: GrowthChartProps) {
if (data.length === 0) {
return (
    <Card>
    <CardHeader>
        <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="text-center py-12 text-gray-500">Aucune donnée de pesée disponible</div>
    </CardContent>
    </Card>
);
}

return (
<Card>
    <CardHeader>
    <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("fr-FR")} />
        <YAxis />
        <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString("fr-FR")} />
        <Line type="monotone" dataKey="weight" stroke="#2E7D32" strokeWidth={2} name="Poids (kg)" />
        </LineChart>
    </ResponsiveContainer>
    </CardContent>
</Card>
);
}