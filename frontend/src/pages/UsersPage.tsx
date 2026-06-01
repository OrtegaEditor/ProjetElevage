import { User } from "../types";
import { Button } from "../components/common/button";
import { useState, useEffect } from "react";
import { InviteCollaboratorForm } from "../components/forms/InviteCollaboratorForm";
import { Plus } from "lucide-react";
import axios from "axios";
import { EditUserModal } from "../components/forms/EditUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("agent");

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
          const response = await axios.get("http://127.0.0.1:8000/api/v1/users/me", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
            }
          });

      setCurrentUserRole(response.data.role);
    } catch (err) {
      console.error("Erreur de récupération du profil connecté :", err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr ?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const updateUser = async (
    userId: string,
    name: string,
    telephone: string,
    role?: string,
    fermeId?: string
  ) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/users/${userId}`,
        {
          name,
          telephone,
          role,
          ferme_id: fermeId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

const toggleUserStatus = async (userId: string) => {
  try {
    await axios.put(
      `http://127.0.0.1:8000/api/v1/users/${userId}/toggle-status`,
      {}, // pas de body nécessaire
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      }
    );
    fetchUsers(); // Rafraîchir la liste
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
      active: updatedData.active,
    };

    if (updatedData.role) {
      backendPayload.role = updatedData.role;
    }

    if ((updatedData as any).ferme_id) {
      backendPayload.farm_id = (updatedData as any).ferme_id;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/users/${userId}`,
        backendPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error("Erreur d'enregistrement backend :", err);
      throw err;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/users/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setUsers(response.data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
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

        <Button
          onClick={() => setInviteOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition sm:w-auto"
        >
          <Plus size={18} />
          Recruter un employé
        </Button>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {stat.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
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
              {users
                // .filter((user: User) => user.active === true)
                .map((user: User) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 font-semibold text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
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
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                        >
                          Modifier
                        </Button>
                          <Button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                              user.active ? "bg-red-500" : "bg-green-600"
                            }`}
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
        {users
          .filter((user: User) => user.active === true)
          .map((user: User) => (
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
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {user.role}
                </span>

                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {user.active ? "Actif" : "Désactivé"}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => {
                    setSelectedUser(user);
                    setIsEditOpen(true);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Modifier
                </Button>

                <Button
                  onClick={() => deleteUser(user.id)}
                  className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
                >
                  Désactiver
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