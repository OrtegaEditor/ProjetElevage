import React from "react";
import { RotateCw } from "lucide-react";
import { Button } from "./button";

interface RefreshButtonProps {
  onClick?: () => void;
isLoading?: boolean;
}

export function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
return (
<Button
    variant="secondary"
    size="md"
    className="gap-2"
    onClick={onClick}
    disabled={isLoading}
>
    <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
    Actualiser
</Button>
);
}