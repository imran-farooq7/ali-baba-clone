// components/manufacturers/CertificationCard.tsx
import { Shield, Award, FileCheck, Globe } from "lucide-react";

interface CertificationCardProps {
  certification: string;
  details?: string;
}

export default function CertificationCard({
  certification,
  details,
}: CertificationCardProps) {
  const getCertIcon = (cert: string) => {
    if (cert.includes("ISO")) return Award;
    if (cert.includes("FDA")) return Shield;
    if (cert.includes("CE") || cert.includes("UL")) return FileCheck;
    return Globe;
  };

  const Icon = getCertIcon(certification);
  const isISO = certification.includes("ISO");

  return (
    <div className="p-4 border rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 ${isISO ? "bg-green-100" : "bg-blue-100"} rounded-lg`}
        >
          <Icon
            className={`h-5 w-5 ${isISO ? "text-green-600" : "text-blue-600"}`}
          />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{certification}</h3>
          {details && <p className="text-sm text-gray-600 mt-1">{details}</p>}
          {isISO && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Quality Standard
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
