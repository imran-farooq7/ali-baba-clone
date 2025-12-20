// components/dashboard/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: string | number;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    text: "text-green-700",
    border: "border-green-200",
  },
  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
    text: "text-red-700",
    border: "border-red-200",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-600",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  gray: {
    bg: "bg-gray-50",
    icon: "text-gray-600",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

export default function StatsCard({
  title,
  value,
  color = "blue",
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
