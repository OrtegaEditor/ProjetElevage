import { useEffect, useState, useRef } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/services/api';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/button';
import { ArrowLeft } from 'lucide-react';

type Farm = {
id: string;
name: string;
address?: string;
active?: boolean;
};

export function UserProfile() {
const [user, setUser] = useState<User | null>(null);
const [farms, setFarms] = useState<Farm[]>([]);
const [loading, setLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState<Partial<User>>({});

const fileInputRef = useRef<HTMLInputElement>(null);
const { logout } = useAuth();
const navigate = useNavigate()

useEffect(() => {
const fetchData = async () => {
    try {
    const [userData, farmsData] = await Promise.all([
        usersAPI.getMe(),
        usersAPI.getMyAccessibleFarms(),
    ]);

    setUser(userData);
    setFormData(userData);
    setFarms(farmsData);
    } catch (e) {
    console.error(e);
    } finally {
    setLoading(false);
    }
};

fetchData();
}, []);

const handleSave = async () => {
if (!user) return;

try {
    const updatedUser = await usersAPI.updateUser(user.id, {
    name: formData.name,
    telephone: formData.telephone,
    avatar: formData.avatar
    });

    setUser(updatedUser);
    setFormData(updatedUser);
    setIsEditing(false);
} catch {
    alert("Erreur lors de la sauvegarde");
}
};

const handleChangePassword = async () => {
const old_password = prompt("Ancien mot de passe");
const new_password = prompt("Nouveau mot de passe");
const confirm_password = prompt("Confirmer mot de passe");

if (!old_password || !new_password || !confirm_password) return;

try {
    const token = localStorage.getItem("access_token");

    await axios.post(
    "http://127.0.0.1:8000/api/v1/auth/change-password",
    { old_password, new_password, confirm_password },
    {
        headers: { Authorization: `Bearer ${token}` }
    }
    );

    alert("Mot de passe modifié");
} catch {
    alert("Erreur changement mot de passe");
}
};

const handleAvatarUpload = async (e: any) => {
const file = e.target.files?.[0];
if (!file) return;

try {
    const result = await usersAPI.uploadAvatar(file);

    setUser(prev => prev ? { ...prev, avatar: result.url } : prev);
    setFormData(prev => ({ ...prev, avatar: result.url }));
} catch {
    alert("Erreur upload photo");
}
};

if (loading) return <div className="p-10 text-center">Chargement...</div>;
if (!user) return <div className="p-10 text-center">Utilisateur introuvable</div>;

return (
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-gray-50 min-h-screen">

    {/* LEFT */}
    <div className="md:col-span-3 space-y-4">

        <Button variant='outline'
        onClick={() => navigate("/dashboard")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
    <div className="bg-white p-6 rounded-xl shadow-sm text-center">

        <input
        title='image'
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleAvatarUpload}
        accept="image/*"
        />

        <img alt='Profile'
        src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${user.name}`
        }
        className="w-24 h-24 rounded-full mx-auto mb-4 cursor-pointer border-2"
        onClick={() => fileInputRef.current?.click()}
        />

        <h2 className="font-bold text-lg">{user.name}</h2>

        <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
        {user.role}
        </span>

        <p className="mt-4 text-sm">
        {user.active ? "✓ Actif" : "✗ Désactivé"}
        </p>
    </div>
    </div>

    {/* CENTER */}
    <div className="md:col-span-6 space-y-6">

    <div className="bg-white p-6 rounded-xl shadow-sm">

        <div className="flex justify-between mb-4">
        <h3 className="font-bold text-xl">Profil</h3>

        <button
            onClick={() =>
            isEditing ? handleSave() : setIsEditing(true)
            }
            className="px-4 py-1 bg-emerald-600 text-white rounded-md text-sm"
        >
            {isEditing ? "Enregistrer" : "Modifier"}
        </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
        {["name", "email", "telephone"].map((field) => (
            <div key={field}>
            <label className="text-xs text-gray-500">{field}</label>

            <input
                title={field}
                disabled={!isEditing}
                className="w-full border-b outline-none"
                value={(formData as any)[field] || ""}
                onChange={(e) =>
                setFormData(prev => ({
                    ...prev,
                    [field]: e.target.value
                }))
                }
            />
            </div>
        ))}
        </div>

    </div>
    </div>

    {/* RIGHT */}
    <div className="md:col-span-3 space-y-4">

    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-3">Sécurité</h3>

        <button
        onClick={handleChangePassword}
        className="w-full py-2 bg-gray-100 rounded-lg text-sm"
        >
        Modifier mot de passe
        </button>

        <button
        onClick={logout}
        className="w-full py-2 mt-2 bg-red-50 text-red-600 rounded-lg text-sm"
        >
        Déconnexion
        </button>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-3">Fermes</h3>

        {farms.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune ferme</p>
        ) : (
        farms.map((f) => (
            <div key={f.id} className="p-2 bg-gray-50 rounded mb-2">
            <p className="font-semibold text-sm">{f.name}</p>
            <p className="text-xs text-gray-500">{f.address || "—"}</p>
            </div>
        ))
        )}
    </div>

    </div>
</div>
);
}