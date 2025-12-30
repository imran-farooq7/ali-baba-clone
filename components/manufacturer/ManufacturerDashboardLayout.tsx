// components/manufacturer/ManufacturerDashboardLayout.tsx
"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  Factory,
  Briefcase,
  MessageSquare,
  BarChart,
  FileText,
  Settings,
  Users,
  CheckCircle,
  Award,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutBtn from "../auth/logout-btn";

const navigation = [
  { name: "Dashboard", href: "/manufacturer/dashboard", icon: BarChart },
  { name: "Available Briefs", href: "/manufacturer/briefs", icon: Briefcase },
  { name: "My Proposals", href: "/manufacturer/proposals", icon: FileText },
  { name: "Messages", href: "/manufacturer/messages", icon: MessageSquare },
  {
    name: "Profile & Capabilities",
    href: "/manufacturer/profile",
    icon: Factory,
  },
  { name: "Brands", href: "/manufacturer/brands", icon: Users },
  { name: "Settings", href: "/manufacturer/settings", icon: Settings },
];

export default function ManufacturerDashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64">
          <div className="relative flex w-full max-w-xs flex-col bg-white pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex shrink-0 items-center px-4">
              <div className="h-8 w-8 rounded-lg bg-green-600" />
              <span className="ml-3 text-xl font-bold">ManufacturHub</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Manufacturer
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Verified badge */}
            <div className="mt-6 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.company || "Manufacturer"}
                    </p>
                  </div>
                </div>
                {user?.verified ? (
                  <CheckCircle
                    className="h-5 w-5 text-green-500"
                    values="Verified"
                  />
                ) : (
                  <Award
                    className="h-5 w-5 text-yellow-500"
                    values="Not Verified"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            {/* Logo */}
            <div className="flex shrink-0 items-center px-4">
              <div className="h-8 w-8 rounded-lg bg-green-600" />
              <span className="ml-3 text-xl font-bold">ManufacturHub</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Manufacturer
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Verified badge */}
            <div className="mt-6 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.company || "Manufacturer"}
                    </p>
                  </div>
                </div>
                {user?.verified ? (
                  <CheckCircle
                    className="h-5 w-5 text-green-500"
                    values="Verified"
                  />
                ) : (
                  <Award
                    className="h-5 w-5 text-yellow-500"
                    values="Not Verified"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                placeholder="Search briefs, brands..."
              />
            </div>
          </div>

          {/* Notifications & alerts */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
            <div className="hidden lg:block h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-x-3">
              {user?.verified ? (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Pending Verification
                </span>
              )}
              <div className="text-sm text-right">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-500">Manufacturer</p>
              </div>
              <LogoutBtn />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
