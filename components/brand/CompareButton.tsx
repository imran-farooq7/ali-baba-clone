// components/manufacturers/CompareButton.tsx
"use client";

import { BarChart2 } from "lucide-react";

interface CompareButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function CompareButton({
  count,
  onClick,
  disabled = false,
  variant = "default",
  size = "md",
}: CompareButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50",
  };

  // Badge color based on count
  const getBadgeColor = () => {
    if (count === 0) return "bg-gray-300 text-gray-700";
    if (count === 1) return "bg-blue-500 text-white";
    if (count === 2) return "bg-green-500 text-white";
    return "bg-purple-600 text-white";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || count === 0}
      className={`relative inline-flex items-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <BarChart2 className="h-4 w-4" />
      <span>Compare</span>

      {/* Badge showing count */}
      <span
        className={`absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${getBadgeColor()}`}
      >
        {count}
      </span>

      {/* Tooltip for more info */}
      {count > 0 && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {count} manufacturer{count !== 1 ? "s" : ""} selected
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </button>
  );
}
