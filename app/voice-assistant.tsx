"use client";

import { useMemo, useState } from "react";
import { AudioLines, Languages, Mic2, Sparkles, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CollectorView, Language, RecyclerView, Role, translations, voiceLocales, voicePromptParts,
} from "./kabadi-data";

type SpeechRecognitionResultLike = { 0: { transcript: string } };
type SpeechRecognitionEventLike = { results: { 0: SpeechRecognitionResultLike } };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
};

type VoiceProps = {
  language: Language;
  role: Role;
  collectorView: CollectorView;
  recyclerView: RecyclerView;
  speak: (text: string) => void;
  onRole: (role: Role) => void;
  onCollectorView: (view: CollectorView) => void;
  onRecyclerView: (view: RecyclerView) => void;
  onBanner: (message: string) => void;
};

const commandKeys = ["home", "create", "matches", "ledger", "safety", "market", "help", "faq"] as const;

export function GlobalVoiceAssistant(props: VoiceProps) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const tr = translations[props.language];
  const currentScreen = props.role === "collector" ? tr[props.collectorView] : tr[props.recyclerView];
  const screenMessage = `${voicePromptParts[props.language].before} ${currentScreen} ${voicePromptParts[props.language].after}`;
  const quickCommands = useMemo(() => props.role === "collector" ? [tr.home, tr.create, tr.matches, tr.ledger, tr.safety, tr.market, tr.help, tr.faq, `${tr.recycler} dashboard`] : [tr.lots, tr.handover, tr.history, `${tr.collector} app`], [props.role, tr]);

  const valuesFor = (key: keyof (typeof translations)[Language]) => Object.values(translations).map((copy) => String(copy[key]).toLocaleLowerCase());
  const hasAny = (text: string, values: string[]) => values.some((value) => text.includes(value));

  const applyCommand = (spoken: string) => {
    const text = spoken.trim().toLocaleLowerCase();
    setTranscript(spoken);

    if (hasAny(text, valuesFor("handover"))) {
      props.onRole("recycler"); props.onRecyclerView("handover"); props.onBanner(`${tr.handover} opened by voice`); return;
    }
    if (hasAny(text, valuesFor("history"))) {
      props.onRole("recycler"); props.onRecyclerView("history"); props.onBanner(`${tr.history} opened by voice`); return;
    }
    if (hasAny(text, valuesFor("lots"))) {
      props.onRole("recycler"); props.onRecyclerView("lots"); props.onBanner(`${tr.lots} opened by voice`); return;
    }

    for (const key of commandKeys) {
      if (hasAny(text, valuesFor(key))) {
        props.onRole("collector"); props.onCollectorView(key); props.onBanner(`${tr[key]} opened by voice`); return;
      }
    }

    const recyclerDashboard = [...valuesFor("recycler").map((value) => `${value} dashboard`), "recycler interface", "recycler dashboard"];
    if (hasAny(text, recyclerDashboard)) {
      props.onRole("recycler"); props.onRecyclerView("lots"); props.onBanner(`${tr.recycler} dashboard opened by voice`); return;
    }
    const collectorApp = [...valuesFor("collector").map((value) => `${value} app`), "collector app"];
    if (hasAny(text, collectorApp)) {
      props.onRole("collector"); props.onCollectorView("home"); props.onBanner(`${tr.collector} app opened by voice`); return;
    }

    props.onBanner(`Command not recognized: “${spoken}”`);
    props.speak(screenMessage);
  };

  const startListening = () => {
    const speechWindow = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      props.onBanner("Voice commands need Chrome or a browser with speech recognition");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = voiceLocales[props.language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setTranscript(""); };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); props.onBanner("Microphone input was not captured. Please try again."); };
    recognition.onresult = (event) => applyCommand(event.results[0][0].transcript);
    recognition.start();
  };

  return (
    <>
      {open && (
        <aside className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[28px] border border-[#cbd5c5] bg-[#f9fbf7] shadow-[0_24px_80px_rgba(23,61,48,0.28)] lg:bottom-6" aria-label="Global voice assistant">
          <div className="bg-[#173d30] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#e9ff9d] text-[#173d30]"><AudioLines className={listening ? "animate-pulse" : ""} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e9ff9d]">KabadiSetu</p><h2 className="font-black">{tr.assistant}</h2></div></div>
              <Button size="icon-sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)} aria-label="Close voice assistant"><X /></Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/75"><Languages className="size-4" /> {voiceLocales[props.language]} • {currentScreen}</div>
          </div>

          <div className="p-5">
            <p className="text-sm leading-6 text-[#607068]">{tr.tapToTalk}. Voice navigation works from every collector and recycler screen.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl border-[#c8d3c2] bg-white" onClick={() => props.speak(screenMessage)}><Volume2 /> {tr.listen}</Button>
              <Button className={`h-12 rounded-xl ${listening ? "bg-[#b23b2b]" : "bg-[#173d30]"}`} onClick={startListening} disabled={listening}><Mic2 /> {listening ? "Listening…" : tr.speakCommand}</Button>
            </div>
            <div className="mt-4 rounded-2xl bg-[#edf2e9] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#617269]"><Sparkles className="size-4" /> Quick commands</div>
              <div className="mt-3 flex flex-wrap gap-2">{quickCommands.map((command) => <Button key={command} size="xs" variant="outline" className="rounded-full border-[#c6d1c0] bg-white" onClick={() => applyCommand(command)}>{command}</Button>)}</div>
            </div>
            <div className="mt-4 min-h-14 rounded-2xl border border-[#d8dfd3] bg-white p-3 text-sm text-[#5e6d65]" aria-live="polite">{listening ? "Listening for your command…" : transcript ? `Heard: “${transcript}”` : "No command yet. Tap the microphone to begin."}</div>
            <p className="mt-3 text-[11px] leading-4 text-[#7a8780]">Available speech voices vary by phone/browser. Microphone activation requires one user tap for privacy.</p>
          </div>
        </aside>
      )}

      <Button size="icon-lg" className={`fixed bottom-24 right-4 z-50 size-14 rounded-full border-4 border-[#edf1e8] shadow-[0_12px_35px_rgba(23,61,48,0.3)] lg:bottom-6 ${listening ? "bg-[#b23b2b]" : "bg-[#173d30]"}`} onClick={() => setOpen((value) => !value)} aria-label="Open voice assistant"><Mic2 className="size-6" /></Button>
    </>
  );
}
