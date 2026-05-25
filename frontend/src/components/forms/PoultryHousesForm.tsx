import { mockFarms } from "../../data/mockData";
import { PoultryHouse } from "../../types";
import { Button } from "../common/button";

interface PoultryHouseFormProps {
onClose: () => void;
onSave: (flock: PoultryHouse) => void;
}

export function PoultryHouseForm({onClose,onSave}: PoultryHouseFormProps) {
return (
    <div className="space-y-3">
    <input
        className="border p-2 w-full"
        placeholder="Nom de la salle"
    />

    <select title="Ferme" className="border p-2 w-full">
        <option value="">Sélectionner une ferme</option>

        {mockFarms.map((farm) => (
        <option key={farm.id} value={farm.id}>
            {farm.name}
        </option>
        ))}
    </select>

    <input
        type="number"
        className="border p-2 w-full"
        placeholder="Capacité maximale"
    />

    <input
        type="number"
        className="border p-2 w-full"
        placeholder="Occupation actuelle"
    />

    <select title="Type volaille" className="border p-2 w-full">
        <option value="broiler">Poulets de chair</option>
        <option value="layer">Poules pondeuses</option>
        <option value="turkey">Dindes</option>
        <option value="duck">Canards</option>
        <option value="goose">Oies</option>
    </select>

    <label className="flex items-center gap-2">
        <input type="checkbox" />
        Salle automatisée
    </label>

    <textarea
        className="border p-2 w-full"
        placeholder="Description"
    />

    <div className="flex gap-2">
        <Button className="w-full">
        Enregistrer
        </Button>

        <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="w-full"
        >
        Annuler
        </Button>
    </div>

    </div>
);
}