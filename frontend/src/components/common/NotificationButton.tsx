import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface NotificationButtonProps {
    count?: number;
    onClick?: () => void;
}

export function NotificationButton({
    count = 0,
    onClick,
}: NotificationButtonProps) {

    const navigate = useNavigate();

    const handleClick = () => {
        onClick?.();
        navigate("/alerts");
    };

    return (
        <Button
            variant={count > 0 ? "danger" : "secondary"}
            size="md"
            className="gap-2 relative"
            onClick={handleClick}
        >
            <Bell className="w-4 h-4" />
            Alertes

            {count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {count}
                </span>
            )}
        </Button>
    );
}