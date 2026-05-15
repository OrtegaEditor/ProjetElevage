import React, { ChangeEvent, useState } from 'react';

import { Plus, DollarSign, TrendingUp, ShoppingCart, Eye, FileText, X } from 'lucide-react';

type Sale = {
  id: string;
  lot: string;
  date: string;
  quantity: string;
  unitPrice: string;
  total: string;
  status: string;
  statusColor: string;
};

const initialSales: Sale[] = [
  { id: 'INV-2024-042', lot: 'P2024-01', date: '28/04/2024', quantity: '395 unités', unitPrice: '1850,00 €', total: '730 750,00 €', status: 'Payé', statusColor: 'text-green-600 bg-green-50' },
  { id: 'INV-2024-043', lot: 'P2024-03', date: '01/05/2024', quantity: '50 unités', unitPrice: '1750,00 €', total: '87 500,00 €', status: 'En attente', statusColor: 'text-orange-600 bg-orange-50' },
];

const SalesDashboard = () => {
  const [allSales, setAllSales] = useState<Sale[]>(initialSales);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [newSaleData, setNewSaleData] = useState<Omit<Sale, 'statusColor'>>({
    id: '',
    lot: '',
    date: '',
    quantity: '',
    unitPrice: '',
    total: '',
    status: 'En attente',
  });

  const numericValue = (value: string) => Number(value.replace(/[^0-9\-\.]/g, '').replace(',', '.')) || 0;
  const formatEuro = (value: number) => value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const totalRevenue = formatEuro(allSales.reduce((sum, sale) => sum + numericValue(sale.total), 0));
  const paidCount = allSales.filter((sale) => sale.status === 'Payé').length;
  const pendingCount = allSales.filter((sale) => sale.status !== 'Payé').length;
  const unitsSold = allSales.reduce((sum, sale) => sum + numericValue(sale.quantity), 0);

  const handleOpenInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  const resetNewSaleData = () => {
    setNewSaleData({
      id: '',
      lot: '',
      date: '',
      quantity: '',
      unitPrice: '',
      total: '',
      status: 'En attente',
    });
  };

  const handleNewSaleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setNewSaleData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSale = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const statusColor = newSaleData.status === 'Payé'
      ? 'text-green-600 bg-green-50'
      : 'text-orange-600 bg-orange-50';

    setAllSales((prev) => [
      ...prev,
      {
        ...newSaleData,
        statusColor,
      },
    ]);

    setShowNewSaleModal(false);
    resetNewSaleData();
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des ventes</h1>
          <p className="text-slate-500">Suivi des ventes et factures</p>
        </div>
        <button
          className="flex items-center gap-2 bg-[#2d7a43] hover:bg-[#246336] text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => setShowNewSaleModal(true)}
        >
          <Plus size={20} />
          <span>Nouvelle vente</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="CA total" value={totalRevenue} icon={<DollarSign className="text-green-600" />} iconBg="bg-green-100" />
        <StatCard title="Ventes payées" value={String(paidCount)} />
        <StatCard title="En attente" value={String(pendingCount)} valueColor="text-orange-500" />
        <StatCard title="Unités vendues" value={String(unitsSold)} icon={<TrendingUp className="text-blue-600" />} iconBg="bg-blue-100" />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold">Toutes les ventes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Facture</th>
                <th className="px-6 py-4 font-medium">Lot</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Quantité</th>
                <th className="px-6 py-4 font-medium">Prix Unitaire</th>
                <th className="px-6 py-4 font-medium">Montant Total</th>
                <th className="px-6 py-4 font-medium">État</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors text-sm">
                  <td className="px-6 py-4 font-medium">{sale.id}</td>
                  <td className="px-6 py-4 text-slate-500">{sale.lot}</td>
                  <td className="px-6 py-4 text-slate-500">{sale.date}</td>
                  <td className="px-6 py-4 font-medium">{sale.quantity}</td>
                  <td className="px-6 py-4 text-slate-500">{sale.unitPrice}</td>
                  <td className="px-6 py-4 font-bold">{sale.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${sale.statusColor}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="p-1.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-100"
                      onClick={() => handleOpenInvoice(sale)}
                    >
                      <span className="text-xs px-1">Voir</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#2d7a43] text-white rounded text-xs hover:bg-[#246336]"
                      onClick={() => handleOpenInvoice(sale)}
                    >
                      <FileText size={14} />
                      Facture
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Ventes récentes</h2>
          <div className="space-y-4">
            {allSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{sale.id}</p>
                    <p className="text-xs text-slate-500">{sale.lot} • {sale.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{sale.total}</p>
                  <p className={`text-[10px] font-medium uppercase tracking-tighter ${sale.statusColor.split(' ')[0]}`}>
                    {sale.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Statistiques</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Panier moyen</span>
              <span className="font-bold">{formatEuro(allSales.length > 0 ? allSales.reduce((sum, sale) => sum + numericValue(sale.total), 0) / allSales.length : 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Prix moyen/unité</span>
              <span className="font-bold">{formatEuro(allSales.length > 0 ? allSales.reduce((sum, sale) => sum + numericValue(sale.unitPrice), 0) / allSales.length : 0)}</span>
            </div>
            <div className="mt-8 p-4 bg-green-50 rounded-xl flex justify-between items-center border border-green-100">
              <span className="text-green-700 font-medium text-sm">Taux de paiement</span>
              <span className="text-green-700 font-bold text-lg">{allSales.length ? Math.round((paidCount / allSales.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-semibold">Ajouter une nouvelle vente</h3>
                <p className="text-slate-500 text-sm">Remplissez les détails de la facture.</p>
              </div>
              <button onClick={() => setShowNewSaleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSale} className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Numéro de facture</span>
                <input
                  type="text"
                  name="id"
                  value={newSaleData.id}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  placeholder="INV-2024-050"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Lot</span>
                <input
                  type="text"
                  name="lot"
                  value={newSaleData.lot}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  placeholder="P2024-05"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Date</span>
                <input
                  type="date"
                  name="date"
                  value={newSaleData.date}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Quantité</span>
                <input
                  type="text"
                  name="quantity"
                  value={newSaleData.quantity}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  placeholder="100 unités"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Prix unitaire</span>
                <input
                  type="text"
                  name="unitPrice"
                  value={newSaleData.unitPrice}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  placeholder="1800,00 €"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Montant total</span>
                <input
                  type="text"
                  name="total"
                  value={newSaleData.total}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  placeholder="180 000,00 €"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>État</span>
                <select
                  name="status"
                  value={newSaleData.status}
                  onChange={handleNewSaleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                >
                  <option value="En attente">En attente</option>
                  <option value="Payé">Payé</option>
                </select>
              </label>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowNewSaleModal(false); resetNewSaleData(); }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2d7a43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#246336]"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoiceModal && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-semibold">Facture {selectedSale.id}</h3>
                <p className="text-slate-500 text-sm">Détails de la vente sélectionnée.</p>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-slate-500 text-sm">Facture</p>
                  <p className="font-semibold">{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Statut</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${selectedSale.statusColor}`}>
                    {selectedSale.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Lot</p>
                  <p className="font-semibold">{selectedSale.lot}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Date</p>
                  <p className="font-semibold">{selectedSale.date}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Quantité</span>
                  <span>{selectedSale.quantity}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Prix unitaire</span>
                  <span>{selectedSale.unitPrice}</span>
                </div>
                <div className="mt-4 flex justify-between text-base font-semibold">
                  <span>Total à payer</span>
                  <span>{selectedSale.total}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => alert(`Facture ${selectedSale.id} affichée`)}
                  className="rounded-xl bg-[#2d7a43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#246336]"
                >
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, iconBg, valueColor = "text-slate-800" }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
    <div>
      <p className="text-slate-500 text-sm mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${valueColor}`}>{value}</h3>
    </div>
    {icon && (
      <div className={`p-2 rounded-lg ${iconBg}`}>
        {icon}
      </div>
    )}
  </div>
);

export default SalesDashboard;