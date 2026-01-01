// components/layout/footer.tsx
import Link from "next/link";
import { Factory, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Cookies", href: "/cookies" },
    ],
    Resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Partners", href: "/partners" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-purple-600">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Manufactura
                </span>
                <div className="text-sm text-gray-500">
                  B2B Manufacturing Platform
                </div>
              </div>
            </Link>

            <p className="text-gray-600 mb-6 max-w-md">
              Connecting innovative brands with premium manufacturers through
              intelligent matching and seamless collaboration.
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Twitter className="h-5 w-5 text-gray-600" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-gray-600" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Github className="h-5 w-5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Manufactura. All rights reserved.
            </div>

            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <select className="text-sm text-gray-600 bg-transparent border-none focus:outline-none">
                <option>English</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>

              <div className="text-sm text-gray-600">
                Made with <span className="text-red-500">♥</span> for
                manufacturers
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
