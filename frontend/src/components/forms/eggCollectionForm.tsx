import { mockFlocks, mockPoultryHouses } from "../../data/mockData";
import { Button } from "../../components/common/button";

export default function EggCollectionForm() {
return (
<div>
    <select title="lot" className="border p-2 w-full mb-2">
    <option value="">Sélectionner un lot</option>
    {mockFlocks.map((f) => (
        <option key={f.id} value={f.id}>{f.name}</option>
    ))}
    </select>

    <select title="salle" className="border p-2 w-full mb-2">
    <option value="">Sélectionner une salle</option>
    {mockPoultryHouses.map((h) => (
        <option key={h.id} value={h.id}>{h.name}</option>
    ))}
    </select>

    <input title="nombre d'œufs" className="border p-2 w-full mb-2" placeholder="Nombre d'œufs" />

    <Button type="submit" className="w-full">Enregistrer la collecte</Button>
</div>
);
}