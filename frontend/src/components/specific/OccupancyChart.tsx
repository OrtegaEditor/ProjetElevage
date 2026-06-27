    import { Card, CardContent, CardHeader, CardTitle } from "../common/card";
    import type { PoultryHouse } from "../../types";

    interface OccupancyChartProps {
    houses: PoultryHouse[];
    }

    export function OccupancyChart({ houses }: OccupancyChartProps) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>Taux d'occupation des salles</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-5">
            {houses.map((house) => {
                const rate = house.capacity > 0 ? (house.currentOccupancy / house.capacity) * 100 : 0;
                return (
                <div key={house.id}>
                    <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{house.name}</span>
                    <span className="text-gray-500">{rate.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                    {house.currentOccupancy} / {house.capacity} sujets
                    </p>
                </div>
                );
            })}
            </div>
        </CardContent>
        </Card>
    );
    }