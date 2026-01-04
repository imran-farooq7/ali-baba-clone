"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  Search,
  User,
  Briefcase,
  MessageSquare,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutBtn from "../auth/logout-btn";
import NotificationBell from "../notifications/NotificationBell";

const navigation = [
  { name: "Dashboard", href: "/brand/dashboard", icon: BarChart },
  { name: "Briefs", href: "/brand/briefs", icon: Briefcase },
  { name: "Manufacturers", href: "/brand/manufacturers", icon: User },
  { name: "Proposals", href: "/brand/proposals", icon: MessageSquare },
  { name: "Messages", href: "/brand/messages", icon: MessageSquare },
];

export default function BrandDashboardLayout({
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
            {/* Close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Brand logo */}
            <div className="flex shrink-0 items-center px-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600" />
              <span className="ml-3 text-xl font-bold">ManufacturHub</span>
            </div>

            {/* Navigation */}
            <div className="mt-5 h-0 flex-1 overflow-y-auto">
              <nav className="space-y-1 px-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? "text-blue-500" : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User profile */}
            <div className="mt-6 px-4">
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
                    {user?.company || "Brand Account"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            {/* Brand logo */}
            <div className="flex shrink-0 items-center px-4">
              <div className="h-8 w-8 rounded-lg bg-blue-600" />
              <span className="ml-3 text-xl font-bold">ManufacturHub</span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 space-y-1 bg-white px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User profile */}
            <div className="mt-6 px-4">
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
                    {user?.company || "Brand Account"}
                  </p>
                </div>
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
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
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
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search manufacturers, briefs..."
              />
            </div>
          </div>

          {/* Notifications & user menu */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <NotificationBell userId={user.id} />{" "}
            <div className="hidden lg:block h-6 w-px bg-gray-200" />
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-500">Brand Account</p>
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
