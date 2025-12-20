import { Briefcase } from "lucide-react";

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-lg mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ManufacturHub</h1>
          <p className="text-gray-600 mt-2">
            Connect Brands with Manufacturers
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
