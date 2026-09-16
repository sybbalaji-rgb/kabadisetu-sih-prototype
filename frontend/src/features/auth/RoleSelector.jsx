import React from "react";
import { User, Truck, ShieldCheck } from "lucide-react";

export function RoleSelector({ role, onSelectRole }) {
  const roles = [
    { id: "collector", label: "Collector", icon: User },
    { id: "recycler", label: "Recycler", icon: Truck },
    { id: "authority", label: "Authority", icon: ShieldCheck },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-1 bg-[#edf3ea] rounded-2xl mb-4">
      {roles.map((r) => {
        const Icon = r.icon;
        const active = role === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className={`flex flex-col items-center py-2 rounded-xl text-xs font-bold transition ${
              active ? "bg-white text-[#173d30] shadow-xs" : "text-[#597163] hover:text-[#173d30]"
            }`}
          >
            <Icon className="size-4 mb-1" />
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
