import React, { useState, useEffect } from "react";
import { Button } from "../common/button";
import { Farm, User } from "@/types";
import axios from "axios";

interface EditUserModalProps {
user: User;
currentUserRole: string;
isOpen: boolean;
onClose: () => void;
onSave: (userId: string, updatedData: Partial<User>) => Promise<void>;
}

export function EditUserModal({
user,
currentUserRole,
isOpen,
onClose,
onSave,
}: EditUserModalProps) {
// Initialisation avec vérification de la clé farm_id (souvent utilisée par SQLAlchemy)
const [formData, setFormData] = useState({
name: user.name,
telephone: user.telephone,
role: user.role,
active: user.active,
farmId: (user as any).farm_id || user.farmId || "",
});

const [farms, setFarms] = useState<Farm[]>([]);
const [loading, setLoading] = useState(false);
const isAdmin = currentUserRole === "admin";

// Charger les fermes uniquement quand le modal est ouvert
useEffect(() => {
if (isOpen) {
    const fetchFarms = async () => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/users/my-farms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        setFarms(response.data);
    } catch (err) {
        console.error("Erreur chargement fermes:", err);
    }
    };
    fetchFarms();
}
}, [isOpen]);

if (!isOpen) return null;

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
const { name, value } = e.target;
setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleToggleActive = () => {
setFormData((prev) => ({ ...prev, active: !prev.active }));
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
try {
    const payload: any = {
    name: formData.name,
    telephone: formData.telephone,
    };

    if (isAdmin) {
    payload.role = formData.role;
    payload.active = formData.active;
    payload.farm_id = formData.farmId || null;
    }

    await onSave(user.id, payload);
    onClose();
} catch (error) {
    console.error("Erreur modification:", error);
} finally {
    setLoading(false);
}
};

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    <h2 className="text-xl font-bold mb-5">Modifier l'utilisateur</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input title="Nom" type="text" name="name" value={formData.name} onChange={handleChange} required
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </div>

        <div>
        <label className="block text-sm font-medium mb-1">Téléphone</label>
        <input title="Téléphone" type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        </div>

        <div>
        <label className="block text-sm font-medium mb-1">Ferme d'affectation</label>
        <select title="Ferme d'affectation" name="farmId" value={formData.farmId} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2">
            <option value="">Selection la ferme d'affection</option>
            {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        </div>

        {isAdmin && (
        <>
            <div>
            <label className="block text-sm font-medium mb-1">Rôle</label>
            <select title="Rôle" name="role" value={formData.role} onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2">
                <option value="agent">Agent</option>
                <option value="admin">Administrateur</option>
                <option value="veterinarian">Vétérinaire</option>
                <option value="commercial">Commercial</option>
            </select>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Statut actif</span>
            <button title="Statut" type="button" onClick={handleToggleActive}
                className={`h-6 w-11 rounded-full transition ${formData.active ? "bg-green-600" : "bg-gray-300"}`}>
                <div className={`h-4 w-4 rounded-full bg-white transition ${formData.active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            </div>
        </>
        )}

        <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        <Button type="submit" disabled={loading}>{loading ? "..." : "Sauvegarder"}</Button>
        </div>
    </form>
    </div>
</div>
);
}