import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface DrawerProps {
open: boolean;
onClose: () => void;
title: string;
children: ReactNode;
width?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
sm: "max-w-sm",
md: "max-w-md",
lg: "max-w-lg",
xl: "max-w-xl",
};

export function Drawer({ open, onClose, title, children, width = "md" }: DrawerProps) {
// Empêcher le scroll du body quand le drawer est ouvert
useEffect(() => {
if (open) {
    document.body.style.overflow = "hidden";
} else {
    document.body.style.overflow = "unset";
}
return () => {
    document.body.style.overflow = "unset";
};
}, [open]);

if (!open) return null;

return (
<div className="fixed inset-0 z-50 overflow-hidden">
    {/* Overlay */}
    <div 
    className="absolute inset-0 bg-black/50 transition-opacity"
    onClick={onClose}
    />
    
    {/* Panneau latéral droit */}
    <div className={`absolute right-0 top-0 h-full ${widthClasses[width]} bg-white shadow-xl overflow-y-auto transition-transform`}>
    {/* En-tête */}
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
        <X className="w-5 h-5" />
        </Button>
    </div>
    
    {/* Contenu */}
    <div className="p-6">
        {children}
    </div>
    </div>
</div>
);
}