    import { Plus, Home, Truck, Package, Users, Building2 } from "lucide-react";
    import { Button } from "../common/button";
    import { Card, CardContent, CardHeader, CardTitle } from "../common/card";

    interface QuickActionsProps {
    onAddFarm: () => void;
    onAddHouse: () => void;
    onAddArrival: () => void;
    onAddStock: () => void;
    onManageUsers: () => void;
    }

    export function QuickActions({ onAddFarm, onAddHouse, onAddArrival, onAddStock, onManageUsers }: QuickActionsProps) {
    const actions = [
        { label: "Lancer une ferme", icon: Building2, onClick: onAddFarm, color: "bg-emerald-600" },
        { label: "Nouvelle salle", icon: Home, onClick: onAddHouse, color: "bg-blue-600" },
        { label: "Arrivage", icon: Truck, onClick: onAddArrival, color: "bg-purple-600" },
        { label: "Stock", icon: Package, onClick: onAddStock, color: "bg-orange-600" },
        { label: "Équipe", icon: Users, onClick: onManageUsers, color: "bg-teal-600" },
    ];

    return (
        <Card>
        <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {actions.map((action) => (
                <Button key={action.label} onClick={action.onClick} className={`${action.color} hover:opacity-90 gap-2`}>
                <action.icon className="w-4 h-4" />
                {action.label}
                </Button>
            ))}
            </div>
        </CardContent>
        </Card>
    );
    }