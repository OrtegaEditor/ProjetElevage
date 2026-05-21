import React, { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

interface DropdownItem {
id: string;
label: string;
onClick: () => void;
icon?: ReactNode;
}

interface DropdownProps {
trigger: ReactNode;
items: DropdownItem[];
align?: "left" | "right";
className?: string;
}

export function Dropdown({
trigger,
items,
align = "left",
className,
}: DropdownProps) {
const [isOpen, setIsOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

// Fermer le dropdown quand on clique ailleurs
useEffect(() => {
function handleClickOutside(event: MouseEvent) {
    if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node)
    ) {
    setIsOpen(false);
    }
}

document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

const handleItemClick = (callback: () => void) => {
callback();
setIsOpen(false);
};

return (
<div className="relative" ref={dropdownRef}>
    {/* Trigger Button */}
    <button
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
        "flex items-center justify-center transition-all",
        className
    )}
    >
    {trigger}
    </button>

    {/* Dropdown Menu */}
    {isOpen && (
    <div
        className={cn(
        "absolute top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48",
        align === "right" ? "right-0" : "left-0"
        )}
    >
        {items.map((item) => (
        <button
            key={item.id}
            onClick={() => handleItemClick(item.onClick)}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0 flex items-center gap-2 transition-colors"
        >
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
        </button>
        ))}
    </div>
    )}
</div>
);
}