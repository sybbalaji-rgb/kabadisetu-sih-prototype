import React from "react";
import {
  LayoutDashboard,
  Camera,
  PlusCircle,
  Lock,
  Layers,
  FileText,
  History,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { cn } from "../utils";

export function Sidebar({ role = "collector", activeTab, onTabChange }) {
  const collectorLinks = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "scan", label: "AI Scrap Scanner", icon: Camera },
    { id: "create", label: "Create Lot", icon: PlusCircle },
    { id: "fairlock", label: "FairLock Prices", icon: Lock },
    { id: "cluster", label: "Smart Clusters", icon: Layers },
    { id: "passport", label: "Material Passport", icon: FileText },
    { id: "transactions", label: "Ledger & Earnings", icon: History },
  ];

  const recyclerLinks = [
    { id: "dashboard", label: "Market Lots", icon: LayoutDashboard },
    { id: "cluster", label: "Pickup Clusters", icon: Layers },
    { id: "handover", label: "Verify Handover", icon: FileText },
    { id: "transactions", label: "Settlements", icon: History },
  ];

  const adminLinks = [
    { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
    { id: "recyclers", label: "Recycler Verification", icon: ShieldAlert },
    { id: "prices", label: "Benchmark Rates", icon: Lock },
    { id: "support", label: "Grievances", icon: HelpCircle },
  ];

  const links =
    role === "collector"
      ? collectorLinks
      : role === "recycler"
      ? recyclerLinks
      : adminLinks;

  return (
    <aside className="w-full sm:w-64 shrink-0 rounded-3xl border border-[#d5ded0] bg-white p-4 shadow-sm">
      <div className="mb-3 px-3 py-1">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#698273]">
          Navigation
        </p>
      </div>
      <nav className="flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-visible">
        {links.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap",
                active
                  ? "bg-[#173d30] text-[#e9ff9d] shadow-sm"
                  : "text-[#355342] hover:bg-[#f0f5ee]"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
