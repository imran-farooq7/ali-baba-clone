// components/layout/header.tsx
import Link from "next/link";
import { Factory, Sparkles } from "lucide-react";
import { AuthButtons } from "@/components/auth/auth-buttons";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manufactura
              </span>
              <span className="text-xs text-gray-500">B2B Platform</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 rounded-lg bg-blue-50 px-3 py-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                AI-Powered Matching
              </span>
            </div>
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}
