import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/common/badge";
import { Alert } from "@/types/index";
import { Button } from "@/components/common/button";
import { Check, Eye, AlertTriangle, Zap } from "lucide-react";

interface AlertDetailsModalProps {
open: boolean;
onOpenChange: (open: boolean) => void;
alert: Alert | null;
}

// Types d'alertes qui s'auto-régulent (système autorégule automatiquement)
const AUTO_REGULATED_ALERTS = ["temperature", "light"];

// Types d'alertes qui nécessitent une action manuelle (intervention de l'éleveur)
const MANUAL_ACTION_ALERTS = ["ammoniac"];

export function AlertDetailsModal({
open,
onOpenChange,
alert,
}: AlertDetailsModalProps) {
if (!alert) return null;

const isAutoRegulated = AUTO_REGULATED_ALERTS.includes(alert.type);
const requiresManualAction = MANUAL_ACTION_ALERTS.includes(alert.type);

const handleAcknowledge = () => {
console.log("Accusé de réception :", alert.id);
// TODO: Appel API pour marquer comme "acknowledged"
};

const handleResolve = () => {
console.log("Résoudre :", alert.id);
// TODO: Appel API pour résoudre l'alerte
};

const handleSnooze = () => {
console.log("Reporter :", alert.id);
// TODO: Appel API pour reporter l'alerte
};

const handleViewHistory = () => {
console.log("Historique :", alert.id);
// TODO: Naviguer vers l'historique ou ouvrir un drawer
};

const getAlertIcon = () => {
if (isAutoRegulated) return <Zap className="w-4 h-4" />;
if (requiresManualAction) return <AlertTriangle className="w-4 h-4" />;
return null;
};

const getAlertBadgeVariant = (): "success" | "danger" | "warning" | "info" | "default" | "outline" => {
if (alert.status === "resolved_auto" || alert.status === "resolved_manual") return "success";
if (requiresManualAction && alert.status === "active") return "danger";
if (alert.status === "ignored") return "warning";
return "default";
};

return (
<Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
    <DialogHeader>
        <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            {getAlertIcon()}
            <DialogTitle>{alert.title}</DialogTitle>
        </div>
        <Badge variant={getAlertBadgeVariant()}>
            {alert.status === "active" ? "Actif" : 
            alert.status === "resolved_auto" ? "Résolu (Auto)" :
            alert.status === "resolved_manual" ? "Résolu (Manual)" :
            "Ignoré"}
        </Badge>
        </div>
    </DialogHeader>

    <div className="space-y-4">
        {/* Message principal */}
        <div>
        <h4 className="text-sm font-medium mb-1">Message</h4>
        <p className="text-sm text-muted-foreground">{alert.message}</p>
        </div>

        {/* Indication visuelle pour les alertes manuelles */}
        {requiresManualAction && alert.status === "active" && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-md border border-orange-200 dark:border-orange-800">
            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
             <AlertTriangle/>   Action manuelle requise
            </h4>
            <p className="text-sm text-orange-800 dark:text-orange-200">
            Veuillez prendre les mesures nécessaires et cliquez sur "Traiter" une fois terminé.
            </p>
        </div>
        )}

        {/* Infos détaillées */}
        <div className="grid grid-cols-2 gap-4">
        <div>
            <h4 className="text-sm font-medium mb-1">Type</h4>
            <p className="text-sm text-muted-foreground capitalize">
            {alert.type === "temperature" ? "Température" :
                alert.type === "light" ? "Lumière" :
                alert.type === "ammoniac" ? "Ammoniac" : alert.type}
            </p>
        </div>

        <div>
            <h4 className="text-sm font-medium mb-1">Catégorie</h4>
            <p className="text-sm text-muted-foreground">
            {isAutoRegulated ? "Auto-régulée" : "Action manuelle"}
            </p>
        </div>

        <div>
            <h4 className="text-sm font-medium mb-1">Créée le</h4>
            <p className="text-sm text-muted-foreground">
            {new Date(alert.createdAt).toLocaleString("fr-FR")}
            </p>
        </div>

        {alert.resolvedAt && (
            <div>
            <h4 className="text-sm font-medium mb-1">Résolue le</h4>
            <p className="text-sm text-muted-foreground">
                {new Date(alert.resolvedAt).toLocaleString("fr-FR")}
            </p>
            </div>
        )}

        <div>
            <h4 className="text-sm font-medium mb-1">Poulailler</h4>
            <p className="text-sm text-muted-foreground">
            {alert.idPoultryHouse}
            </p>
        </div>
        </div>
    </div>

    {/* Actions conditionnées */}
    <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
        {alert.status === "active" && (
        <>
            {isAutoRegulated ? (
            // Alerte auto-régulée : bouton d'accusé de réception
            <Button
                variant="primary"
                onClick={handleAcknowledge}
            >
                <Eye className="w-4 h-4 mr-2" />
                Accusé de réception
            </Button>
            ) : requiresManualAction ? (
            // Alerte manuelle : bouton de résolution
            <>
                <Button
                variant="primary"
                onClick={handleResolve}
                >
                <Check className="w-4 h-4 mr-2" />
                Traiter
                </Button>

                <Button
                variant="secondary"
                onClick={handleSnooze}
                >
                Reporter
                </Button>
            </>
            ) : null}
        </>
        )}

        <Button
        variant="outline"
        onClick={handleViewHistory}
        >
        Voir historique
        </Button>
    </div>
    </DialogContent>
</Dialog>
);
}