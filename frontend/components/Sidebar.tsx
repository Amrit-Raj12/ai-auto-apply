"use client";

import React from "react";
import { LayoutDashboard, Briefcase, FileCheck, User, Settings, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Job Search", href: "/dashboard" },
  { icon: Briefcase, label: "Applications", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl">
          AJ
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI Jobs</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
