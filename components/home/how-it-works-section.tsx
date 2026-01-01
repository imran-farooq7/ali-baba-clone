// components/home/how-it-works-section.tsx
import { FileText, Search, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Create Your Brief",
    description:
      "Brands create detailed project briefs with requirements, budget, and timeline.",
    color: "blue",
  },
  {
    step: "02",
    icon: Search,
    title: "AI Match & Discover",
    description:
      "Our AI finds and recommends the most suitable manufacturers for your project.",
    color: "purple",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Connect & Communicate",
    description:
      "Chat directly with manufacturers, share files, and negotiate terms.",
    color: "green",
  },
  {
    step: "04",
    icon: CheckCircle,
    title: "Seal the Partnership",
    description:
      "Review proposals, accept the best match, and start production.",
    color: "orange",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple & Efficient Process
          </h2>
          <p className="text-xl text-gray-600">
            From brief to production in four straightforward steps
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 via-purple-500 to-green-500" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div
                    className={`w-12 h-12 rounded-full bg-linear-to-br ${
                      step.color === "blue"
                        ? "from-blue-500 to-blue-600"
                        : step.color === "purple"
                        ? "from-purple-500 to-purple-600"
                        : step.color === "green"
                        ? "from-green-500 to-green-600"
                        : "from-orange-500 to-orange-600"
                    } flex items-center justify-center`}
                  >
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                </div>

                {/* Step card */}
                <div className="pt-12">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div
                      className={`inline-flex p-4 rounded-xl bg-linear-to-br ${
                        step.color === "blue"
                          ? "from-blue-100 to-blue-200"
                          : step.color === "purple"
                          ? "from-purple-100 to-purple-200"
                          : step.color === "green"
                          ? "from-green-100 to-green-200"
                          : "from-orange-100 to-orange-200"
                      } mb-6`}
                    >
                      <step.icon
                        className={`h-8 w-8 ${
                          step.color === "blue"
                            ? "text-blue-600"
                            : step.color === "purple"
                            ? "text-purple-600"
                            : step.color === "green"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">2.5x</div>
            <div className="text-sm text-gray-600">Faster Matching</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">40%</div>
            <div className="text-sm text-gray-600">Cost Savings</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="text-3xl font-bold text-orange-600">10k+</div>
            <div className="text-sm text-gray-600">Projects Managed</div>
          </div>
        </div>
      </div>
    </section>
  );
}
