import { Feeding } from "@/types";
import { mockFlocks, mockPoultryHouses } from "../../data/mockData";

interface feedingFormProps {
feeding?: Feeding | null;
onClose: () => void;
onSave: (feeding: Feeding) => void;
}

export default function FeedingForm({ feeding, onClose, onSave }: feedingFormProps) {
return (
<div>
    <select title="lot" className="border p-2 w-full mb-2">
    <option value="">Sélectionner un lot</option>
    {mockFlocks.map((f) => (
        <option key={f.id} value={f.id}>
        {f.name}
        </option>
    ))}
    </select>

    <input className="border p-2 w-full mb-2" placeholder="Type d'aliment" />
    <input className="border p-2 w-full mb-2" placeholder="Quantité" />

    <button className="bg-green-600 text-white px-4 py-2 rounded w-full">
    Enregistrer
    </button>
</div>
);
}