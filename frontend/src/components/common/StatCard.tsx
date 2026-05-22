import React, { ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    iconBg?: string;
    valueColor?: string;
    onClick?: () => void;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg = "bg-gray-50",
    valueColor = "text-gray-800",
    onClick,
}: StatCardProps) {
    const Wrapper = onClick ? "button" : "div";

    return (
        <Wrapper
            type={onClick ? "button" : undefined}
            onClick={onClick}
            className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start ${
                onClick
                    ? "cursor-pointer transition-all hover:border-blue-300 hover:shadow-md"
                    : ""
            }`}
        >
            <div className="flex-1">
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <h2 className={`text-3xl font-bold ${valueColor}`}>{value}</h2>
                {subtitle && (
                    <p className="text-gray-400 text-sm mt-2">{subtitle}</p>
                )}
            </div>

            {icon && (
                <div className={`p-3 rounded-lg border border-gray-100 ${iconBg}`}>
                    {icon}
                </div>
            )}
        </Wrapper>
    );
}