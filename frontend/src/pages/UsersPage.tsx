import {StatCard} from "../components/common/StatCard";
import { Flock, User } from "../types";
import { mockUsers } from "../data/mockData";
import { Button } from "../components/common/button";
import { useState } from "react";
import { InviteCollaboratorForm } from "../components/forms/InviteCollaboratorForm";
import { Plus } from "lucide-react";

// const getStockBadgeVariant = (
//     status: "normal" | "low" | "critical"
// ): "success" | "warning" | "danger" | "default" => {
//     switch (status) {
//         case "normal":
//             return "success";

//         case "low":
//             return "warning";

//         case "critical":
//             return "danger";

//         default:
//             return "default";
//     }
// };

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-purple-100 text-purple-700";
    case "agent": return "bg-blue-100 text-blue-700";
    case "veterinarian": return "bg-green-100 text-green-700";
    case "commercial": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-700";
  }
};



export default function UsersPage() {
  const users = mockUsers;
    const [inviteOpen, setInviteOpen] = useState<Boolean>(false);
    const [selectedUsers, setSelectedUsers] = useState<Boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);


  const stats = [
    {
      label: "Total utilisateurs",
      value: 4,
      icon: "",
    },
    {
      label: "Administrateurs",
      value: 1,
    },
    {
      label: "Agents Elevages",
      value: 1,
    },
    {
      label: "Vétérinaires",
      value: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 lg:p-8">
      {/* Titre de la page */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Gestion des utilisateurs
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Administration des comptes et permissions
          </p>
        </div>

    <Button onClick={() => {setInviteOpen(true); }}
      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition" >
      <Plus />
      Inviter un collaborateur
    </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>

              {stat.icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  {stat.icon}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des utilisateurs */}
      <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        {/* En-tête */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-3xl font-semibold text-gray-900">
            Tous les utilisateurs
          </h2>

          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 lg:w-96"
          />
        </div>

        {/* Version Desktop */}
        <div className="hidden overflow-x-auto lg:block">
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
                  Fermes assignées
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user: User) => (
                <tr
                  key={user.email}
                  className="border-b border-gray-100 last:border-0"
                >
                  {/* Utilisateur */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-700 font-semibold text-white">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-5 text-gray-600">{user.email}</td>

                  {/* Rôle */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Fermes */}
                  <td className="px-6 py-5 text-gray-600">{user.farms}</td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <Button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ">
                        Modifier
                      </Button>
                      <Button variant="danger" className="rounded-lg px-4 py-2 text-sm font-medium text-white">
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile */}
        <div className="space-y-4 p-6 lg:hidden">
          {users.map((user: User) => (
            <div
              key={user.email}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 font-semibold text-white">
                  {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.role}`}
                >
                  {user.role}
                </span>
                <span className="text-sm text-gray-500">{user.farms}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                  Modifier
                </button>
                <button className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
              {inviteOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md relative">

              <button
                className="absolute top-2 right-2"
                onClick={() => setInviteOpen(false)}
              >
                ✕
              </button>
              <InviteCollaboratorForm
                onClose={() => setInviteOpen(false)}
                onSubmit={(data) => {
                  console.log("invitation envoyée", data);
                }}
              />
            </div>
          </div>
        )}
    </div>
  );
}