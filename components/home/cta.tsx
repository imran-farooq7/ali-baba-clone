// components/home/cta-section.tsx
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-linear-to-br from-gray-900 to-gray-800 overflow-hidden">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Manufacturing Process?
          </h2>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of brands and manufacturers already streamlining
            their partnerships
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-xl mx-auto">
            {[
              "No hidden fees or commissions",
              "Free manufacturer verification",
              "Secure payment processing",
              "24/7 customer support",
              "AI-powered match guarantees",
              "Contract management tools",
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 text-gray-300"
              >
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?type=brand"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-900 bg-white rounded-xl hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-200 group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-transparent border-2 border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              Schedule a Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-6">
              Trusted by industry leaders
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              <div className="text-xl font-bold text-white/30">TECH CORP</div>
              <div className="text-xl font-bold text-white/30">
                FASHION GROUP
              </div>
              <div className="text-xl font-bold text-white/30">
                INDUSTRIAL CO
              </div>
              <div className="text-xl font-bold text-white/30">
                ELECTRONICS LTD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
