interface StatCardProps {
title: string;
value: string;
icon?: React.ReactNode;
iconBg?: string;
valueColor?: string;
}

export function StatCard({ title, value, icon, iconBg, valueColor = "text-slate-800" }: StatCardProps) {
return (
<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
    <div>
    <p className="text-slate-500 text-sm mb-1">{title}</p>
    <h3 className={`text-2xl font-bold ${valueColor}`}>{value}</h3>
    </div>
    {icon && <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>}
</div>
);
}