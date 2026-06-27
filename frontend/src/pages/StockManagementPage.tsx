// frontend/src/pages/StockManagementPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, AlertTriangle, ArrowRightLeft, Plus, Pencil, RefreshCw, Truck, Search, ChevronRight } from "lucide-react";
import { StatCard } from "../components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Badge } from "../components/common/badge";
import { Button } from "../components/common/button";
import { Input } from "../components/common/input";
import { Select } from "../components/common/select";
import { RestockingForm } from "../components/forms/RestockingForm";
import { stockAPI, suppliersAPI } from "../services/api";
import type { StockItem, Supplier } from "../types";

export function StockManagementPage() {
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStock();
    fetchSuppliers();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const data = await stockAPI.getAll();
      
      // Normaliser les donnees (snake_case -> camelCase)
      const normalizedStock = (data || []).map((item: any) => ({
        ...item,
        supplierId: item.supplier_id || item.supplierId,
        minThreshold: item.min_threshold || item.minThreshold,
        lastRestocked: item.last_restocked || item.lastRestocked,
        expiryDate: item.expiry_date || item.expiryDate,
        farmId: item.farm_id || item.farmId
      }));
      
      setStock(normalizedStock);
    } catch (error) {
      console.error("Erreur chargement stock:", error);
      setStock([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await suppliersAPI.getAll();
      const normalizedSuppliers = (data || []).map((s: any) => ({
        ...s,
        id: s.id,
        name: s.name,
        farmIds: s.farm_ids || s.farmIds || [],
        suppliedCategories: s.supplied_categories || s.suppliedCategories || []
      }));
      setSuppliers(normalizedSuppliers);
    } catch (error) {
      console.error("Erreur chargement fournisseurs:", error);
      setSuppliers([]);
    }
  };

  // Pour l'ajout ou le réapprovisionnement
  const handleRestock = (item?: StockItem) => {
    setSelectedStockItem(item || null);
    setIsRestockOpen(true);
    setIsEditOpen(false);
  };

  // Pour la modification
  const handleEdit = (item: StockItem) => {
    setSelectedStockItem(item);
    setIsEditOpen(true);
    setIsRestockOpen(true);
  };

  const handleStockSave = () => {
    fetchStock();
    setIsRestockOpen(false);
    setIsEditOpen(false);
    setSelectedStockItem(null);
  };

  const getStockStatus = (item: StockItem): "normal" | "low" | "critical" => {
    if (item.quantity <= item.minThreshold * 0.5) return "critical";
    if (item.quantity <= item.minThreshold) return "low";
    return "normal";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      feed: "Alimentation",
      vaccine: "Vaccin",
      medication: "Médicament",
      equipment: "Équipement",
      other: "Autre"
    };
    return labels[category] || category;
  };

  const filteredStock = stock.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const criticalItems = stock.filter(s => getStockStatus(s) === "critical");
  const lowItems = stock.filter(s => getStockStatus(s) === "low");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion du stock</h1>
          <p className="text-gray-600 mt-1">Inventaire et approvisionnements</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/stock/movements")}
            className="gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Mouvements
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/suppliers")}
            className="gap-2"
          >
            <Truck className="w-4 h-4" />
            Fournisseurs
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button onClick={() => handleRestock()} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            Nouveau stock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    Stock actuel: {item.quantity} {item.unit} • Seuil minimum: {item.minThreshold} {item.unit}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRestock(item)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Réapprovisionner
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)} 
          className="w-full sm:w-48 bg-white"
        >
          <option value="">Toutes catégories</option>
          <option value="feed">Alimentation</option>
          <option value="vaccine">Vaccins</option>
          <option value="medication">Médicaments</option>
          <option value="equipment">Équipements</option>
          <option value="other">Autres</option>
        </Select>
      </div>

      {/* Tableau inventaire */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Inventaire complet</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {filteredStock.length} article(s) trouvé(s) sur {stock.length} au total
          </p>
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
                  <th className="pb-3 text-gray-600 font-medium">Fournisseur</th>
                  <th className="pb-3 text-gray-600 font-medium">Expiration</th>
                  <th className="pb-3 text-gray-600 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStock.map(item => {
                  const status = getStockStatus(item);
                  const supplier = suppliers.find(s => s.id === item.supplierId);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="py-3">
                        <span className="inline-flex bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
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
                        <Badge 
                          variant={status === "critical" ? "danger" : status === "low" ? "warning" : "success"}
                        >
                          {status === "critical" ? "Critique" : status === "low" ? "Bas" : "Normal"}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-600">
                        {supplier?.name || "-"}
                      </td>
                      <td className="py-3 text-gray-500">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Bouton Modifier (Pencil) */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Modifier l'article"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {/* Bouton Réapprovisionner (Refresh) */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRestock(item)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Réapprovisionner"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStock.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun article trouvé</p>
                {(searchTerm || selectedCategory) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Réapprovisionnement / Modification */}
      <RestockingForm
        open={isRestockOpen}
        onClose={() => { setIsRestockOpen(false); setSelectedStockItem(null); setIsEditOpen(false); }}
        onSave={handleStockSave}
        initialStockItem={selectedStockItem || undefined}
        isEditMode={isEditOpen}
      />
    </div>
  );
}