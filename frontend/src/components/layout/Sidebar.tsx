import React from "react";
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
  Settings,
  Pill,
  Stethoscope,
  UserCog,
  Syringe,
  Scale,
  Warehouse,
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

interface MenuCategory {
  label: string;
  items: MenuItem[];
}

const menuCategories: MenuCategory[] = [
  {
    label: "Général",
    items: [
      {
        path: "/adminDashboard",
        label: "Tableau de bord",
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ["admin", "agent", "veterinarian", "commercial"],
      },
       {
         path: "/users",
         label: "Utilisateurs",
        icon: <Users className="w-5 h-5" />,
        roles: ["admin"],
      },
    ],
  },

  {
    label: "Élevage",
    items: [
      // {
      //   path: "/farms",
      //   label: "Fermes",
      //   icon: <Warehouse className="w-5 h-5" />,
      //   roles: ["admin", "agent"],
      // },
      {
         path: "/farms",
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
        roles: ["admin", "agent"],
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
    label: "IoT & Alertes",
    items: [
      {
        path: "/iot-monitoring",
        label: "Monitoring IoT",
        icon: <Thermometer className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
      {
        path: "/alerts",
        label: "Alertes",
        icon: <AlertTriangle className="w-5 h-5" />,
        roles: ["admin", "agent"],
      },
      {
        path: "/automation",
        label: "Automatisation",
        icon: <Settings className="w-5 h-5" />,
        roles: ["admin"],
      },
    ],
  },

  {
    label: "Santé",
    items: [
      {
        path: "/treatments",
        label: "Traitements",
        icon: <Pill className="w-5 h-5" />,
        roles: ["veterinarian"],
      },
      {
        path: "/veterinaire",
        label: "VeterinaireDashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ["admin", "agent", "veterinarian", "commercial"],
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
    label: "Commercial",
    items: [
      {
        path: "/commercial-dashboard",
        label: "Tableau commercial",
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ["admin", "agent", "veterinarian", "commercial"],
      },
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
      {
        path: "/facturisation",
        label: "Facturation",
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ["admin", "commercial"],
      },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto shadow-sm">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-lg">
              PoultryConnect
            </h1>
            <p className="text-xs text-gray-500">Smart Poultry Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-5">
          {menuCategories.map((category) => {
            const visibleItems = category.items.filter(
              (item) => user?.role && item.roles.includes(user.role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={category.label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {category.label}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(item.path + "/");

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-[#2E7D32] text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <span
                          className={cn(
                            "flex-shrink-0",
                            isActive ? "text-white" : "text-gray-500"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}