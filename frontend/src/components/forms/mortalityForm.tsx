import { Button } from "../../components/common/button";
import { mockFlocks, mockPoultryHouses } from "../../data/mockData";

export default function MortalityForm() {
return (
<div>
    <select title ="lot" className="border p-2 w-full mb-2">
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

    <input className="border p-2 w-full mb-2" placeholder="Nombre de morts" />
    <input className="border p-2 w-full mb-2" placeholder="Cause (optionnel)" />

    <Button type="submit" className="w-full" >Enregistrer</Button>
</div>
);
}