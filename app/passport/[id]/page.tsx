import Link from "next/link";
import { CheckCircle2, FileCheck2, Leaf, LockKeyhole, Recycle, Scale } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let db: D1Database | null = null;
  try {
    const runtime = (await import("cloudflare:workers")).env as unknown as { DB?: D1Database };
    db = runtime?.DB ?? null;
  } catch {
    db = null;
  }
  const lot = db ? await db.prepare(
    `SELECT l.*, c.display_name AS collector_name, r.display_name AS recycler_name,
      r.authorization_id AS recycler_authorization
     FROM lots l
     JOIN profiles c ON c.id = l.collector_id
     LEFT JOIN profiles r ON r.id = l.recycler_id
     WHERE l.passport_id = ?`,
  ).bind(id).first<Record<string, unknown>>() : null;
  const events = db && lot ? await db.prepare(
    "SELECT * FROM passport_events WHERE passport_id = ? ORDER BY created_at ASC",
  ).bind(id).all<Record<string, unknown>>() : { results: [] };

  if (!lot) {
    return <main className="grid min-h-screen place-items-center bg-[#edf1e8] px-5 text-[#17312a]"><section className="max-w-md rounded-[30px] bg-white p-8 text-center shadow-sm"><FileCheck2 className="mx-auto size-12 text-[#6c7b73]" /><h1 className="mt-4 text-2xl font-black">Passport not found</h1><p className="mt-2 text-sm text-[#69776f]">Check the passport reference and try again.</p><Link className="mt-6 inline-flex rounded-xl bg-[#173d30] px-5 py-3 font-bold text-white" href="/">Open KabadiSetu</Link></section></main>;
  }

  const amount = Number(lot.final_weight) * Number(lot.final_rate);
  return <main className="min-h-screen bg-[#edf1e8] px-4 py-8 text-[#17312a] sm:px-6">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#173d30] text-[#e9ff9d]"><Recycle /></span><div><p className="font-black">KabadiSetu</p><p className="text-xs text-[#6a7871]">Public traceability record</p></div></div><span className="rounded-full bg-[#dff2ab] px-3 py-1 text-xs font-black text-[#31530b]">VERIFIED</span></header>
      <section className="mt-6 overflow-hidden rounded-[34px] border border-[#d5ded0] bg-white shadow-sm">
        <div className="bg-[#173d30] p-7 text-white sm:p-9"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e9ff9d]"><FileCheck2 className="size-4" /> Digital Material Passport</div><h1 className="mt-3 break-all text-3xl font-black sm:text-4xl">{String(lot.passport_id)}</h1><p className="mt-2 text-sm text-white/65">A permanent record of the verified e-waste handover.</p></div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <Data label="Material" value={String(lot.material)} /><Data label="Final weight" value={`${lot.final_weight} kg`} />
          <Data label="Collector" value={String(lot.collector_name)} /><Data label="Authorized recycler" value={String(lot.recycler_name ?? "—")} />
          <Data label="Recycler authorization" value={String(lot.recycler_authorization ?? "—")} /><Data label="Settlement" value={`₹${amount.toLocaleString("en-IN")}`} />
          <Data label="FairLock reference" value={String(lot.fairlock_id ?? "Not used")} /><Data label="Handover reference" value={String(lot.handover_code)} />
        </div>
        <div className="border-t border-[#e0e6dc] p-6 sm:p-8"><h2 className="text-xl font-black">Traceability timeline</h2><div className="mt-5 space-y-4">{(events.results ?? []).map((event) => <div key={String(event.id)} className="flex gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#e7f3bb] text-[#31530b]"><CheckCircle2 className="size-4" /></span><div><p className="font-bold">Verified handover recorded</p><p className="mt-1 text-xs text-[#6c7972]">{new Date(String(event.created_at)).toLocaleString("en-IN")}</p></div></div>)}</div></div>
      </section>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><Badge icon={LockKeyhole} text="Price protected" /><Badge icon={Scale} text="Weight confirmed" /><Badge icon={Leaf} text="Formal recycling" /></div>
    </div>
  </main>;
}

function Data({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f2f5ef] p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#74827a]">{label}</p><p className="mt-2 break-words font-black capitalize">{value}</p></div>;
}

function Badge({ icon: Icon, text }: { icon: typeof Leaf; text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm"><Icon className="size-5 text-[#3e6f46]" />{text}</div>;
}
