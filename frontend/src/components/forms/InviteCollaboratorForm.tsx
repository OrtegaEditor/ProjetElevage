import { useState } from "react";
import { Button } from "../common/button";

interface InviteCollaboratorFormProps {
onClose: () => void;
onSubmit: (data: { email: string; role: string }) => void;
}

export function InviteCollaboratorForm({
onClose,
onSubmit,
}: InviteCollaboratorFormProps) {
const [email, setEmail] = useState("");
const [role, setRole] = useState("agent");

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

if (!email) return;

onSubmit({ email, role });
setEmail("");
setRole("agent");
onClose();
};

return (
<form onSubmit={handleSubmit} className="space-y-3">
    <h2 className="text-lg font-semibold">Inviter un collaborateur</h2>

    <input
    className="border p-2 w-full"
    type="email"
    placeholder="Email du collaborateur"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    />

    <select title="Role"
    className="border p-2 w-full"
    value={role}
    onChange={(e) => setRole(e.target.value)} >
    <option value="">Selectionner le role</option>
    <option value="admin">Administrateur</option>
    <option value="agent">Agent d’élevage</option>
    <option value="veterinaire">Vétérinaire</option>
    <option value="commercial">Commercial</option>
    </select>

    <div className="flex gap-2">
    <Button type="submit">Envoyer invitation</Button>
    <Button type="button" variant="outline" onClick={onClose}>
        Annuler
    </Button>
    </div>
</form>
);
}