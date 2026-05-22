import React, { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../common/card";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { Select } from "../common/select";

import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

import type { Band, StockItem,Supplier } from "../../types";

import { mockFarms,mockSuppliers } from "../../data/mockData";
import { Dialog, DialogContent } from "../ui/dialog";

type Category =
| "flock"
| "feed"
| "vaccine"
| "medication"
| "equipment"
| "other";

interface RestockingFormProps {
    open: boolean;
    onSave: (data: { type: "band" | "stock"; data: Partial<Band> | Partial<StockItem> }) => void;
    onClose: () => void;
    initialStockItem?: StockItem,
}

interface FormDataState {
farmId: string;
name: string;
supplier: string;
quantity: number;
unit: string;
minThreshold: number;
prixUnitaire: number;
especeId: string;
expiryDate: string;
notes: string;
restockDate: string;
}

export function RestockingForm({
open,
onSave,
onClose,
initialStockItem,
}: RestockingFormProps) {
const [category, setCategory] = useState<Category>("feed");

const [formData, setFormData] = useState<FormDataState>({
farmId: "",
name: "",
supplier: "",
quantity: 0,
unit: "",
minThreshold: 0,
prixUnitaire: 0,
especeId: "",
expiryDate: "",
notes: "",
restockDate: new Date().toISOString().split("T")[0],
});

const handleChange = (
field: keyof FormDataState,
value: string | number
) => {
setFormData((prev) => ({
    ...prev,
    [field]: value,
}));
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();

if (category === "flock") {
    const bandData: Partial<Band> = {
    name: formData.name,
    farmId: formData.farmId,
    especeId: formData.especeId,
    quantity: formData.quantity,
    createdDate: formData.restockDate,
    fournisseur: formData.supplier,
    prixUnitaire: formData.prixUnitaire,
    notes: formData.notes,
    status: "active",
    };

    onSave({
    type: "band",
    data: bandData,
    });
} else {
    const stockData: Partial<StockItem> = {
    name: formData.name,
    category,
    quantity: formData.quantity,
    unit: formData.unit,
    minThreshold: formData.minThreshold,
    farmId: formData.farmId,
    lastRestocked: formData.restockDate,
    expiryDate: formData.expiryDate || undefined,
    status: "normal",
    };

    onSave({
    type: "stock",
    data: stockData,
    });
}

onClose();
};

return (
<Dialog open={open} onOpenChange={onClose}>
<DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none shadow-none">
    <Card className="w-full max-w-2xl">
    <CardHeader>
    <CardTitle>
        Nouveau Réapprovisionnement
    </CardTitle>
    </CardHeader>

    <CardContent className="p-6">
    <form
        onSubmit={handleSubmit}
        className="space-y-6"
    >
        {/* TYPE */}
        <div className="space-y-2">
        <Label>
            Type d&apos;approvisionnement *
        </Label>

        <Select
            value={category}
            onChange={(e) =>
            setCategory(e.target.value as Category)
            }
        >
            <option value="flock">
            Lot de volailles (Bande)
            </option>

            <option value="feed">
            Aliment
            </option>

            <option value="vaccine">
            Vaccin
            </option>

            <option value="medication">
            Médicament
            </option>

            <option value="equipment">
            Équipement
            </option>

            <option value="other">
            Autre
            </option>
        </Select>
        </div>

        {/* FERME */}
        <div className="space-y-2">
        <Label>Ferme *</Label>

        <Select
            value={formData.farmId}
            onChange={(e) =>
            handleChange("farmId", e.target.value)
            }
        >
            <option value="">
            Sélectionner une ferme
            </option>

            {mockFarms.map((farm) => (
            <option
                key={farm.id}
                value={farm.id}
            >
                {farm.name}
            </option>
            ))}
        </Select>
        </div>

        {/* DATE */}
        <div className="space-y-2">
        <Label>
            Date du réapprovisionnement *
        </Label>

        <Input
            type="date"
            value={formData.restockDate}
            onChange={(e) =>
            handleChange(
                "restockDate",
                e.target.value
            )
            }
        />
        </div>

        {/* FLOCK */}
        {category === "flock" ? (
        <div className="space-y-4">
            <div className="space-y-2">
            <Label>
                Nom de la Bande *
            </Label>

            <Input
                value={formData.name}
                onChange={(e) =>
                handleChange(
                    "name",
                    e.target.value
                )
                }
                placeholder="Ex: Bande B3 - 2026"
            />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label>
                Espèce *
                </Label>

                <Select
                value={formData.especeId}
                onChange={(e) =>
                    handleChange(
                    "especeId",
                    e.target.value
                    )
                }
                >
                <option value="">
                    Choisir l&apos;espèce
                </option>

                <option value="chicken">
                    Poulet
                </option>

                <option value="duck">
                    Canard
                </option>

                <option value="turkey">
                    Dinde
                </option>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>
                Nombre d&apos;animaux *
                </Label>

                <Input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                    handleChange(
                    "quantity",
                    parseInt(e.target.value) || 0
                    )
                }
                />
            </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Fournisseur */}
                <div className="space-y-2">
                <Label>Fournisseur</Label>

                <Select
                    value={formData.supplier}
                    onChange={(e) =>
                    handleChange("supplier", e.target.value)
                    }
                >
                    <option value="">
                    Choisir un fournisseur
                    </option>

                    {mockSuppliers.map((supplier) => (
                    <option
                        key={supplier.id}
                        value={supplier.id}
                    >
                        {supplier.name}
                    </option>
                    ))}
                </Select>
                </div>

                {/* FERME */}
                <div className="space-y-2">
                <Label>Ferme *</Label>

                <Select
                    value={formData.farmId}
                    onChange={(e) =>
                    handleChange("farmId", e.target.value)
                    }
                >
                    <option value="">
                    Sélectionner une ferme
                    </option>

                    {mockFarms.map((farm) => (
                    <option
                        key={farm.id}
                        value={farm.id}
                    >
                        {farm.name}
                    </option>
                    ))}
                </Select>
                </div>

            <div className="space-y-2">
                <Label>
                Prix unitaire (FCFA)
                </Label>

                    <Input
                    type="number"
                    value={formData.prixUnitaire}
                    onChange={(e) =>
                        handleChange(
                        "prixUnitaire",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>
                </div>
            </div>
            ) : (
            /* STOCK */
            <div className="space-y-4">
                <div className="space-y-2">
                <Label>
                    Nom du produit *
                </Label>

                <Input
                    value={formData.name}
                    onChange={(e) =>
                    handleChange(
                        "name",
                        e.target.value
                    )
                    }
                />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label>
                    Quantité *
                    </Label>

                    <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                        handleChange(
                        "quantity",
                        parseInt(e.target.value) || 0
                        )
                    }
                    />
                </div>

                <div className="space-y-2">
                    <Label>
                    Unité *
                    </Label>

                    <Input
                    value={formData.unit}
                    onChange={(e) =>
                        handleChange(
                        "unit",
                        e.target.value
                        )
                    }
                    />
                </div>

                <div className="space-y-2">
                    <Label>
                    Seuil minimum
                    </Label>

                    <Input
                    type="number"
                    value={formData.minThreshold}
                    onChange={(e) =>
                        handleChange(
                        "minThreshold",
                        parseInt(e.target.value) || 0
                        )
                    }
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Fournisseur */}
                    <div className="space-y-2">
                    <Label>Fournisseur</Label>

                    <Select
                        value={formData.supplier}
                        onChange={(e) =>
                        handleChange("supplier", e.target.value)
                        }
                    >
                        <option value="">
                        Choisir un fournisseur
                        </option>

                        {mockSuppliers.map((supplier) => (
                        <option
                            key={supplier.id}
                            value={supplier.id}
                        >
                            {supplier.name}
                        </option>
                        ))}
                    </Select>
                    </div>

                {(category === "vaccine" ||
                    category === "medication") && (
                    <div className="space-y-2">
                    <Label>
                        Date d&apos;expiration
                    </Label>

                    <Input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) =>
                        handleChange(
                            "expiryDate",
                            e.target.value
                        )
                        }
                    />
                    </div>
                )}
                </div>
            </div>
            )}

            {/* NOTES */}
            <div className="space-y-2">
            <Label>
                Notes
            </Label>

            <Textarea
                value={formData.notes}
                onChange={(e) =>
                handleChange(
                    "notes",
                    e.target.value
                )
                }
            />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
            <Button
                type="button"
                variant="outline"
                onClick={onClose}
            >
                Annuler
            </Button>

            <Button type="submit">
                Enregistrer le réapprovisionnement
            </Button>
            </div>
        </form>
        </CardContent>
    </Card>
</DialogContent>
</Dialog>
);
}