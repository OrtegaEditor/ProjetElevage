import { Link } from "react-router-dom";
import { Button } from "../components/common/button";
import {
Thermometer,
Activity,
Bell,
BarChart3,
Smartphone,
Cloud,
Shield,
Zap,
Menu,
X,
} from "lucide-react";
import { useState } from "react";

export function LandingPage() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const features = [
{
icon: <Thermometer className="w-8 h-8" />,
title: "Monitoring IoT Temps Réel",
description:
    "Surveillez température, humidité, NH3, CO2 et luminosité 24/7 avec des alertes intelligentes",
},
{
icon: <Activity className="w-8 h-8" />,
title: "Suivi de Performance",
description:
    "Analysez croissance, mortalité, consommation alimentaire et optimisez vos performances",
},
{
icon: <Bell className="w-8 h-8" />,
title: "Alertes Automatiques",
description:
    "Soyez notifié instantanément en cas d'anomalie critique dans vos poulaillers",
},
{
icon: <BarChart3 className="w-8 h-8" />,
title: "Analytics Avancées",
description:
    "Tableaux de bord professionnels avec graphiques en temps réel et rapports détaillés",
},
{
icon: <Smartphone className="w-8 h-8" />,
title: "Mobile & Terrain",
description:
    "Interface responsive accessible sur tablette et smartphone pour saisie terrain rapide",
},
{
icon: <Cloud className="w-8 h-8" />,
title: "Cloud & Sécurisé",
description:
    "Données hébergées dans le cloud, accessibles partout, sécurisées et sauvegardées",
},
];

return (
<div className="min-h-screen bg-white">
<nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="font-semibold text-gray-900 text-lg">
            PoultryConnect
            </h1>
            <p className="text-xs text-gray-500">Surveillez. Analysez. Anticipez</p>
        </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
        <a href="#accueil" className="text-gray-700 hover:text-[#2E7D32]">
            Accueil
        </a>
        <a
            href="#fonctionnalites"
            className="text-gray-700 hover:text-[#2E7D32]"
        >
            Fonctionnalités
        </a>
        <a href="#apropos" className="text-gray-700 hover:text-[#2E7D32]">
            À propos
        </a>
        <Link to="/login">
            <Button>Se connecter</Button>
        </Link>
        </div>

        <button
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
        {mobileMenuOpen ? (
            <X className="w-6 h-6" />
        ) : (
            <Menu className="w-6 h-6" />
        )}
        </button>
    </div>
    </div>

    {mobileMenuOpen && (
    <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-4 space-y-3">
        <a
            href="#accueil"
            className="block text-gray-700 hover:text-[#2E7D32]"
        >
            Accueil
        </a>
        <a
            href="#fonctionnalites"
            className="block text-gray-700 hover:text-[#2E7D32]"
        >
            Fonctionnalités
        </a>
        <a
            href="#apropos"
            className="block text-gray-700 hover:text-[#2E7D32]"
        >
            À propos
        </a>
        <Link to="/login">
            <Button className="w-full">Se connecter</Button>
        </Link>
        </div>
    </div>
    )}
</nav>

<section
    id="accueil"
    className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50"
>
    <div className="max-w-7xl mx-auto">
    <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Zap className="w-4 h-4" />
        Plateforme IoT nouvelle génération
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Gestion Intelligente de votre{" "}
        <span className="text-[#2E7D32]">Élevage Avicole</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
        Optimisez vos performances avec une plateforme IoT complète :
        monitoring temps réel, alertes automatiques, suivi sanitaire et
        analytics avancées pour poulets, pondeuses, dindes et canards.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto">
            Démarrer maintenant
            </Button>
        </Link>
        <Link to="#">
        <Button size="lg" variant="outline" className="w-full sm:w-auto text-gray-700 hover:text-[#2E7D32]">
            Voir la démo
        </Button>
        </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Sécurisé
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

<section id="fonctionnalites" className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Fonctionnalités Complètes
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Tout ce dont vous avez besoin pour gérer efficacement votre élevage
        avicole moderne
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
        <div
            key={index}
            className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
        >
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
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

<section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#2E7D32] text-white">
    <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div>
        <div className="text-4xl font-bold mb-2">45 000+</div>
        <div className="text-green-100">Volailles surveillées</div>
        </div>
        <div>
        <div className="text-4xl font-bold mb-2">24/7</div>
        <div className="text-green-100">Monitoring continu</div>
        </div>
        <div>
        <div className="text-4xl font-bold mb-2">98%</div>
        <div className="text-green-100">Taux de disponibilité</div>
        </div>
        <div>
        <div className="text-4xl font-bold mb-2">+15%</div>
        <div className="text-green-100">Performance moyenne</div>
        </div>
    </div>
    </div>
</section>

<section id="apropos" className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
    <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
        À propos de PoultryConnect
        </h2>
        <p className="text-lg text-gray-600 mb-6">
        PoultryConnect est une plateforme IoT SaaS spécialement conçue pour
        les éleveurs de volailles professionnels. Notre mission est de
        combiner technologie de pointe et expertise avicole pour vous aider à
        optimiser vos performances, réduire vos pertes et améliorer le
        bien-être animal.
        </p>
        <p className="text-lg text-gray-600 mb-6">
        Grâce à nos capteurs intelligents, notre système d'alertes
        automatiques et nos analytics avancées, vous gardez le contrôle total
        de votre exploitation, où que vous soyez.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
            Expertise Avicole
            </h3>
            <p className="text-gray-600 text-sm">
            Développé avec des vétérinaires et éleveurs professionnels
            </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
            Technologie Éprouvée
            </h3>
            <p className="text-gray-600 text-sm">
            IoT fiable, cloud sécurisé et interface intuitive
            </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
            Support Dédié
            </h3>
            <p className="text-gray-600 text-sm">
            Équipe disponible pour vous accompagner au quotidien
            </p>
        </div>
        </div>
    </div>
    </div>
</section>

<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
    <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl font-bold text-gray-900 mb-6">
        Prêt à transformer votre élevage ?
    </h2>
    <p className="text-xl text-gray-600 mb-8">
        Rejoignez les éleveurs qui ont déjà choisi PoultryConnect pour
        optimiser leurs performances
    </p>
    <Link to="/login">
        <Button size="lg">Commencer gratuitement</Button>
    </Link>
    </div>
</section>

<footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#2E7D32] rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">PoultryConnect</span>
        </div>
        <p className="text-gray-400 text-sm">
            Plateforme IoT pour élevage avicole connecté
        </p>
        </div>
        <div>
        <h3 className="font-semibold mb-4">Produit</h3>
        <ul className="space-y-2 text-sm text-gray-400">
            <li>
            <a href="#fonctionnalites" className="hover:text-white">
                Fonctionnalités
            </a>
            </li>
            <li>
            <a href="#" className="hover:text-white">
                Tarifs
            </a>
            </li>
            <li>
            <a href="#" className="hover:text-white">
                Documentation
            </a>
            </li>
        </ul>
        </div>
        <div>
        <h3 className="font-semibold mb-4">Entreprise</h3>
        <ul className="space-y-2 text-sm text-gray-400">
            <li>
            <a href="#apropos" className="hover:text-white">
                À propos
            </a>
            </li>
            <li>
            <a href="#" className="hover:text-white">
                Contact
            </a>
            </li>
            <li>
            <a href="#" className="hover:text-white">
                Blog
            </a>
            </li>
        </ul>
        </div>
        <div>
        <h3 className="font-semibold mb-4">Légal</h3>
        <ul className="space-y-2 text-sm text-gray-400">
            <li>
            <a href="#" className="hover:text-white">
                Confidentialité
            </a>
            </li>
            <li>
            <a href="#" className="hover:text-white">
                CGU
            </a>
            </li>
        </ul>
        </div>
    </div>
    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
        © 2024 PoultryConnect. Tous droits réservés.
    </div>
    </div>
</footer>
</div>
);
}
