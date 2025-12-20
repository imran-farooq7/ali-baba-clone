// components/manufacturer/ManufacturerStatsCard.tsx
import { LucideIcon } from "lucide-react";

interface ManufacturerStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "green" | "blue" | "purple" | "orange" | "gray";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
}

export default function ManufacturerStatsCard({
  title,
  value,
  icon: Icon,
  color = "green",
  trend,
  subtitle,
  onClick,
}: ManufacturerStatsCardProps) {
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-700",
      border: "border-green-200",
      hover: "hover:bg-green-100",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:bg-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:bg-purple-100",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:bg-orange-100",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "text-gray-600",
      text: "text-gray-700",
      border: "border-gray-200",
      hover: "hover:bg-gray-100",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`${colors.bg} ${
        colors.border
      } border rounded-lg p-6 transition-all duration-200 ${
        onClick ? "cursor-pointer " + colors.hover : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
