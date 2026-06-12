    // frontend/src/components/forms/RestockingForm.tsx - Version améliorée

    import React, { useState, useEffect } from "react";
    import { Button } from "../common/button";
    import { Input } from "../common/input";
    import { Select } from "../common/select";
    import { Label } from "../ui/label";
    import { Textarea } from "../ui/textarea";
    import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    } from "../ui/dialog";
    import { stockAPI, suppliersAPI, farmsAPI } from "../../services/api";
    import type { StockItem, Supplier, Farm } from "../../types";

    type Category = "feed" | "vaccine" | "medication" | "equipment" | "other";
    type FeedSubType = "starter" | "grower" | "finisher";

    interface RestockingFormProps {
    open: boolean;
    onSave: (data: any) => void;
    onClose: () => void;
    initialStockItem?: StockItem;
    isEditMode?: boolean;
    }

    export function RestockingForm({ open, onSave, onClose, initialStockItem, isEditMode }: RestockingFormProps) {
    const [loading, setLoading] = useState(false);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [category, setCategory] = useState<Category>("feed");
    const [feedSubType, setFeedSubType] = useState<FeedSubType>("starter");

    const [formData, setFormData] = useState({
        name: "",
        farmId: "",
        supplierId: "",
        quantity: 0,
        unit: "",
        minThreshold: 0,
        unitPrice: 0,
        expiryDate: "",
        restockDate: new Date().toISOString().split("T")[0],
        notes: ""
    });

    const fetchFarms = async () => {
        try {
        const data = await farmsAPI.getMyManagedFarms();
        setFarms(data || []);
        if (data && data.length > 0 && !formData.farmId) {
            setFormData(prev => ({ ...prev, farmId: data[0].id }));
        }
        } catch (error) {
        console.error("Erreur chargement fermes:", error);
        }
    };

    const fetchSuppliers = async () => {
        try {
        const data = await suppliersAPI.getAll();
        setSuppliers(data || []);
        } catch (error) {
        console.error("Erreur chargement fournisseurs:", error);
        }
    };

    // Suggérer une quantité basée sur le seuil minimum
    const suggestQuantity = () => {
        if (initialStockItem && initialStockItem.minThreshold) {
        const suggestedQty = initialStockItem.minThreshold * 2;
        setFormData(prev => ({ ...prev, quantity: suggestedQty }));
        }
    };

        useEffect(() => {
        if (open) {
            fetchFarms();
            fetchSuppliers();
            if (initialStockItem) {
            setFormData({
                name: initialStockItem.name,
                farmId: initialStockItem.farmId,
                supplierId: initialStockItem.supplierId || "",
                quantity: initialStockItem.quantity,
                unit: initialStockItem.unit,
                minThreshold: initialStockItem.minThreshold,
                unitPrice: initialStockItem.unitPrice || 0,
                expiryDate: initialStockItem.expiryDate || "",
                restockDate: initialStockItem.lastRestocked?.split("T")[0] || new Date().toISOString().split("T")[0],
                notes: initialStockItem.notes || ""
            });
            setCategory(initialStockItem.category);
            
            if (initialStockItem.category === ("feed" as Category)) {
                const name = initialStockItem.name.toLowerCase();
                if (name.includes("starter") || name.includes("demarrage")) {
                setFeedSubType("starter");
                } else if (name.includes("grower") || name.includes("croissance")) {
                setFeedSubType("grower");
                } else if (name.includes("finisher") || name.includes("finition")) {
                setFeedSubType("finisher");
                }
            }
            } else {
            resetForm();
            }
        }
    }, [open, initialStockItem]);

    const resetForm = () => {
        setFormData({
        name: "",
        farmId: "",
        supplierId: "",
        quantity: 0,
        unit: "",
        minThreshold: 0,
        unitPrice: 0,
        expiryDate: "",
        restockDate: new Date().toISOString().split("T")[0],
        notes: ""
        });
        setCategory("feed");
        setFeedSubType("starter");
    };

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

        if (initialStockItem && isEditMode) return;

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

        let result;
        if (initialStockItem && isEditMode) {
            result = await stockAPI.update(initialStockItem.id, stockData);
        } else if (initialStockItem && !isEditMode) {
            result = await stockAPI.adjustQuantity(initialStockItem.id, formData.quantity, "entry", `Réapprovisionnement - ${category === "feed" ? feedSubType : ""}`);
        } else {
            result = await stockAPI.create(stockData);
        }
        
        onSave(result);
        onClose();
        resetForm();
        } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("Erreur lors de l'enregistrement");
        } finally {
        setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getTitle = () => {
        if (isEditMode) return "Modifier l'article";
        if (initialStockItem && !isEditMode) return "Réapprovisionner";
        return "Nouvel article";
    };

    const getButtonText = () => {
        if (loading) return "Enregistrement...";
        if (isEditMode) return "Mettre à jour";
        if (initialStockItem && !isEditMode) return "Réapprovisionner";
        return "Enregistrer";
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0">
            <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={category} onChange={(e) => handleCategoryChange(e.target.value as Category)} required>
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
                    <Select value={feedSubType} onChange={(e) => handleFeedSubTypeChange(e.target.value as FeedSubType)} required>
                    <option value="starter">Démarrage (0-10 jours)</option>
                    <option value="grower">Croissance (11-24 jours)</option>
                    <option value="finisher">Finition (25+ jours)</option>
                    </Select>
                    <p className="text-xs text-gray-500">
                    {feedSubType === "starter" && "Protéines 22% - pour les poussins de 0 à 10 jours"}
                    {feedSubType === "grower" && "Protéines 19% - pour les poulets de 11 à 24 jours"}
                    {feedSubType === "finisher" && "Protéines 17% - pour les poulets de 25+ jours"}
                    </p>
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
                    <Select 
                    value={formData.farmId} 
                    onChange={(e) => handleChange("farmId", e.target.value)} 
                    required
                    >
                    <option value="">Sélectionner une ferme</option>
                    {farms.map(farm => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Fournisseur</Label>
                    <Select value={formData.supplierId} onChange={(e) => handleChange("supplierId", e.target.value)}>
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.filter(s => s.active).map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                    </Select>
                </div>
                </div>

                {/* Section stock actuel (amélioration) */}
                {initialStockItem && !isEditMode && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                    Stock actuel: <strong>{initialStockItem.quantity} {initialStockItem.unit}</strong>
                    </p>
                    {initialStockItem.minThreshold > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                        Seuil minimum: <strong>{initialStockItem.minThreshold} {initialStockItem.unit}</strong>
                    </p>
                    )}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={suggestQuantity}>
                    Suggérer quantité
                    </Button>
                </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Quantité *</Label>
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
                    rows={2} 
                />
                </div>

                <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                <Button type="submit" disabled={loading}>
                    {getButtonText()}
                </Button>
                </div>
            </form>
            </div>
        </DialogContent>
        </Dialog>
    );
    }