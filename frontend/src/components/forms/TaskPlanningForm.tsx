import { mockFlocks, mockPoultryHouses } from "../../data/mockData";
import { Button } from "../../components/common/button";
import { Input } from "../../components/common/input";


type Props = {
onClose: () => void;
};

export default function TaskPlanningForm({ onClose }: Props) {
return (
<form className="space-y-4">
<h2>Nouvelle tache</h2 >
    <input type="text" placeholder="Titre de la tâche"  className="w-full border rounded-lg p-3 hover:bg-gray-200" required/>
        <select title="Type de tâche" required className="w-full border rounded-lg p-3  hover:bg-gray-200">
        <option value="">Type de tache</option>
        <option value="feeding">Alimentation</option>
        <option value="weighing">Pesée</option>
        <option value="ventilation">Ventilation</option>
        <option value="mortality">Mortalité</option>
        <option value="egg_collection">Collecte d'œufs</option>
        <option value="cleaning">Nettoyage</option>
        <option value="vaccination">Vaccination</option>
    </select>

    <select title ="lot" required className="w-full border rounded-lg p-3  hover:bg-gray-200">
        <option value="">Sélectionner un lot</option>{mockFlocks.map((flock) =>(<option key={flock.id} value={flock.id}>
            {flock.name}
        </option>
        ))}
    </select>

    <select title="salle" required className="w-full border rounded-lg p-3  hover:bg-gray-200">
        <option value="">Sélectionner une salle</option>{mockPoultryHouses.map((house) => (<option key={house.id} value={house.id}>{house.name} </option>))}
    </select>
    <Input type="time" title="heure" placeholder="Heure: minutes"/>
    <div className="flex justify-end gap-3 pt-2">
        <Button  type="button"  variant="danger"onClick={onClose} className="px-4 py-2 border rounded-lg "> Annuler </Button>
        <Button  type="submit"> Valider</Button>
        <Button  type="reset" variant ="secondary" className="px-4 py-2 bg-blue-600 text-white rounded-lg ">Valider et recommencer </Button>
    </div>
</form>
);
}