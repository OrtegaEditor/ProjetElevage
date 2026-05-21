// frontend/src/pages/Management/SalesPage.tsx
import { useState } from "react";
import { mockSales, mockFlocks, mockClients } from "../../data/mockData";
import { Sale } from "../../types";
import { StatCard } from "../../components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/card";
import { Button } from "../../components/common/button";
import { Plus, DollarSign, TrendingUp, ShoppingCart, FileText, X } from "lucide-react";


export function SalesDashboard() {
const [sales, setSales] = useState(mockSales);
const [modalOpen, setModalOpen] = useState(false);
const [invoiceModal, setInvoiceModal] = useState(false);
const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
const paidCount = sales.filter(s => s.status === "paid").length;
const pendingCount = sales.filter(s => s.status === "pending").length;
const unitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

const formatXAF = (value: number) =>
  value.toLocaleString("fr-FR") + " FCFA";

return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gestion des ventes</h1>
        <p className="text-gray-600">Suivi des ventes et factures</p>
      </div>
      <Button onClick={() => setModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Nouvelle vente
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="CA total" value={formatXAF(totalRevenue)} icon={<DollarSign className="text-green-600" />} iconBg="bg-green-100" />
      <StatCard title="Ventes payées" value={String(paidCount)} icon={<ShoppingCart className="text-blue-600" />} iconBg="bg-blue-100" />
      <StatCard title="En attente" value={String(pendingCount)} valueColor="text-orange-500" />
      <StatCard title="Unités vendues" value={String(unitsSold)} icon={<TrendingUp className="text-purple-600" />} iconBg="bg-purple-100" />
    </div>

    <Card>
      <CardHeader><CardTitle>Toutes les ventes</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-gray-600 font-medium">Facture</th>
                <th className="pb-3 text-gray-600 font-medium">Client</th>
                <th className="pb-3 text-gray-600 font-medium">Lot</th>
                <th className="pb-3 text-gray-600 font-medium">Date</th>
                <th className="pb-3 text-gray-600 font-medium">Quantité</th>
                <th className="pb-3 text-gray-600 font-medium">Montant</th>
                <th className="pb-3 text-gray-600 font-medium">Statut</th>
                <th className="pb-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.map(sale => {
                const client = mockClients.find(c => c.id === sale.clientId);
                const flock = mockFlocks.find(f => f.id === sale.flockId);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{sale.invoiceNumber}</td>
                    <td className="py-3 text-gray-600">{client?.name ?? "-"}</td>
                    <td className="py-3 text-gray-600">{flock?.name ?? "-"}</td>
                    <td className="py-3 text-gray-600">{new Date(sale.date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 text-gray-900">{sale.quantity} unités</td>
                    <td className="py-3 font-semibold text-gray-900">{formatXAF(sale.totalAmount)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sale.status === "paid" ? "text-green-600 bg-green-50" :
                        sale.status === "pending" ? "text-orange-600 bg-orange-50" :
                        "text-red-600 bg-red-50"
                      }`}>
                        {sale.status === "paid" ? "Payé" : sale.status === "pending" ? "En attente" : "Annulé"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedSale(sale); setInvoiceModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#2E7D32] text-white rounded text-xs hover:bg-[#1B5E20]"
                        >
                          <FileText className="w-3.5 h-3.5" /> Facture
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Modal Facture */}
    {invoiceModal && selectedSale && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Facture {selectedSale.invoiceNumber}</h3>
            <button title="Fermer" onClick={() => setInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Client</p><p className="font-semibold">{mockClients.find(c => c.id === selectedSale.clientId)?.name ?? "-"}</p></div>
              <div><p className="text-gray-500">Lot</p><p className="font-semibold">{mockFlocks.find(f => f.id === selectedSale.flockId)?.name ?? "-"}</p></div>
              <div><p className="text-gray-500">Date</p><p className="font-semibold">{new Date(selectedSale.date).toLocaleDateString("fr-FR")}</p></div>
              <div><p className="text-gray-500">Statut</p><p className="font-semibold">{selectedSale.status === "paid" ? "Payé" : "En attente"}</p></div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Quantité</span><span>{selectedSale.quantity} unités</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Poids total</span><span>{selectedSale.totalWeight} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prix/kg</span><span>{selectedSale.pricePerKg} FCFA</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                <span>Total</span><span>{formatXAF(selectedSale.totalAmount)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setInvoiceModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Fermer</button>
              <Button onClick={() => alert(`Impression facture ${selectedSale.invoiceNumber}`)}>Imprimer</Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}