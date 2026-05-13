import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  Thermometer,
  AlertTriangle,
  Activity,
  ShoppingCart,
  Package,
  ClipboardList,
  FileText,
  Settings,
  Pill,
  Stethoscope,
  DollarSign,
  UserCog,
  Syringe,
  Scale,
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Général",
    items: [
      {
        path: "/dashboard",
        label: "Tableau de bord",
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ["admin", "agent", "veterinarian", "commercial"],
      },
      {
        path: "/alerts",
        label: "Alertes",
        icon: <AlertTriangle className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
    ],
  },

  {
    title: "Exploitation",
    items: [
      {
        path: "/poultry-houses",
        label: "Poulaillers",
        icon: <Building2 className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
      {
        path: "/flocks",
        label: "Lots de volailles",
        icon: <Activity className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
      {
        path: "/weighing",
        label: "Pesées",
        icon: <Scale className="w-5 h-5" />,
        roles: ["agent"],
      },
      {
        path: "/stock",
        label: "Stock",
        icon: <Package className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
    ],
  },

  {
    title: "Santé animale",
    items: [
      {
        path: "/treatments",
        label: "Traitements",
        icon: <Pill className="w-5 h-5" />,
        roles: ["veterinarian"],
      },
      {
        path: "/vaccinations",
        label: "Vaccinations",
        icon: <Syringe className="w-5 h-5" />,
        roles: ["veterinarian"],
      },
      {
        path: "/health-registry",
        label: "Registre sanitaire",
        icon: <Stethoscope className="w-5 h-5" />,
        roles: ["veterinarian"],
      },
    ],
  },

  {
    title: "Commercial",
    items: [
      {
        path: "/sales",
        label: "Ventes",
        icon: <ShoppingCart className="w-5 h-5" />,
        roles: ["commercial", "admin"],
      },
      {
        path: "/clients",
        label: "Clients",
        icon: <UserCog className="w-5 h-5" />,
        roles: ["commercial"],
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        path: "/users",
        label: "Utilisateurs",
        icon: <Users className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        path: "/automation",
        label: "Automatisation",
        icon: <Settings className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        path: "/analytics",
        label: "Analytics",
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ["admin"],
      },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="space-y-6">
  {menuSections.map((section) => {
    const visibleItems = section.items.filter((item) =>
      user?.role ? item.roles.includes(user.role) : false
    );

    if (visibleItems.length === 0) return null;

    return (
      <div key={section.title}>
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">
          {section.title}
        </h3>

        <div className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#2E7D32] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  })}
</nav>
  );
}
