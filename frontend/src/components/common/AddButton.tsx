import React from "react";
import { FastForward, Plus } from "lucide-react";
import { Button } from "./button";
import { Dropdown } from "./Dropdown";

interface AddButtonProps {
onAddSensor?: () => void;
onAddFlock?: () => void;
onAddHouse?: () => void;
onAddUser?: () => void;
onAddEggCollecting?:() => void;
onAddFeeding?: () => void;
}

export function AddButton({
onAddSensor,
onAddFlock,
onAddHouse,
onAddUser,
onAddFeeding,
onAddEggCollecting,
}: AddButtonProps) {
const dropdownItems = [
{
    id: "sensor",
    label: "Ajouter un capteur",
    onClick: onAddSensor || (() => {}),
},
{
    id: "feeding",
    label: "Nourrir un lot",
    onClick: onAddFeeding || (() => {}),
},
{
    id: "flock",
    label: "Ajouter un lot",
    onClick: onAddFlock || (() => {}),
},
{
    id: "eggCollecting",
    label: "Nouvelle collecte d'oeufs",
    onClick: onAddEggCollecting || (() => {}),
},
{
    id: "house",
    label: "Ajouter une salle",
    onClick: onAddHouse || (() => {}),
},
{
    id: "user",
    label: "Recruter un employé",
    onClick: onAddUser || (() => {}),
},
];

return (
<Dropdown
    trigger={
    <Button variant="primary" size="md" className="gap-2">
        <Plus className="w-4 h-4" />
        Actions Rappides
    </Button>
    }
    items={dropdownItems}
    align="left"
/>
);
}