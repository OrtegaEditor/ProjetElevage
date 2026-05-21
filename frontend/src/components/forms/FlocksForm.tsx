import { Button } from "../common/button";
import { mockFlocks, mockPoultryHouses,mockEspece,mockBands } from "../../data/mockData";
import { Flock } from "../../types";

interface FlocksFormProps {
flock?: Flock | null;
onClose: () => void;
onSave: (flock: Flock) => void;
}

export function FlocksForm({ flock, onClose, onSave }: FlocksFormProps){
return (
<div>
    <input className="border p-2 w-full mb-2" placeholder="Nom du lot" required/>
    <select title ="salle" className="border p-2 w-full mb-2">
    <option value="">Sélectionner la salle</option>
    {mockPoultryHouses.map((h) => (
        <option key={h.id} value={h.id}>{h.name}</option>
    ))}
    </select>
    <select title="bande" className="border p-2 w-full mb-2"  required>
    <option value="">Sélectionner la bande </option>
    {mockBands.map((b) => (
        <option key={b.id} value={b.id}>{b.name}</option>
    ))}
    </select>


    <select title="espece" className="border p-2 w-full mb-2" required>
    <option value="">Sélectionner l'espece</option>
    {mockEspece.map((e) => (
        <option key={e.id} value={e.id}>{e.name}</option>
    ))}
    </select>

    <input className="border p-2 w-full mb-2" placeholder="Effectif Initial" required/>
    <input className="border p-2 w-full mb-2" placeholder="Age (en jours)" required/>
    <input title="Date entree" type="datetime-local" className="border p-2 w-full mb-2" value={new Date().toISOString()} required/>
    <input className="border p-2 w-full mb-2" placeholder="Effectif Initial" required/>
    <input className="border p-2 w-full mb-2" placeholder="Cycle (jours)" required/>
    <input className="border p-2 w-full mb-2" placeholder="Note(Optionnel)" required />

    <Button type="submit" className="w-full" >Enregistrer</Button>
</div>
);
}