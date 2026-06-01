import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/input";
import { Button } from "../../components/common/button";
import { Leaf, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function RegisterPage() {

const navigate = useNavigate();
const { register, error } = useAuth();
const [formData, setFormData] = useState({
name: "",
email: "",
telephone: "",
password: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value,
});
};

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
        toast.success("Compte créé avec succès");
        navigate("/login");
    } else {
        toast.error(error || "Erreur lors de l'inscription");
    }
};

return (
<div className="min-h-screen bg-[#e9edf4] flex items-center justify-center p-4">
    <div className="w-full max-w-md">
    <div className="bg-[#c9d7ce] rounded-2xl shadow-lg p-8">
        
        <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-[#2E7D32] rounded-2xl flex items-center justify-center">
            <Leaf className="w-10 h-10 text-white" />
        </div>
        </div>

        <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Création de compte
        </h1>

        <p className="text-gray-600">
            Rejoignez PoultryConnect IoT
        </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

        <div className="relative">
            <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />

            <Input
            type="text"
            name="name"
            label="Nom"
            placeholder="Votre nom"
            value={formData.name}
            onChange={handleChange}
            className="pl-10"
            required
            />
        </div>

        <div className="relative">
            <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />

            <Input
            type="email"
            name="email"
            label="Email"
            placeholder="votre@email.fr"
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            required
            />
        </div>

        <div className="relative">
            <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />

            <Input
            type="text"
            name="telephone"
            label="Téléphone"
            placeholder="+237 ..."
            value={formData.telephone}
            onChange={handleChange}
            className="pl-10"
            required
            />
        </div>

        <div className="relative">
            <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />

            <Input
            type="password"
            name="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
            required
            />
        </div>

        <Button type="submit" className="w-full" size="lg" >
            S'inscrire
        </Button>

        <p className="text-sm text-center">
            Vous avez déjà un compte ?{" "}
            <Link
            to="/login"
            className="text-[#2E7D32] font-medium hover:underline"
            >
            Se connecter
            </Link>
        </p>

        </form>
    </div>
    </div>
</div>
);
}