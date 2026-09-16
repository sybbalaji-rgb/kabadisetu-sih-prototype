import React from "react";
import { Recycle, ShieldCheck, UserCircle, LogOut } from "lucide-react";
import { Button } from "./Button";

export function Navbar({ session, onLogout, onRoleSwitch }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce6d8] bg-white/90 backdrop-blur-md px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-[#173d30] text-[#e9ff9d] shadow-sm">
            <Recycle className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#173d30]">
              KabadiSetu
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#698273]">
              SIH26229 – Kabadiwala Connect
            </p>
          </div>
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-[#173d30]">
                {session.displayName}
              </span>
              <span className="text-[10px] font-bold capitalize text-[#577262]">
                {session.role} Workspace
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-1.5"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#597163]">
              Smart India Hackathon 2026
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
