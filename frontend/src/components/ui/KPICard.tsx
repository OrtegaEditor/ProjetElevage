import { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "../../../lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function KPICard({ title, value, icon, trend, variant = "default" }: KPICardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-green-600";
    if (trend.value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "danger":
        return "text-red-600 bg-red-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <div className={cn("flex items-center gap-1 mt-2", getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", getIconColor())}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}
