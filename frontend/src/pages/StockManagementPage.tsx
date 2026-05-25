import React, { useState } from 'react';
// import { mockStockItems } from '../data/mockData';

import { Package, AlertTriangle, ArrowRightLeft, Plus } from 'lucide-react';

const StockManagement = () => {
  const stockItems = mockStockItems;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const openModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);
  const handleMovements = () => openModal('Mouvements', 'Voir l’historique des mouvements de stock et les transferts entre entrepôts.');
  const handleNewStock = () => openModal('Nouveau stock', 'Ajouter un nouvel article au stock. Le formulaire sera disponible prochainement.');
  const handleEditItem = (itemName: string) => openModal('Modifier l’article', `Modifier ${itemName} sera disponible prochainement.`);
  const handleReplenish = (itemName: string) => openModal('Réapprovisionnement', `Demande de réapprovisionnement envoyée pour ${itemName}.`);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion du stock</h1>
          <p className="text-gray-500">Inventaire et approvisionnements</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50 transition"
            onClick={handleMovements}
          >
            <ArrowRightLeft size={18} /> Mouvements
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={handleNewStock}
          >
            <Plus size={18} /> Nouveau stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Articles en stock" value="4" icon={<Package className="text-blue-500" />} />
        <StatCard title="Niveaux critiques" value="1" valueColor="text-red-600" icon={<AlertTriangle className="text-red-500" />} />
        <StatCard title="Niveaux bas" value="1" valueColor="text-orange-500" icon={<AlertTriangle className="text-orange-500" />} />
      </div>

      {/* Critical Alert Banner */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8 flex justify-between items-center">
        <div className="flex items-start gap-4">
          <div className="mt-1"><AlertTriangle className="text-red-500" size={20} /></div>
          <div>
            <h3 className="font-bold text-gray-800">Alertes stock critique</h3>
            <div className="mt-4 p-4 bg-white rounded-lg border border-red-100 flex justify-between items-center w-[500px]">
              <div>
                <p className="font-semibold text-gray-800">Amoxicilline injectable</p>
                <p className="text-sm text-gray-500">Stock actuel: 3 flacons • Minimum: 5 flacons</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Critique</span>
                <button
                  className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm"
                  onClick={() => handleReplenish('Amoxicilline injectable')}
                >
                  Réapprovisionner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Inventaire complet</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Article</th>
              <th className="px-6 py-4 font-medium">Catégorie</th>
              <th className="px-6 py-4 font-medium">Quantité</th>
              <th className="px-6 py-4 font-medium">Seuil Min.</th>
              <th className="px-6 py-4 font-medium">État</th>
              <th className="px-6 py-4 font-medium">Dernier Réappro.</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stockItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition text-sm">
                <td className="px-6 py-4 font-medium text-gray-700">{item.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">{item.quantity}</td>
                <td className="px-6 py-4 text-gray-500">{item.min}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${item.statusColor || 'bg-green-100 text-green-600'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{item.date || '15/03/2024'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                    className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100"
                    onClick={() => handleEditItem(item.name)}
                  >
                    Modifier
                  </button>
                    <button
                      className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800"
                      onClick={() => handleReplenish(item.name)}
                    >
                      Réappro.
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{modalTitle}</h3>
                <p className="mt-3 text-gray-600">{modalMessage}</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  valueColor?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, valueColor = "text-gray-800" }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h2 className={`text-3xl font-bold ${valueColor}`}>{value}</h2>
    </div>
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      {icon}
    </div>
  </div>
);

export default StockManagement;