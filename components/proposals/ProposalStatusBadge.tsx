// components/proposals/ProposalStatusBadge.tsx
import { ProposalStatus } from "@/app/generated/prisma/enums";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  RefreshCw,
  LucideIcon,
} from "lucide-react";

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    color: "bg-gray-100 text-gray-800",
    iconColor: "text-gray-500",
  },
  SUBMITTED: {
    label: "Submitted",
    icon: Clock,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-500",
  },
  PENDING_REVIEW: {
    label: "Under Review",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-500",
  },
  COUNTERED: {
    label: "Countered",
    icon: RefreshCw,
    color: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-500",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-500",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: XCircle,
    color: "bg-gray-100 text-gray-800",
    iconColor: "text-gray-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-500",
  },
  NEGOTIATION: {
    label: "Negotiation",
    icon: RefreshCw,
    color: "bg-orange-100 text-orange-800",
    iconColor: "text-orange-500",
  },
  EXPIRED: {
    label: "Expired",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-500",
  },
} as const;

export default function ProposalStatusBadge({
  status,
  size = "md",
  showIcon = true,
}: ProposalStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && (
        <Icon className={`${iconSize[size]} mr-1.5 ${config.iconColor}`} />
      )}
      {config.label}
    </span>
  );
}
