
import React, { useMemo, useState } from "react";
import { Plus, Trash2, FileText, Calendar, User, Layers } from "lucide-react";
import "../../styles/tailwind.css";

/**
 * IMPORTATION DES TYPES REELS
 */
import { Sale, Client, Flock } from "../../types/index";

/**
 * IMPORTATION DES DONNEES MAQUETTES (MOCK)
 */
import { mockClients, mockFlocks, mockSales } from "../../data/mockData";

// Structure locale pour gérer les lignes d'articles dynamiques de la facture en cours
interface LocalInvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

const initialItems: LocalInvoiceItem[] = [
  { id: 1, description: "Suivi sanitaire global", quantity: 1, unitPrice: 120 },
  { id: 2, description: "Alimentation de croissance poulets", quantity: 5, unitPrice: 250 },
];

export default function Facturisation() {
  const [invoiceNumber, setInvoiceNumber] = useState("FAC-2026-004");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  
  // États pour lier la facture à vos entités réelles du troupeau
  const [selectedClientId, setSelectedClientId] = useState(mockClients[0]?.id || "");
  const [selectedFlockId, setSelectedFlockId] = useState(mockFlocks[0]?.id || "");
  const [items, setItems] = useState<LocalInvoiceItem[]>(initialItems);

  // Calculs financiers
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );
  
  const taxRate = 0.192; // Taux standard (ex: TVA 19.2%)
  const taxes = useMemo(() => Number((subtotal * taxRate).toFixed(2)), [subtotal]);
  const total = useMemo(() => Number((subtotal + taxes).toFixed(2)), [subtotal, taxes]);

  // Actions sur les articles
  const updateItem = (id: number, field: keyof Omit<LocalInvoiceItem, "id">, value: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "description" ? value : Number(value),
            }
          : item
      )
    );
  };

  const addItem = () => {
    const nextId = items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems((current) => [
      ...current,
      { id: nextId, description: "Nouvel article / prestation", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  // Simulation d'enregistrement conforme au type Sale
  const handleSaveInvoice = () => {
    const newSale: Omit<Sale, "id"> = {
      clientId: selectedClientId,
      flockId: selectedFlockId,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      pricePerKg: 0, // Optionnel ou calculé selon votre logique métier
      totalWeight: 0,
      totalAmount: total,
      date: date,
      invoiceNumber: invoiceNumber,
      status: "pending",
    };
    
    alert(`Facture ${newSale.invoiceNumber} enregistrée avec succès pour un montant de ${newSale.totalAmount.toLocaleString("fr-FR")} F CFA / € !`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      {/* En-tête de la page */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-green-700" size={28} />
            Facturation & Ventes
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les factures de votre exploitation, assignez-les aux lots et suivez les règlements.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveInvoice}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition shadow-sm"
        >
          Enregistrer la facture
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire des détails de la facture */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Informations Générales
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText size={16} className="text-gray-400" /> Numéro de facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-400" /> Date d'émission
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <User size={16} className="text-gray-400" /> Client Destinataire
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 text-sm"
                >
                  {mockClients.map((client: Client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Layers size={16} className="text-gray-400" /> Lot associé (Flock)
                </label>
                <select
                  value={selectedFlockId}
                  onChange={(e) => setSelectedFlockId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600 bg-gray-50 text-sm"
                >
                  {mockFlocks.map((flock: Flock) => (
                    <option key={flock.id} value={flock.id}>
                      {flock.name} - {flock.poultryType} ({flock.quantity} têtes)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tableau des Articles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-semibold text-gray-900">Articles & Prestations</h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition border border-green-200"
              >
                <Plus size={16} /> Ajouter une ligne
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase bg-gray-50 tracking-wider">
                    <th className="py-3 px-4">Désignation / Description</th>
                    <th className="py-3 px-4 w-28">Quantité</th>
                    <th className="py-3 px-4 w-40">Prix Unitaire</th>
                    <th className="py-3 px-4 w-36">Montant HT</th>
                    <th className="py-3 px-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-green-600 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-green-600 text-sm font-medium"
                        />
                      </td>
                      <td className="p-3">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-green-600 text-sm text-right font-medium"
                          />
                        </div>
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-900 text-right pr-6">
                        {(item.quantity * item.unitPrice).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Supprimer la ligne"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                        Aucun article ajouté. Cliquez sur "Ajouter une ligne" pour commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section Récapitulatif / Totaux */}
        <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Résumé Financier
          </h2>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Sous-total HT</span>
              <span className="font-semibold text-gray-900 text-base">
                {subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Taxes ({(taxRate * 100).toFixed(1)}%)</span>
              <span className="font-semibold text-gray-900">
                {taxes.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-gray-900">
              <span className="text-base font-bold">Montant Total TTC</span>
              <span className="text-2xl font-black text-green-700">
                {total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-xs text-gray-500">
            <p className="font-semibold uppercase text-gray-600 tracking-wider">Rappel Métier :</p>
            <p>• Le statut initial de cette facture sera configuré sur <span className="font-medium text-orange-600">En attente (pending)</span>.</p>
            <p>• Les statistiques financières associées au lot sélectionné se mettront à jour dynamiquement à l'enregistrement.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
