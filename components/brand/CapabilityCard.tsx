// components/manufacturers/CapabilityCard.tsx
import { CheckCircle, Zap, ToolCase, Settings } from "lucide-react";

interface CapabilityCardProps {
  capability: string;
  description?: string;
}

export default function CapabilityCard({
  capability,
  description,
}: CapabilityCardProps) {
  const getCapabilityIcon = (cap: string) => {
    if (cap.toLowerCase().includes("production")) return Settings;
    if (cap.toLowerCase().includes("assembly")) return ToolCase;
    if (cap.toLowerCase().includes("automation")) return Zap;
    return CheckCircle;
  };

  const Icon = getCapabilityIcon(capability);

  return (
    <div className="p-4 border rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{capability}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
