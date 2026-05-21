import React from "react";
import { Plus } from "lucide-react";
import { Button } from "./button";
import { Dropdown } from "./Dropdown";

interface AddButtonProps {
onAddFlock?: () => void;
onAddSensor?: () => void;
onAddHouse?: () => void;
onAddUser?: () => void;
}

export function AddButton({
onAddFlock,
onAddSensor,
onAddHouse,
onAddUser,
}: AddButtonProps) {
const dropdownItems = [
{
    id: "flock",
    label: "Ajouter un lot",
    onClick: onAddFlock || (() => {}),
    icon: <Plus className="w-4 h-4" />,
},
{
    id: "sensor",
    label: "Ajouter un capteur",
    onClick: onAddSensor || (() => {}),
    icon: <Plus className="w-4 h-4" />,
},
{
    id: "house",
    label: "Ajouter une salle",
    onClick: onAddHouse || (() => {}),
    icon: <Plus className="w-4 h-4" />,
},
{
    id: "user",
    label: "Ajouter un utilisateur",
    onClick: onAddUser || (() => {}),
    icon: <Plus className="w-4 h-4" />,
},
];

return (
<Dropdown
    trigger={
    <Button variant="primary" size="md" className="gap-2">
        <Plus className="w-4 h-4" />
        Ajouter
    </Button>
    }
    items={dropdownItems}
    align="left"
/>
);
}