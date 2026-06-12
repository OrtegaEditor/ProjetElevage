// frontend/src/pages/SupplierManagementPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Search, Check, XCircle, Truck, Building2, Package } from "lucide-react";
import { Button } from "../components/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/common/card";
import { Input } from "../components/common/input";
import { Select } from "../components/common/select";
import { Modal } from "../components/forms/modal";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { suppliersAPI, farmsAPI } from "../services/api";
import type { Supplier, Farm } from "../types";

export function SupplierManagementPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppliersData, farmsData] = await Promise.all([
        suppliersAPI.getAll(),
        farmsAPI.getMyManagedFarms()
      ]);
      
      // Normaliser les donnees pour supporter snake_case et camelCase
      const normalizedSuppliers = (suppliersData || []).map((s: any) => ({
        ...s,
        // Normaliser farmIds: prendre farm_ids ou farmIds
        farmIds: s.farm_ids || s.farmIds || [],
        suppliedCategories: s.supplied_categories || s.suppliedCategories || []
      }));
      
      console.log("=== DONNEES NORMALISEES ===");
      normalizedSuppliers.forEach((s: any) => {
        console.log(`Fournisseur ${s.name}: farmIds =`, s.farmIds);
        console.log(`Fournisseur ${s.name}: suppliedCategories =`, s.suppliedCategories);
      });
      
      setSuppliers(normalizedSuppliers);
      setFarms(farmsData || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
      setSuppliers([]);
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, payload);
      } else {
        await suppliersAPI.create(payload);
      }
      await fetchData();
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce fournisseur ?")) {
      try {
        await suppliersAPI.delete(id);
        await fetchData();
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
  };

  const categoryOptions = [
    { value: "feed", label: "Alimentation" },
    { value: "vaccine", label: "Vaccins" },
    { value: "medication", label: "Medicaments" },
    { value: "equipment", label: "Equipements" },
    { value: "other", label: "Autres" }
  ];

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || farmId.substring(0, 8);
  };

  const filteredSuppliers = (suppliers || []).filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm);
    const matchesCategory = filterCategory === "all" || 
      (supplier.suppliedCategories || []).includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des fournisseurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/stock")} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des fournisseurs</h1>
            <p className="text-gray-600 text-sm">Gerer vos fournisseurs et leurs categories</p>
          </div>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Truck className="w-4 h-4" />
            <p className="text-sm">Total fournisseurs</p>
          </div>
          <p className="text-2xl font-bold">{(suppliers || []).length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Check className="w-4 h-4 text-green-500" />
            <p className="text-sm">Fournisseurs actifs</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{(suppliers || []).filter(s => s.active).length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="text-sm">Fermes associees</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{farms.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Package className="w-4 h-4 text-purple-500" />
            <p className="text-sm">Categories</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{categoryOptions.length}</p>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <Select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)} 
          className="w-56 bg-white"
        >
          <option value="all">Toutes categories</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Tableau des fournisseurs */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {filteredSuppliers.length} fournisseur(s) trouve(s)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Contact</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Categories</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Fermes</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-medium">Statut</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map(supplier => {
                  // Utiliser les champs normalises
                  const categories = supplier.suppliedCategories || [];
                  const farmIds = supplier.farmIds || [];
                  
                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                        {supplier.company && <div className="text-xs text-gray-500 mt-0.5">{supplier.company}</div>}
                        {supplier.address && <div className="text-xs text-gray-400 mt-0.5">{supplier.address}</div>}
                       </td>
                      <td className="px-4 py-4">
                        <div className="text-gray-700">{supplier.phone}</div>
                        {supplier.email && <div className="text-xs text-gray-500 mt-0.5">{supplier.email}</div>}
                       </td>
                      <td className="px-4 py-4">
                        {categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {categories.map(cat => {
                              const option = categoryOptions.find(c => c.value === cat);
                              return (
                                <span key={cat} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                  {option?.label || cat}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Aucune categorie</span>
                        )}
                       </td>
                      <td className="px-4 py-4">
                        {farmIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {farmIds.map(farmId => (
                              <span key={farmId} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                {getFarmName(farmId)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Aucune ferme</span>
                        )}
                       </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {supplier.active ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {supplier.active ? "Actif" : "Inactif"}
                        </span>
                       </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(supplier.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchTerm || filterCategory !== "all" 
                    ? "Aucun fournisseur ne correspond aux criteres"
                    : "Aucun fournisseur trouve"}
                </p>
                {(searchTerm || filterCategory !== "all") && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("all");
                    }}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal avec le formulaire */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingSupplier(null); }} 
        title={editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}
      >
        <SupplierForm
          initialData={editingSupplier ? {
            id: editingSupplier.id,
            name: editingSupplier.name,
            email: editingSupplier.email || "",
            phone: editingSupplier.phone,
            address: editingSupplier.address || "",
            company: editingSupplier.company || "",
            suppliedCategories: editingSupplier.suppliedCategories || [],
            farmIds: editingSupplier.farmIds || [],
            notes: editingSupplier.notes || ""
          } : undefined}
          farms={farms}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingSupplier(null); }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}