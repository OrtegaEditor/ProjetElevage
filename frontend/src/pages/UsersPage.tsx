// cTayQ0kP9ZicBA92Ib3ZzVKARa2hoKPv
import { User } from "../types";
import { Button } from "../components/common/button";
import { useState, useEffect } from "react";
import { InviteCollaboratorForm } from "../components/forms/InviteCollaboratorForm";
import { Plus, RefreshCw } from "lucide-react";
import axios from "axios";
import { EditUserModal } from "../components/forms/EditUserModal";
import { usersAPI } from "../services/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("agent");

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
      const userData = await usersAPI.getMe();
      setCurrentUserRole(userData.role);
    } catch (err) {
      console.error("Erreur de récupération du profil connecté :", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getCollaborators();
      setUsers(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr ?")) return;

    try {
      await usersAPI.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const updateUser = async (
    userId: string,
    name: string,
    telephone: string,
    role?: string
  ) => {
    try {
      await usersAPI.updateUser(userId, { name, telephone, role });
      await fetchUsers();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      await usersAPI.toggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      console.error("Erreur lors de la bascule du statut:", err);
    }
  };

  const handleSaveModal = async (
    userId: string,
    updatedData: Partial<User>
  ) => {
    const backendPayload: any = {
      name: updatedData.name,
      telephone: updatedData.telephone,
    };

    if (updatedData.role) {
      backendPayload.role = updatedData.role;
    }

    try {
      await usersAPI.updateUser(userId, backendPayload);
      await fetchUsers();
    } catch (err) {
      console.error("Erreur d'enregistrement backend :", err);
      throw err;
    }
  };

  const stats = [
    { label: "Total utilisateurs", value: users.length },
    {
      label: "Administrateurs",
      value: users.filter((u) => u.role === "admin").length,
    },
    {
      label: "Agents Elevages",
      value: users.filter((u) => u.role === "agent").length,
    },
    {
      label: "Vétérinaires",
      value: users.filter((u) => u.role === "veterinarian").length,
    },
    {
      label: "Commercial",
      value: users.filter((u) => u.role === "commercial").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Gestion des utilisateurs
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base lg:text-lg">
            Administration des comptes et permissions
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>

          <Button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition"
          >
            <Plus size={18} />
            Recrutement
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE DESKTOP */}
      <section className="hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:block">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-3xl font-semibold text-gray-900">
            Tous les utilisateurs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} utilisateur(s) trouvé(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Rôle
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 font-semibold text-white">
                        {user.name?.substring(0, 2).toUpperCase() || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-600">{user.email}</td>
                  <td className="px-6 py-5 text-gray-600">{user.telephone || "—"}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'veterinarian' ? 'bg-green-100 text-green-700' :
                      user.role === 'commercial' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'agent' ? 'Agent' :
                      user.role === 'veterinarian' ? 'Vétérinaire' :
                      user.role === 'commercial' ? 'Commercial' :
                      user.role === 'admin' ? 'Admin' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.active ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Modifier
                      </Button>
                      <Button
                        onClick={() => toggleUserStatus(user.id)}
                        variant={user.active ? "danger" : "primary"}
                        size="sm"
                      >
                        {user.active ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MOBILE CARDS */}
      <div className="space-y-4 lg:hidden">
        {users.map((user: User) => (
          <div
            key={user.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 font-semibold text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-semibold text-gray-900">
                  {user.name}
                </h3>

                <p className="truncate text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                user.role === 'veterinarian' ? 'bg-green-100 text-green-700' :
                user.role === 'commercial' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {user.role === 'agent' ? 'Agent' :
                user.role === 'veterinarian' ? 'Vétérinaire' :
                user.role === 'commercial' ? 'Commercial' :
                user.role === 'admin' ? 'Admin' : user.role}
              </span>

              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {user.active ? "Actif" : "Désactivé"}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setSelectedUser(user);
                  setIsEditOpen(true);
                }}
                variant="outline"
                className="w-full"
              >
                Modifier
              </Button>

              <Button
                onClick={() => toggleUserStatus(user.id)}
                variant={user.active ? "danger" : "primary"}
                className="w-full"
              >
                {user.active ? "Désactiver" : "Activer"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL INVITATION */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              className="absolute right-4 top-4 text-gray-500 transition hover:text-black"
              onClick={() => setInviteOpen(false)}
            >
              ✕
            </button>

            <InviteCollaboratorForm
              onClose={() => {
                setInviteOpen(false);
                fetchUsers();
              }}
              onSubmit={() => {}}
            />
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          currentUserRole={currentUserRole}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}