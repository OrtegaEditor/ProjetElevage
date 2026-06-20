    // frontend/src/pages/StockRestockPage.tsx
    import React, { useState, useEffect } from "react";
    import { useNavigate, useSearchParams } from "react-router-dom";
    import { Button } from "../components/common/button";
    import { Input } from "../components/common/input";
    import { Select } from "../components/common/select";
    import { Label } from "../components/ui/label";
    import { Textarea } from "../components/ui/textarea";
    import { Card, CardContent } from "../components/common/card";
    import { ArrowLeft, AlertTriangle } from "lucide-react";
    import { stockAPI, suppliersAPI, farmsAPI,usersAPI } from "../services/api";
    import type { StockItem, Supplier, Farm } from "../types";

    type Category = "feed" | "vaccine" | "medication" | "equipment" | "other";
    type FeedSubType = "starter" | "grower" | "finisher";

    interface RestockFormData {
    name: string;
    farmId: string;
    supplierId: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    unitPrice: number;
    expiryDate: string;
    restockDate: string;
    notes: string;
    }

    export function StockRestockPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Récupérer et DÉCODER les paramètres de l'URL
    const categoryParam = searchParams.get("category") as Category | null;
    const productNameParam = searchParams.get("name") 
        ? decodeURIComponent(searchParams.get("name")!) 
        : null;
    const farmIdParam = searchParams.get("farmId");
    const stockItemIdParam = searchParams.get("stockItemId");

    console.log("=== STOCK RESTOP PAGE MOUNTED ===");
    console.log("Paramètres reçus (décodés):", { 
        categoryParam, 
        productNameParam, 
        farmIdParam, 
        stockItemIdParam 
    });

    const [loading, setLoading] = useState(false);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [category, setCategory] = useState<Category>(categoryParam || "feed");
    const [feedSubType, setFeedSubType] = useState<FeedSubType>("starter");
    const [existingStockItem, setExistingStockItem] = useState<StockItem | null>(null);
    const [loadingStock, setLoadingStock] = useState(false);
    const [loadingFarms, setLoadingFarms] = useState(false);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);

    const [formData, setFormData] = useState<RestockFormData>({
        name: productNameParam || "",
        farmId: farmIdParam || "",
        supplierId: "",
        quantity: 0,
        unit: "",
        minThreshold: 0,
        unitPrice: 0,
        expiryDate: "",
        restockDate: new Date().toISOString().split("T")[0],
        notes: ""
    });

    // Charger les fermes accessibles
    const fetchFarms = async () => {
        setLoadingFarms(true);
        try {
        const data = await usersAPI.getMyAccessibleFarms();
        console.log("Fermes chargées:", data);
        setFarms(data || []);
        if (data && data.length > 0 && !formData.farmId) {
            setFormData(prev => ({ ...prev, farmId: data[0].id }));
        } else if (formData.farmId && data && data.length > 0) {
            // Vérifier que la ferme paramétrée est dans la liste
            const farmExists = data.some(f => f.id === formData.farmId);
            if (!farmExists && data.length > 0) {
            setFormData(prev => ({ ...prev, farmId: data[0].id }));
            }
        }
        } catch (error) {
        console.error("Erreur chargement fermes:", error);
        } finally {
        setLoadingFarms(false);
        }
    };

    // Charger les fournisseurs
    const fetchSuppliers = async () => {
        setLoadingSuppliers(true);
        try {
        const data = await suppliersAPI.getAll();
        console.log("Fournisseurs chargés:", data);
        setSuppliers(data || []);
        } catch (error) {
        console.error("Erreur chargement fournisseurs:", error);
        } finally {
        setLoadingSuppliers(false);
        }
    };

    // Charger l'article existant si stockItemId est fourni
    const fetchExistingStockItem = async () => {
        if (!stockItemIdParam) return;

        setLoadingStock(true);
        try {
        const item = await stockAPI.getById(stockItemIdParam);
        console.log("Article existant chargé:", item);
        setExistingStockItem(item);
        setFormData(prev => ({
            ...prev,
            name: item.name,
            farmId: item.farmId,
            supplierId: item.supplierId || "",
            unit: item.unit,
            minThreshold: item.minThreshold,
            unitPrice: item.unitPrice || 0,
            expiryDate: item.expiryDate || "",
            notes: item.notes || ""
        }));
        setCategory(item.category);
        
        if (item.category === "feed" && (item as any).feedSubType) {
            setFeedSubType((item as any).feedSubType as FeedSubType);
        }
        } catch (error) {
        console.error("Erreur chargement article:", error);
        } finally {
        setLoadingStock(false);
        }
    };

    useEffect(() => {
        fetchFarms();
        fetchSuppliers();
        fetchExistingStockItem();
    }, []);

    const updateProductName = (subType: FeedSubType) => {
        if (category === "feed") {
        const names = {
            starter: "Aliment démarrage",
            grower: "Aliment croissance",
            finisher: "Aliment finition"
        };
        setFormData(prev => ({ ...prev, name: names[subType] }));
        }
    };

    const handleFeedSubTypeChange = (value: FeedSubType) => {
        setFeedSubType(value);
        updateProductName(value);
    };

    const handleCategoryChange = (value: Category) => {
        setCategory(value);

        if (value === "feed") {
        setFormData(prev => ({ ...prev, name: "Aliment" }));
        } else if (value === "vaccine") {
        setFormData(prev => ({ ...prev, name: "Vaccin" }));
        } else if (value === "medication") {
        setFormData(prev => ({ ...prev, name: "Médicament" }));
        } else if (value === "equipment") {
        setFormData(prev => ({ ...prev, name: "Équipement" }));
        } else if (value === "other") {
        setFormData(prev => ({ ...prev, name: "Autre produit" }));
        }
    };

    const handleChange = (field: keyof RestockFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const suggestQuantity = () => {
        if (existingStockItem && existingStockItem.minThreshold > 0) {
        const suggestedQty = existingStockItem.minThreshold * 2;
        setFormData(prev => ({ ...prev, quantity: suggestedQty }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
        let finalName = formData.name;
        if (category === "feed" && !finalName.toLowerCase().includes(feedSubType)) {
            const subTypeLabels = {
            starter: "Démarrage",
            grower: "Croissance", 
            finisher: "Finition"
            };
            finalName = `${subTypeLabels[feedSubType]} - ${finalName}`;
        }

        const stockData = {
            name: finalName,
            category: category,
            quantity: formData.quantity,
            unit: formData.unit,
            min_threshold: formData.minThreshold,
            farm_id: formData.farmId,
            supplier_id: formData.supplierId || null,
            last_restocked: formData.restockDate,
            expiry_date: formData.expiryDate || null,
            unit_price: formData.unitPrice,
            notes: category === "feed" ? `Type d'aliment: ${feedSubType}\n${formData.notes}` : formData.notes,
            feedSubType: category === "feed" ? feedSubType : undefined,
        };

        if (existingStockItem) {
            await stockAPI.adjustQuantity(
            existingStockItem.id, 
            formData.quantity, 
            "entry", 
            `Réapprovisionnement - ${category === "feed" ? feedSubType : ""}`
            );
        } else {
            await stockAPI.create(stockData);
        }
        
        navigate(-1);
        } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("Erreur lors de l'enregistrement");
        } finally {
        setLoading(false);
        }
    };

    const getTitle = () => existingStockItem ? "Réapprovisionner le stock" : "Nouvel article en stock";
    const getButtonText = () => {
        if (loading) return "Enregistrement...";
        return existingStockItem ? "Réapprovisionner" : "Créer l'article";
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="p-2">
                <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                <h1 className="text-xl font-semibold text-gray-900">{getTitle()}</h1>
                <p className="text-sm text-gray-500">
                    {existingStockItem 
                    ? `Réapprovisionner "${existingStockItem.name}"` 
                    : "Ajouter un nouveau produit au stock"}
                </p>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
            <CardContent className="p-6 md:p-8">
                {stockItemIdParam && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                    <p className="font-medium text-yellow-800">Stock insuffisant</p>
                    <p className="text-sm text-yellow-700">
                        Le stock de ce produit est insuffisant. Veuillez le réapprovisionner pour continuer.
                    </p>
                    </div>
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Select 
                    value={category} 
                    onChange={(e) => handleCategoryChange(e.target.value as Category)} 
                    required
                    disabled={!!existingStockItem}
                    >
                    <option value="feed">Aliment</option>
                    <option value="vaccine">Vaccin</option>
                    <option value="medication">Médicament</option>
                    <option value="equipment">Équipement</option>
                    <option value="other">Autre</option>
                    </Select>
                </div>

                {category === "feed" && (
                    <div className="space-y-2">
                    <Label>Type d'aliment *</Label>
                    <Select 
                        value={feedSubType} 
                        onChange={(e) => handleFeedSubTypeChange(e.target.value as FeedSubType)} 
                        required
                    >
                        <option value="starter">Démarrage (0-10 jours)</option>
                        <option value="grower">Croissance (11-24 jours)</option>
                        <option value="finisher">Finition (25+ jours)</option>
                    </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Nom du produit *</Label>
                    <Input 
                    value={formData.name} 
                    onChange={(e) => handleChange("name", e.target.value)} 
                    placeholder="Nom du produit"
                    required 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label>Ferme *</Label>
                    {loadingFarms ? (
                        <div className="text-gray-500 text-sm">Chargement...</div>
                    ) : (
                        <Select 
                        value={formData.farmId} 
                        onChange={(e) => handleChange("farmId", e.target.value)} 
                        required
                        >
                        <option value="">Sélectionner une ferme</option>
                        {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                        </Select>
                    )}
                    {farms.length === 0 && !loadingFarms && (
                        <p className="text-xs text-red-500">Aucune ferme accessible</p>
                    )}
                    </div>
                    <div className="space-y-2">
                    <Label>Fournisseur</Label>
                    {loadingSuppliers ? (
                        <div className="text-gray-500 text-sm">Chargement...</div>
                    ) : (
                        <Select value={formData.supplierId} onChange={(e) => handleChange("supplierId", e.target.value)}>
                        <option value="">Sélectionner un fournisseur</option>
                        {suppliers.filter(s => s.active).map(supplier => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                        </Select>
                    )}
                    </div>
                </div>

                {existingStockItem && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Stock actuel: <strong>{existingStockItem.quantity} {existingStockItem.unit}</strong>
                    </p>
                    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={suggestQuantity}>
                        Suggérer quantité
                    </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label>Quantité à ajouter *</Label>
                    <Input 
                        type="number" 
                        value={formData.quantity} 
                        onChange={(e) => handleChange("quantity", parseFloat(e.target.value) || 0)} 
                        required 
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Unité *</Label>
                    <Input 
                        value={formData.unit} 
                        onChange={(e) => handleChange("unit", e.target.value)} 
                        placeholder="kg, l, doses..."
                        required 
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Seuil minimum</Label>
                    <Input 
                        type="number" 
                        value={formData.minThreshold} 
                        onChange={(e) => handleChange("minThreshold", parseFloat(e.target.value) || 0)} 
                    />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label>Prix unitaire (FCFA)</Label>
                    <Input 
                        type="number" 
                        value={formData.unitPrice} 
                        onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)} 
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Date d'expiration</Label>
                    <Input 
                        type="date" 
                        value={formData.expiryDate} 
                        onChange={(e) => handleChange("expiryDate", e.target.value)} 
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Date de réapprovisionnement</Label>
                    <Input 
                    type="date" 
                    value={formData.restockDate} 
                    onChange={(e) => handleChange("restockDate", e.target.value)} 
                    required 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                    value={formData.notes} 
                    onChange={(e) => handleChange("notes", e.target.value)} 
                    rows={3}
                    placeholder="Informations supplémentaires..."
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                    Annuler
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {getButtonText()}
                    </Button>
                </div>
                </form>
            </CardContent>
            </Card>
        </div>
        </div>
    );
    }