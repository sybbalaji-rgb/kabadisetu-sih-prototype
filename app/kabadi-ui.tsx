"use client";

import { PackageCheck, type LucideIcon } from "lucide-react";
import { LotStatus, statusLabel } from "./kabadi-data";

export function QrProof() {
  const pattern = [
    "11111110101111111", "10000010101000001", "10111010101011101", "10111010001011101",
    "10111010101011101", "10000010001000001", "11111110101111111", "00000000100000000",
    "10110111011011010", "01101000100100110", "11011110111101011", "00000000101010010",
    "11111110110101110", "10000010001110001", "10111010111010110", "10000010100101101", "11111110111011011",
  ];
  return (
    <div className="grid size-28 grid-cols-[repeat(17,1fr)] overflow-hidden rounded-xl border-8 border-white bg-white shadow-sm" aria-label="QR-style handover proof">
      {pattern.join("").split("").map((cell, index) => <span key={index} className={cell === "1" ? "bg-[#173d30]" : "bg-white"} />)}
    </div>
  );
}

export function StatusPill({ status }: { status: LotStatus }) {
  const tone = status === "completed" ? "bg-emerald-100 text-emerald-800" : status === "scheduled" || status === "locked" ? "bg-amber-100 text-amber-900" : status === "offline" ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-800";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{statusLabel[status]}</span>;
}

export function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: LucideIcon; label: string; value: string; detail: string; tone: "lime" | "white" }) {
  return (
    <article className={`rounded-[26px] border p-5 shadow-sm ${tone === "lime" ? "border-[#d2e58a] bg-[#e9ff9d]" : "border-[#d7dfd2] bg-[#f9fbf7]"}`}>
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#647169]">{label}</p><Icon className="size-5 text-[#41614d]" /></div>
      <p className="mt-4 text-2xl font-black tracking-[-0.04em]">{value}</p><p className="mt-1 text-xs text-[#718078]">{detail}</p>
    </article>
  );
}

export function InfoCell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#edf2e9] p-4"><p className="text-xs font-semibold text-[#75837c]">{label}</p><p className="mt-1 font-bold text-[#203c33]">{value}</p></div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#465b51]">{label}</span>{children}</label>;
}

export function ReceiptCell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/50">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[30px] border border-[#d5ded0] bg-[#f9fbf7] p-10 text-center shadow-sm"><PackageCheck className="mx-auto size-12 text-[#597165]" /><h3 className="mt-4 text-2xl font-black">{title}</h3><p className="mt-2 text-sm text-[#68766f]">{text}</p></div>;
}
