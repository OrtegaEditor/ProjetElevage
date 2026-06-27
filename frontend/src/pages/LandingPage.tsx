// frontend/src/pages/LandingPage.tsx
import { Link } from "react-router-dom";
import { Button } from "../components/common/button";
import { useNavigate } from "react-router-dom";
import {
Package,
Truck,
Factory,
LineChart,
Users,
Building2,
TrendingUp,
DollarSign,
ClipboardList,
Shield,
Cloud,
Smartphone,
Menu,
X,
} from "lucide-react";
import { useState } from "react";

export function LandingPage() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const navigate = useNavigate();

const features = [
{
    icon: <Package className="w-8 h-8" />,
    title: "Gestion des stocks",
    description:
    "Suivez vos consommables (aliments, vaccins, médicaments) en temps réel avec alertes automatiques sur les niveaux critiques",
},
{
    icon: <Truck className="w-8 h-8" />,
    title: "Gestion des fournisseurs",
    description:
    "Centralisez tous vos fournisseurs, leurs produits, prix et conditions pour optimiser vos approvisionnements",
},
{
    icon: <Building2 className="w-8 h-8" />,
    title: "Gestion des lots",
    description:
    "Suivez chaque lot de volailles de l'arrivée à la vente : âge, poids, mortalité, alimentation",
},
{
    icon: <ClipboardList className="w-8 h-8" />,
    title: "Traçabilité sanitaire",
    description:
    "Enregistrez tous les traitements et vaccinations avec calendrier des rappels",
},
{
    icon: <LineChart className="w-8 h-8" />,
    title: "Analyses et rapports",
    description:
    "Tableaux de bord professionnels avec indicateurs de performance (GMQ, IC, taux de mortalité)",
},
{
    icon: <DollarSign className="w-8 h-8" />,
    title: "Gestion commerciale",
    description:
    "Suivez vos ventes, gérez les prix et maximisez votre rentabilité",
},
];

const steps = [
{
    step: 1,
    title: "Gestion des fournisseurs",
    description: "Référencez vos fournisseurs et leurs produits",
    icon: <Truck className="w-6 h-6" />,
},
{
    step: 2,
    title: "Approvisionnement",
    description: "Enregistrez les entrées en stock",
    icon: <Package className="w-6 h-6" />,
},
{
    step: 3,
    title: "Gestion des lots",
    description: "Suivez vos lots de volailles",
    icon: <Users className="w-6 h-6" />,
},
{
    step: 4,
    title: "Suivi sanitaire",
    description: "Traitements et vaccinations",
    icon: <ClipboardList className="w-6 h-6" />,
},
{
    step: 5,
    title: "Mise en vente",
    description: "Définissez les prix et commercialisez",
    icon: <DollarSign className="w-6 h-6" />,
},
];

return (
<div className="min-h-screen bg-white">
    {/* Navigation */}
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
            </div>
            <div>
            <h1 className="font-semibold text-gray-900 text-lg">SYGEXA</h1>
            <p className="text-xs text-gray-500">De l'approvisionnement à la vente</p>
            </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
            <a href="#accueil" className="text-gray-700 hover:text-emerald-700 transition-colors">
            Accueil
            </a>
            <a href="#fonctionnalites" className="text-gray-700 hover:text-emerald-700 transition-colors">
            Fonctionnalités
            </a>
            <a href="#parcours" className="text-gray-700 hover:text-emerald-700 transition-colors">
            Parcours
            </a>
            <a href="#apropos" className="text-gray-700 hover:text-emerald-700 transition-colors">
            À propos
            </a>
            <Link to="/login">
            <Button className="bg-emerald-700 hover:bg-emerald-800">Se connecter</Button>
            </Link>
        </div>

        <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
    </div>

    {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-4 space-y-3">
            <a href="#accueil" className="block text-gray-700 hover:text-emerald-700">Accueil</a>
            <a href="#fonctionnalites" className="block text-gray-700 hover:text-emerald-700">Fonctionnalités</a>
            <a href="#parcours" className="block text-gray-700 hover:text-emerald-700">Parcours</a>
            <a href="#apropos" className="block text-gray-700 hover:text-emerald-700">À propos</a>
            <Link to="/login">
            <Button className="w-full bg-emerald-700 hover:bg-emerald-800">Se connecter</Button>
            </Link>
        </div>
        </div>
    )}
    </nav>

    {/* Hero Section */}
    <section id="accueil" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-blue-50">
    <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            Solution complète pour aviculteurs
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gérez votre élevage de{" "}
            <span className="text-emerald-700">l'approvisionnement à la vente</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
            Une plateforme unique pour piloter vos stocks, suivre vos lots,
            gérer vos fournisseurs et optimiser votre rentabilité.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
            <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                Commencer maintenant
            </Button>
            </Link>
            <a href="#fonctionnalites">
            <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                Découvrir les fonctionnalités
            </Button>
            </a>
        </div>
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Données sécurisées
            </div>
            <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Cloud
            </div>
            <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Mobile
            </div>
        </div>
        </div>
    </div>
    </section>

    {/* Parcours utilisateur */}
    <section id="parcours" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Un parcours complet et intuitif
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            De la gestion des fournisseurs à la vente de vos lots, en passant par le suivi sanitaire
        </p>
        </div>

        <div className="relative">
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-emerald-200 hidden md:block"></div>
        <div className="space-y-8">
            {steps.map((step, index) => (
            <div key={step.step} className="flex flex-col md:flex-row gap-6 relative">
                <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl">
                    {step.step}
                </div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                    <div className="text-emerald-600">{step.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
    </section>

    {/* Fonctionnalités */}
    <section id="fonctionnalites" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fonctionnalités complètes
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer efficacement votre élevage
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
            <div
            key={index}
            className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
            >
            <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 mb-4">
                {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
            </div>
        ))}
        </div>
    </div>
    </section>

    {/* Chiffres clés */}
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-700 text-white">
    <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-emerald-100">Fermes accompagnées</div>
        </div>
        <div>
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-emerald-100">Disponibilité</div>
        </div>
        <div>
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-emerald-100">Satisfaction client</div>
        </div>
        <div>
            <div className="text-4xl font-bold mb-2">+20%</div>
            <div className="text-emerald-100">Gain de productivité</div>
        </div>
        </div>
    </div>
    </section>

    {/* À propos */}
    <section id="apropos" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
            À propos de SYGEXA
        </h2>
        <p className="text-lg text-gray-600 mb-6">
            SYGEXA est une plateforme SaaS spécialement conçue pour les éleveurs
            de volailles professionnels. Notre mission est de vous accompagner
            dans la digitalisation de votre exploitation.
        </p>
        <p className="text-lg text-gray-600 mb-6">
            De la gestion des approvisionnements au suivi sanitaire, en passant
            par la commercialisation, notre solution couvre l'ensemble du cycle
            d'élevage pour optimiser votre rentabilité.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Expertise métier</h3>
            <p className="text-gray-600 text-sm">
                Développé avec des vétérinaires et aviculteurs professionnels
            </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Support dédié</h3>
            <p className="text-gray-600 text-sm">
                Une équipe à votre écoute pour vous accompagner
            </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Mises à jour</h3>
            <p className="text-gray-600 text-sm">
                Évolutions régulières selon vos besoins
            </p>
            </div>
        </div>
        </div>
    </div>
    </section>

    {/* CTA Final */}
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-blue-50">
    <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Prêt à optimiser votre élevage ?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
        Rejoignez les éleveurs qui ont déjà choisi SYGEXA pour piloter leur activité
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/login">
            <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800">
            Commencer gratuitement
            </Button>
        </Link>
        <a href="#fonctionnalites">
            <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-700">
            En savoir plus
            </Button>
        </a>
        </div>
    </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
            <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">SYGEXA</span>
            </div>
            <p className="text-gray-400 text-sm">
            Solution complète pour la gestion de votre élevage avicole
            </p>
        </div>
        <div>
            <h3 className="font-semibold mb-4">Produit</h3>
            <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a></li>
            <li><a href="#parcours" className="hover:text-white">Parcours</a></li>
            </ul>
        </div>
        <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#apropos" className="hover:text-white">À propos</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
        </div>
        <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white">Confidentialité</a></li>
            <li><a href="#" className="hover:text-white">CGU</a></li>
            </ul>
        </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
        © 2024 SYGEXA. Tous droits réservés.
        </div>
    </div>
    </footer>
</div>
);
}