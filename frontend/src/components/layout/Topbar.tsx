import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { mockAlerts } from "../../data/mockData";


export function Topbar() {
const navigate = useNavigate();
const { user, logout } = useAuth();
const [showUserMenu, setShowUserMenu] = useState(false);

// Calcul du nombre d'alertes non résolues
const unreadAlerts = mockAlerts.filter((a) => !a.resolvedAt).length;

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: "Administrateur",
    agent: "Agent d'élevage",
    veterinarian: "Vétérinaire",
    commercial: "Commercial",
  };
  return labels[role] || role;
};

return (
  <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-64 right-0 z-10">
    <div className="h-full px-6 flex items-center justify-between">
      {/* Barre de recherche */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Menu déroulant profil */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-[#2E7D32] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role && getRoleLabel(user.role)}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Mon profil
              </button>
              
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);
}