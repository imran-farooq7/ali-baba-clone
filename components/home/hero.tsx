// components/home/hero-section.tsx
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-linear-to-r from-blue-100 to-purple-100 px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              AI-Powered B2B Manufacturing Platform
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-gray-900">Connect Brands with</span>
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Manufacturers
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            An intelligent platform that matches brands with verified
            manufacturers. Streamline sourcing, negotiations, and production
            with AI-driven insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register?type=brand"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start as a Brand
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/register?type=manufacturer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-900 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Join as Manufacturer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">
                Verified Manufacturers
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">Match Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24h</div>
              <div className="text-sm text-gray-600">Avg. Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">AI</div>
              <div className="text-sm text-gray-600">Powered Matching</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div className="mt-20 relative">
          <div className="absolute -inset-4 bg-linear-to-r from-blue-500 to-purple-500 rounded-3xl opacity-10 blur-xl" />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side - Dashboard preview */}
                <div className="space-y-6">
                  <div className="h-4 bg-linear-to-r from-blue-500 to-blue-600 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="h-20 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <Shield className="h-6 w-6 text-blue-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">
                        Verified
                      </div>
                    </div>
                    <div className="h-20 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <Zap className="h-6 w-6 text-purple-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">
                        Fast Match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Stats preview */}
                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <span className="text-lg font-bold text-green-600">
                        92%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-11/12 bg-linear-to-r from-green-400 to-green-500" />
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      AI-powered compatibility analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
