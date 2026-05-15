import React, { ReactNode } from "react";

interface StatCardProps {
title: string;
value: string | number;
icon: ReactNode;
valueColor?: string;
}

const StatCard = ({
title,
value,
icon,
valueColor = "text-gray-800",
}: StatCardProps) => {
return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start">
        <div>
            <p className="text-gray-500 text-sm mb-1">{title}</p>

            <h2 className={`text-3xl font-bold ${valueColor}`}>
                {value}
            </h2>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            {icon}
        </div>
    </div>
);
};

export default StatCard;