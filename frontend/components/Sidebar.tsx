"use client";

import React from "react";
import { LayoutDashboard, Briefcase, FileCheck, User, Settings, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useTheme } from "@/lib/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Job Search", href: "/dashboard/search" },
  { icon: Briefcase, label: "Applications", href: "/dashboard/applications" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-white/40 dark:bg-slate-950/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-3xl h-[calc(100vh-48px)] flex flex-col fixed left-4 md:left-8 top-6 z-50 transition-all duration-500 shadow-[0_20px_60px_rgba(30,58,138,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden hover:shadow-[0_20px_70px_rgba(30,58,138,0.25)]">
      {/* Sparkle subtle overlay inside sidebar */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none" />

      <div className="p-6 pb-4 flex items-center space-x-3 transition-colors duration-500 relative z-10">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-600/30"
        >
          AJ
        </motion.div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">AI Jobs</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4 px-3" suppressHydrationWarning>
        <LayoutGroup>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center space-x-3 px-4 py-3.5 mt-1 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive
                    ? "text-blue-700 dark:text-blue-100 font-semibold shadow-inner"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/60 dark:bg-white/10 rounded-2xl border border-white/80 dark:border-white/20 z-0 backdrop-blur-md shadow-[0_10px_30px_rgba(30,58,138,0.15)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}

                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-blue-600 dark:text-blue-300" : "text-slate-400 group-hover:text-blue-500"}`} />
                <span className="relative z-10 text-[13px] tracking-wide font-medium">{item.label}</span>
              </Link>
            );
          })}
        </LayoutGroup>
      </nav>

      <div className="p-4 mt-auto flex flex-col space-y-2 relative z-10">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px] text-indigo-500" />}
            <span className="font-medium text-[13px] tracking-wide">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-300 transition-all duration-200 group relative z-10">
          <LogOut className="w-[18px] h-[18px] transition-colors group-hover:text-red-500 dark:group-hover:text-red-300" />
          <span className="font-medium text-[13px] tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
