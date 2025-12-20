// components/brand/BriefStatusBadge.tsx
import { Status } from "@/app/generated/prisma/enums";
import { AlertCircle, CheckCircle, Clock, EyeOff, XCircle } from "lucide-react";

interface BriefStatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: EyeOff,
    color: "bg-gray-100 text-gray-800",
    iconColor: "text-gray-500",
  },
  PUBLISHED: {
    label: "Published",
    icon: Clock,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-500",
  },
  MATCHED: {
    label: "Matched",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-500",
  },
} as const;

export default function BriefStatusBadge({
  status,
  size = "md",
}: BriefStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={`mr-1.5 h-3 w-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
}
