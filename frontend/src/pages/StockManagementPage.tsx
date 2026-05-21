import { useState } from "react";
import { Package, AlertTriangle, ArrowRightLeft, Plus, Pencil, RefreshCw } from "lucide-react";
import { StatCard } from "../components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { mockStock } from "../data/mockData";
import { StockItem } from "../types";

const getCategoryLabel = (category: string) => {
switch (category) {
  case "feed": return "Alimentation";
  case "vaccine": return "Vaccin";
  case "medication": return "Médicament";
  default: return category;
}
};

const getStockStatus = (item: StockItem): "normal" | "low" | "critical" => {
if (item.quantity <= item.minThreshold * 0.5) return "critical";
if (item.quantity <= item.minThreshold) return "low";
return "normal";
};

const getStatusBadgeVariant = (status: "normal" | "low" | "critical") => {
switch (status) {
  case "normal": return "success";
  case "low": return "warning";
  case "critical": return "danger";
}
};

const getStatusLabel = (status: "normal" | "low" | "critical") => {
switch (status) {
  case "normal": return "Normal";
  case "low": return "Bas";
  case "critical": return "Critique";
}
};

export function StockManagementPage() {
const [stock, setStock] = useState(mockStock);

const criticalItems = stock.filter(s => getStockStatus(s) === "critical");
const lowItems = stock.filter(s => getStockStatus(s) === "low");

return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Gestion du stock</h1>
        <p className="text-gray-600">Inventaire et approvisionnements</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Mouvements
        </Button>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau stock
        </Button>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Articles en stock"
        value={stock.length}
        icon={<Package className="w-5 h-5 text-blue-500" />}
        iconBg="bg-blue-50"
      />
      <StatCard
        title="Niveaux critiques"
        value={criticalItems.length}
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        iconBg="bg-red-50"
        valueColor="text-red-600"
      />
      <StatCard
        title="Niveaux bas"
        value={lowItems.length}
        icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
        iconBg="bg-orange-50"
        valueColor="text-orange-500"
      />
    </div>

    {/* Alerte critique */}
    {criticalItems.length > 0 && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-800">Alertes stock critique</h3>
        </div>
        <div className="space-y-2">
          {criticalItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-100">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Stock actuel: {item.quantity} {item.unit} • Minimum: {item.minThreshold} {item.unit}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="danger">Critique</Badge>
                <Button size="sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Réapprovisionner
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Tableau inventaire */}
    <Card>
      <CardHeader>
        <CardTitle>Inventaire complet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 text-gray-600 font-medium">Article</th>
                <th className="pb-3 text-gray-600 font-medium">Catégorie</th>
                <th className="pb-3 text-gray-600 font-medium">Quantité</th>
                <th className="pb-3 text-gray-600 font-medium">Seuil min.</th>
                <th className="pb-3 text-gray-600 font-medium">État</th>
                <th className="pb-3 text-gray-600 font-medium">Dernier réappro.</th>
                <th className="pb-3 text-gray-600 font-medium">Expiration</th>
                <th className="pb-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stock.map(item => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-gray-500">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3">
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500">
                      {item.lastRestocked
                        ? new Date(item.lastRestocked).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>
                    <td className="py-3 text-gray-500">
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <RefreshCw className="w-4 h-4" />
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
  </div>
);
}