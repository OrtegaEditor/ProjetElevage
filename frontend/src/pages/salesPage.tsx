import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { mockSales, mockFlocks } from "../data/mockData";
import { Plus, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { Sale } from "../types";

export function SalesPage() {
const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
const pendingSales = mockSales.filter((s) => s.status === "pending");
const paidSales = mockSales.filter((s) => s.status === "paid");

const getStatusBadge = (status: string) => {
switch (status) {
case "paid":
return <Badge variant="success">Payé</Badge>;
case "pending":
return <Badge variant="warning">En attente</Badge>;
case "overdue":
return <Badge variant="danger">Impayé</Badge>;
default:
return <Badge>{status}</Badge>;
}
};

return (
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
    Gestion des ventes
    </h1>
    <p className="text-gray-600">Suivi des ventes et factures</p>
</div>
<Button>
    <Plus className="w-4 h-4 mr-2" />
    Nouvelle vente
</Button>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            CA total
        </p>
        <p className="text-2xl font-semibold text-green-600">
            {formatCurrency(totalRevenue * 1000)}
        </p>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
        <DollarSign className="w-6 h-6 text-green-600" />
        </div>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        Ventes payées
        </p>
        <p className="text-2xl font-semibold text-gray-900">
        {paidSales.length}
        </p>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
        En attente
        </p>
        <p className="text-2xl font-semibold text-orange-600">
        {pendingSales.length}
        </p>
    </div>
    </CardContent>
</Card>

<Card>
    <CardContent className="p-6">
    <div className="flex items-center justify-between">
        <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
            Unités vendues
        </p>
        <p className="text-2xl font-semibold text-gray-900">
            {mockSales.reduce((sum, s) => sum + s.quantity, 0)}
        </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
    </div>
    </CardContent>
</Card>
</div>

<Card>
<CardHeader>
    <CardTitle>Toutes les ventes</CardTitle>
</CardHeader>
<CardContent>
    <div className="overflow-x-auto">
    <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Facture
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Lot
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Quantité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Prix unitaire
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Montant total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            État
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Actions
            </th>
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {mockSales.map((sale: Sale) => {
            const lot = mockFlocks.find((l) => l.id === sale.flockId);
            return (
            <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                    {sale.invoiceNumber}
                </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {lot?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {new Date(sale.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                {sale.quantity} unités
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                {formatCurrency(sale.pricePerKg * 1000)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-semibold text-gray-900">
                    {formatCurrency(sale.totalAmount * 1000)}
                </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(sale.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                    Voir
                    </Button>
                    <Button size="sm" variant="primary">
                    Facture
                    </Button>
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

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<Card>
    <CardHeader>
    <CardTitle>Ventes récentes</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="space-y-3">
        {mockSales.slice(0, 5).map((sale) => {
        const lot = mockFlocks.find((l) => l.id === sale.flockId);
        return (
            <div
            key={sale.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                <h4 className="font-medium text-gray-900">
                    {sale.invoiceNumber}
                </h4>
                <p className="text-sm text-gray-600">
                    {lot?.name} • {sale.quantity} unités
                </p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-900">
                {formatCurrency(sale.totalAmount * 1000)}
                </p>
                {getStatusBadge(sale.status)}
            </div>
            </div>
        );
        })}
    </div>
    </CardContent>
</Card>

<Card>
    <CardHeader>
    <CardTitle>Statistiques</CardTitle>
    </CardHeader>
    <CardContent>
    <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-gray-600">Panier moyen</span>
        <span className="font-semibold text-gray-900">
            {formatCurrency(
            (totalRevenue / mockSales.length) * 1000
            )}
        </span>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-gray-600">Prix moyen/unité</span>
        <span className="font-semibold text-gray-900">
            {formatCurrency(
            (mockSales.reduce((sum, s) => sum + s.pricePerKg, 0) /
                mockSales.length) *
                1000
            )}
        </span>
        </div>
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
        <span className="text-green-700">Taux de paiement</span>
        <span className="font-semibold text-green-700">
            {((paidSales.length / mockSales.length) * 100).toFixed(0)}%
        </span>
        </div>
    </div>
    </CardContent>
</Card>
</div>
</div>
);
}
