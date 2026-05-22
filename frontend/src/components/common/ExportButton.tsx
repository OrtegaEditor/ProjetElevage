import React from "react";
import { Download } from "lucide-react";
import { Button } from "./button";

interface ExportButtonProps {
onClick?: () => void;
}

export function ExportButton({ onClick }: ExportButtonProps) {
return (
<Button
    variant="secondary"
    size="md"
    className="gap-2"
    onClick={onClick}
>
    <Download className="w-4 h-4" />
    Exporter
</Button>
);
}