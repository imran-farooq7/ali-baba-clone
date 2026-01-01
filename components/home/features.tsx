// components/home/features-section.tsx
import {
  Brain,
  MessageSquare,
  Filter,
  BarChart,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Intelligent algorithms match brands with the most suitable manufacturers based on requirements, capabilities, and historical performance.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Filter,
    title: "Smart Discovery",
    description:
      "Advanced filtering and search capabilities to find manufacturers by category, location, capacity, and certifications.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description:
      "Built-in messaging system with file sharing for seamless communication between brands and manufacturers.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description:
      "Comprehensive analytics for tracking brief performance, proposal success rates, and business insights.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Verified Network",
    description:
      "All manufacturers are thoroughly verified for capabilities, certifications, and business legitimacy.",
    gradient: "from-red-500 to-red-600",
  },
  {
    icon: Zap,
    title: "Fast Onboarding",
    description:
      "Quick setup process for both brands and manufacturers to start using the platform immediately.",
    gradient: "from-pink-500 to-pink-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600">
            Streamline your manufacturing partnerships with our comprehensive
            suite of tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-transparent hover:shadow-2xl transition-all duration-300"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-white to-gray-50 rounded-2xl group-hover:opacity-0 transition-opacity duration-300" />
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div className="relative mb-6">
                <div
                  className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.gradient}`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 relative">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed relative">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="absolute bottom-8 left-8 right-8 h-0.5 bg-linear-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-500 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
