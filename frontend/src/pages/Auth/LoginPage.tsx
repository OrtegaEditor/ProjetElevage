import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../../components/common/input";
import { Button } from "../../components/common/button";
import { Leaf, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
const success = login(email, password);
if (success) {
toast.success("Connexion réussie");
navigate("/dashboard");
} else {
toast.error("Email ou mot de passe incorrect");
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
        PoultryConnect IoT
    </h1>
    <p className="text-gray-600">
        Plateforme de gestion d'élevage avicole connecté
    </p>
</div>

<form onSubmit={handleSubmit} className="space-y-4">
<div className="relative">
    <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
    <Input
    type="email"
    label="Email"
    placeholder="votre@email.fr"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="pl-10"
    required
    />
</div>

<div className="relative">
    <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
    <Input
    type="password"
    label="Mot de passe"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="pl-10"
    required
    />
</div>

<div className="flex items-center justify-between text-sm">
    <label className="flex items-center">
    <input
        type="checkbox"
        className="mr-2 rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
    />
    Se souvenir de moi
    </label>
    <a href="#" className="text-[#2E7D32] hover:text-[#1B5E20]">
    Mot de passe oublié ?
    </a>
</div>

<Button type="submit" className="w-full" size="lg">
    Se connecter
</Button>
</form>
</div>
</div>
</div>
);
}
