import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";

import { Button } from "../ui/button";

import type { PoultryHouse } from "../../types";

type Props = {
    open: boolean;
    onClose: () => void;
    poultryHouse: PoultryHouse | null;
    onAutomate: (house: PoultryHouse) => void;
    initialData?: PoultryHouse;
};

export function PoultryHouseDetailModal({
    open,
    onClose,
    poultryHouse,
    onAutomate,
    initialData
}: Props) { // initialData retiré de la déstructuration

if (!poultryHouse) return null;

return (
<Dialog open={open} onOpenChange={onClose}>

    <DialogContent>

    <DialogHeader>
        <DialogTitle>
        Détails salle d’élevage
        </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 text-sm">

        <div>
        <p className="font-semibold">Identification</p>
        <p>Nom : {poultryHouse.name}</p>
        <p>
            Description :
            {" "}
            {poultryHouse.description ?? "Aucune"}
        </p>
        </div>

        <div>
        <p className="font-semibold">Capacité</p>

        <p>
            Capacité max :
            {" "}
            {poultryHouse.capacity}
        </p>

        <p>
            Occupés :
            {" "}
            {poultryHouse.currentOccupancy}
        </p>

        <p>
            Taux :
            {" "}
            {(
            (poultryHouse.currentOccupancy /
                poultryHouse.capacity) *
            100
            ).toFixed(1)}
            %
        </p>
        </div>

        <div>
        <p className="font-semibold">Environnement</p>

        <p>
            Ventilation :
            {" "}
            {poultryHouse.ventilationStatus}
        </p>

        <p>
            Éclairage :
            {" "}
            {poultryHouse.lightingStatus}
        </p>

        <p>
            Chauffage :
            {" "}
            {poultryHouse.heatingStatus}
        </p>
        </div>

        <div>
        <p className="font-semibold">Système</p>

        <p>
            Type volaille :
            {" "}
            {poultryHouse.poultryType}
        </p>

        <p>
            Automatisation :
            {" "}
            {poultryHouse.hasAutomation ? "Oui" : "Non"}
        </p>

        <p>
            Statut :
            {" "}
            {poultryHouse.active ? "Active" : "Inactive"}
        </p>
        </div>

    </div>

    <DialogFooter>
        <Button variant="outline" onClick={onClose}>
            Annuler
        </Button>
        <Button
        onClick={() => onAutomate(poultryHouse)}
        >
        Automatiser
        </Button>
    </DialogFooter>

    </DialogContent>

</Dialog>
);
}
