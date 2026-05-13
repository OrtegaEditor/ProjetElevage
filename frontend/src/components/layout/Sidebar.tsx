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

const menuItems: MenuItem[] = [
  {
    path: "/dashboard",
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
  {
    path: "/poultry-houses",
    label: "Poulaillers",
    icon: <Building2 className="w-5 h-5" />,
    roles: ["admin", "agent"],
  },
  {
    path: "/iot-monitoring",
    label: "Monitoring IoT",
    icon: <Thermometer className="w-5 h-5" />,
    roles: ["admin", "agent"],
  },
  {
    path: "/automation",
    label: "Automatisation",
    icon: <Settings className="w-5 h-5" />,
    roles: ["admin"],
  },
  {
    path: "/alerts",
    label: "Alertes",
    icon: <AlertTriangle className="w-5 h-5" />,
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
    path: "/stock",
    label: "Stock",
    icon: <Package className="w-5 h-5" />,
    roles: ["admin", "agent"],
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">PoultryConnect</h1>
            <p className="text-xs text-gray-500">Controlez a distance</p>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
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
        </nav>
      </div>
    </aside>
  );
}
