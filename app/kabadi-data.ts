import { ChartCandlestick, CircleHelp, Handshake, Home, LifeBuoy, Plus, ShieldAlert, WalletCards } from "lucide-react";

export type Role = "collector" | "recycler" | "authority";
export type CollectorView = "home" | "create" | "matches" | "ledger" | "safety" | "market" | "help" | "faq";
export type RecyclerView = "lots" | "handover" | "history";
export type Language = "en" | "ta" | "hi" | "ml" | "te" | "kn" | "mr" | "bn" | "gu" | "pa" | "or" | "ur" | "as";
export type MaterialKey = "cables" | "batteries" | "pcb" | "panels" | "motors" | "plastics";
export type LotStatus = "available" | "offline" | "locked" | "scheduled" | "completed";

export type Lot = {
  id: string;
  collectorId?: string;
  material: MaterialKey;
  weight: number;
  condition: string;
  location: string;
  createdAt: string;
  estimatedMin: number;
  estimatedMax: number;
  status: LotStatus;
  syncStatus: "synced" | "pending";
  imageName: string;
  imageKey?: string;
  aiConfidence: number;
  clusterJoined?: boolean;
  clusterId?: string;
  selectedRecyclerId?: string;
  lockedRate?: number;
  fairLockId?: string;
  validUntil?: string;
  pickupDate?: string;
  finalWeight?: number;
  finalRate?: number;
  paymentStatus?: "paid" | "pending" | "partial";
  handoverCode?: string;
  passportId?: string;
  completedAt?: string;
  priceChangeReason?: string;
  recyclerRating?: number;
  recyclerReview?: string;
};

export const materials: Record<MaterialKey, { label: string; range: [number, number]; icon: string; safety: string }> = {
  cables: { label: "Copper cables", range: [78, 96], icon: "〰", safety: "Do not burn insulation to recover metal." },
  batteries: { label: "Batteries", range: [42, 60], icon: "▰", safety: "Keep damaged batteries isolated and dry." },
  pcb: { label: "Circuit boards (PCB)", range: [210, 285], icon: "▦", safety: "Avoid breaking or heating circuit boards." },
  panels: { label: "LCD / CRT panels", range: [24, 44], icon: "▣", safety: "Handle glass panels with gloves." },
  motors: { label: "Motors & magnets", range: [58, 82], icon: "◉", safety: "Do not dismantle sealed motors without tools." },
  plastics: { label: "Mixed e-plastics", range: [12, 24], icon: "⬡", safety: "Sort plastics separately; never burn them." },
};

export const recyclerDirectory = [
  { id: "greenloop", name: "GreenLoop E-Waste", distance: 4.2, rateOffset: 4, pickup: true, minimum: 5, transport: 0, verifiedTill: "31 Mar 2027", badge: "Best net earning", rating: 4.8, reviews: 126 },
  { id: "ecocycle", name: "EcoCycle Reprocessors", distance: 8.7, rateOffset: 7, pickup: true, minimum: 12, transport: 0, verifiedTill: "18 Jan 2027", badge: "Highest rate", rating: 4.5, reviews: 84 },
  { id: "urbanmine", name: "UrbanMine Recycler", distance: 13.4, rateOffset: 2, pickup: false, minimum: 3, transport: 54, verifiedTill: "30 Nov 2026", badge: "Accepts small lots", rating: 4.2, reviews: 51 },
];

export const translations = {
  en: { home: "Home", create: "Create lot", matches: "Matches", ledger: "Earnings", safety: "Safety", market: "Live Prices", help: "Help", faq: "FAQ", welcome: "Good morning, Ravi", subtitle: "Turn today’s collection into a verified, better-value handover.", newLot: "Create new lot", earnings: "Total earnings", pending: "Pending payment", pickup: "Next pickup", assistant: "Voice assistant", listen: "Listen to this screen", speakCommand: "Speak a command", tapToTalk: "Tap the mic and speak", collector: "Collector", recycler: "Recycler", lots: "Lots", handover: "Handover", history: "History" },
  hi: { home: "होम", create: "लॉट बनाएँ", matches: "रीसायकलर", ledger: "कमाई", safety: "सुरक्षा", market: "लाइव कीमतें", help: "सहायता", faq: "सामान्य प्रश्न", welcome: "नमस्ते, रवि", subtitle: "आज के कबाड़ को सुरक्षित और बेहतर मूल्य पर बेचें।", newLot: "नया लॉट बनाएँ", earnings: "कुल कमाई", pending: "बाकी भुगतान", pickup: "अगला पिकअप", assistant: "वॉइस सहायक", listen: "इस स्क्रीन को सुनें", speakCommand: "आदेश बोलें", tapToTalk: "माइक दबाकर बोलें", collector: "कलेक्टर", recycler: "रीसायकलर", lots: "लॉट", handover: "हैंडओवर", history: "इतिहास" },
  mr: { home: "मुख्यपृष्ठ", create: "लॉट तयार करा", matches: "रीसायकलर", ledger: "कमाई", safety: "सुरक्षा", market: "थेट किंमती", help: "मदत", faq: "सामान्य प्रश्न", welcome: "नमस्कार, रवी", subtitle: "आजचा माल सुरक्षितपणे आणि योग्य मूल्यात द्या.", newLot: "नवीन लॉट", earnings: "एकूण कमाई", pending: "प्रलंबित रक्कम", pickup: "पुढील पिकअप", assistant: "आवाज सहाय्यक", listen: "ही स्क्रीन ऐका", speakCommand: "आदेश बोला", tapToTalk: "बोलण्यासाठी माइक दाबा", collector: "संकलक", recycler: "रीसायकलर", lots: "लॉट", handover: "हस्तांतरण", history: "इतिहास" },
  ta: { home: "முகப்பு", create: "லாட் உருவாக்கு", matches: "மறுசுழற்சியாளர்", ledger: "வருமானம்", safety: "பாதுகாப்பு", market: "நேரடி விலைகள்", help: "உதவி", faq: "அடிக்கடி கேள்விகள்", welcome: "வணக்கம், ரவி", subtitle: "இன்றைய சேகரிப்பை பாதுகாப்பாக நல்ல மதிப்பில் ஒப்படையுங்கள்.", newLot: "புதிய லாட்", earnings: "மொத்த வருமானம்", pending: "நிலுவைத் தொகை", pickup: "அடுத்த பிக்கப்", assistant: "குரல் உதவியாளர்", listen: "இந்தத் திரையைக் கேளுங்கள்", speakCommand: "கட்டளையைச் சொல்லுங்கள்", tapToTalk: "பேச மைக்கை அழுத்துங்கள்", collector: "சேகரிப்பாளர்", recycler: "மறுசுழற்சியாளர்", lots: "லாட்கள்", handover: "ஒப்படைப்பு", history: "வரலாறு" },
  te: { home: "హోమ్", create: "లాట్ సృష్టించండి", matches: "రీసైక్లర్లు", ledger: "ఆదాయం", safety: "భద్రత", market: "ప్రత్యక్ష ధరలు", help: "సహాయం", faq: "తరచు ప్రశ్నలు", welcome: "నమస్కారం, రవి", subtitle: "నేటి సేకరణను ధృవీకరించిన మెరుగైన విలువ గల అప్పగింతగా మార్చండి.", newLot: "కొత్త లాట్", earnings: "మొత్తం ఆదాయం", pending: "పెండింగ్ చెల్లింపు", pickup: "తదుపరి పికప్", assistant: "వాయిస్ సహాయకుడు", listen: "ఈ స్క్రీన్ వినండి", speakCommand: "కమాండ్ చెప్పండి", tapToTalk: "మాట్లాడటానికి మైక్ నొక్కండి", collector: "సేకరణకర్త", recycler: "రీసైక్లర్", lots: "లాట్లు", handover: "అప్పగింత", history: "చరిత్ర" },
  kn: { home: "ಮುಖಪುಟ", create: "ಲಾಟ್ ರಚಿಸಿ", matches: "ಮರುಬಳಕೆದಾರರು", ledger: "ಆದಾಯ", safety: "ಸುರಕ್ಷತೆ", market: "ನೇರ ಬೆಲೆಗಳು", help: "ಸಹಾಯ", faq: "ಪದೇ ಪ್ರಶ್ನೆಗಳು", welcome: "ನಮಸ್ಕಾರ, ರವಿ", subtitle: "ಇಂದಿನ ಸಂಗ್ರಹವನ್ನು ಸುರಕ್ಷಿತ ಮತ್ತು ಉತ್ತಮ ಮೌಲ್ಯದ ಹಸ್ತಾಂತರವನ್ನಾಗಿ ಮಾಡಿ.", newLot: "ಹೊಸ ಲಾಟ್", earnings: "ಒಟ್ಟು ಆದಾಯ", pending: "ಬಾಕಿ ಪಾವತಿ", pickup: "ಮುಂದಿನ ಪಿಕಪ್", assistant: "ಧ್ವನಿ ಸಹಾಯಕ", listen: "ಈ ಪರದೆಯನ್ನು ಕೇಳಿ", speakCommand: "ಆದೇಶ ಹೇಳಿ", tapToTalk: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ", collector: "ಸಂಗ್ರಾಹಕ", recycler: "ಮರುಬಳಕೆದಾರ", lots: "ಲಾಟ್‌ಗಳು", handover: "ಹಸ್ತಾಂತರ", history: "ಇತಿಹಾಸ" },
  ml: { home: "ഹോം", create: "ലോട്ട് സൃഷ്ടിക്കുക", matches: "റീസൈക്ലർമാർ", ledger: "വരുമാനം", safety: "സുരക്ഷ", market: "തത്സമയ വിലകൾ", help: "സഹായം", faq: "പതിവ് ചോദ്യങ്ങൾ", welcome: "നമസ്കാരം, രവി", subtitle: "ഇന്നത്തെ ശേഖരം സുരക്ഷിതവും മികച്ച മൂല്യമുള്ള കൈമാറ്റമാക്കുക.", newLot: "പുതിയ ലോട്ട്", earnings: "ആകെ വരുമാനം", pending: "കുടിശ്ശിക", pickup: "അടുത്ത പിക്കപ്പ്", assistant: "ശബ്ദ സഹായി", listen: "ഈ സ്ക്രീൻ കേൾക്കുക", speakCommand: "കമാൻഡ് പറയുക", tapToTalk: "സംസാരിക്കാൻ മൈക്ക് അമർത്തുക", collector: "ശേഖരകൻ", recycler: "റീസൈക്ലർ", lots: "ലോട്ടുകൾ", handover: "കൈമാറ്റം", history: "ചരിത്രം" },
  bn: { home: "হোম", create: "লট তৈরি করুন", matches: "রিসাইক্লার", ledger: "আয়", safety: "নিরাপত্তা", market: "লাইভ মূল্য", help: "সহায়তা", faq: "সাধারণ প্রশ্ন", welcome: "নমস্কার, রবি", subtitle: "আজকের সংগ্রহকে নিরাপদ ও ভালো মূল্যের হস্তান্তরে পরিণত করুন।", newLot: "নতুন লট", earnings: "মোট আয়", pending: "বকেয়া পেমেন্ট", pickup: "পরবর্তী পিকআপ", assistant: "ভয়েস সহায়ক", listen: "এই স্ক্রিন শুনুন", speakCommand: "কমান্ড বলুন", tapToTalk: "কথা বলতে মাইকে চাপুন", collector: "সংগ্রাহক", recycler: "রিসাইক্লার", lots: "লটসমূহ", handover: "হস্তান্তর", history: "ইতিহাস" },
  gu: { home: "હોમ", create: "લોટ બનાવો", matches: "રિસાયકલર", ledger: "આવક", safety: "સુરક્ષા", market: "લાઇવ કિંમતો", help: "મદદ", faq: "વારંવાર પ્રશ્નો", welcome: "નમસ્તે, રવિ", subtitle: "આજના સંગ્રહને સુરક્ષિત અને વધુ મૂલ્યવાળી સોંપણી બનાવો.", newLot: "નવો લોટ", earnings: "કુલ આવક", pending: "બાકી ચુકવણી", pickup: "આગામી પિકઅપ", assistant: "અવાજ સહાયક", listen: "આ સ્ક્રીન સાંભળો", speakCommand: "આદેશ બોલો", tapToTalk: "બોલવા માઇક દબાવો", collector: "સંગ્રાહક", recycler: "રિસાયકલર", lots: "લોટ્સ", handover: "સોંપણી", history: "ઇતિહાસ" },
  pa: { home: "ਹੋਮ", create: "ਲਾਟ ਬਣਾਓ", matches: "ਰੀਸਾਈਕਲਰ", ledger: "ਕਮਾਈ", safety: "ਸੁਰੱਖਿਆ", market: "ਲਾਈਵ ਕੀਮਤਾਂ", help: "ਮਦਦ", faq: "ਅਕਸਰ ਸਵਾਲ", welcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਰਵੀ", subtitle: "ਅੱਜ ਦੇ ਸੰਗ੍ਰਹਿ ਨੂੰ ਸੁਰੱਖਿਅਤ ਅਤੇ ਵਧੀਆ ਮੁੱਲ ਵਾਲੀ ਹਵਾਲਗੀ ਬਣਾਓ।", newLot: "ਨਵੀਂ ਲਾਟ", earnings: "ਕੁੱਲ ਕਮਾਈ", pending: "ਬਾਕੀ ਭੁਗਤਾਨ", pickup: "ਅਗਲਾ ਪਿਕਅਪ", assistant: "ਵੌਇਸ ਸਹਾਇਕ", listen: "ਇਹ ਸਕ੍ਰੀਨ ਸੁਣੋ", speakCommand: "ਕਮਾਂਡ ਬੋਲੋ", tapToTalk: "ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ", collector: "ਸੰਗ੍ਰਹਿਕ", recycler: "ਰੀਸਾਈਕਲਰ", lots: "ਲਾਟ", handover: "ਹਵਾਲਗੀ", history: "ਇਤਿਹਾਸ" },
  or: { home: "ହୋମ୍", create: "ଲଟ୍ ତିଆରି କରନ୍ତୁ", matches: "ରିସାଇକ୍ଲର୍", ledger: "ଆୟ", safety: "ସୁରକ୍ଷା", market: "ସିଧା ମୂଲ୍ୟ", help: "ସହାୟତା", faq: "ସାଧାରଣ ପ୍ରଶ୍ନ", welcome: "ନମସ୍କାର, ରବି", subtitle: "ଆଜିର ସଂଗ୍ରହକୁ ସୁରକ୍ଷିତ ଏବଂ ଭଲ ମୂଲ୍ୟର ହସ୍ତାନ୍ତରରେ ପରିଣତ କରନ୍ତୁ।", newLot: "ନୂଆ ଲଟ୍", earnings: "ମୋଟ ଆୟ", pending: "ବକେୟା ଦେୟ", pickup: "ପରବର୍ତ୍ତୀ ପିକଅପ୍", assistant: "ଭଏସ୍ ସହାୟକ", listen: "ଏହି ସ୍କ୍ରିନ୍ ଶୁଣନ୍ତୁ", speakCommand: "କମାଣ୍ଡ କହନ୍ତୁ", tapToTalk: "କହିବାକୁ ମାଇକ୍ ଦବାନ୍ତୁ", collector: "ସଂଗ୍ରାହକ", recycler: "ରିସାଇକ୍ଲର୍", lots: "ଲଟ୍", handover: "ହସ୍ତାନ୍ତର", history: "ଇତିହାସ" },
  as: { home: "হোম", create: "লট তৈয়াৰ কৰক", matches: "পুনঃচক্ৰীকৰণকাৰী", ledger: "উপাৰ্জন", safety: "সুৰক্ষা", market: "সজীৱ মূল্য", help: "সহায়", faq: "সঘনাই প্ৰশ্ন", welcome: "নমস্কাৰ, ৰবি", subtitle: "আজিৰ সংগ্ৰহক সুৰক্ষিত আৰু উন্নত মূল্যৰ হস্তান্তৰলৈ ৰূপান্তৰ কৰক।", newLot: "নতুন লট", earnings: "মুঠ উপাৰ্জন", pending: "বাকী পৰিশোধ", pickup: "পৰৱৰ্তী পিকআপ", assistant: "কণ্ঠ সহায়ক", listen: "এই স্ক্ৰীন শুনক", speakCommand: "আদেশ কওক", tapToTalk: "কথা ক’বলৈ মাইক টিপক", collector: "সংগ্ৰাহক", recycler: "পুনঃচক্ৰীকৰণকাৰী", lots: "লটসমূহ", handover: "হস্তান্তৰ", history: "ইতিহাস" },
  ur: { home: "ہوم", create: "نیا لاٹ بنائیں", matches: "ری سائیکلر", ledger: "آمدنی", safety: "حفاظت", market: "لائیو قیمتیں", help: "مدد", faq: "عام سوالات", welcome: "خوش آمدید، روی", subtitle: "آج کے اسکریپ کو محفوظ اور بہتر قیمت پر بیچیں۔", newLot: "نیا لاٹ", earnings: "کل آمدنی", pending: "باقی ادائیگی", pickup: "اگلا پک اپ", assistant: "وائس اسسٹنٹ", listen: "یہ اسکرین سنیں", speakCommand: "کمانڈ بولیں", tapToTalk: "بولنے کے لیے مائیک دبائیں", collector: "کلکٹر", recycler: "ری سائیکلر", lots: "لاٹس", handover: "حوالگی", history: "تاریخ" },
};

export const voiceLocales: Record<Language, string> = {
  en: "en-IN", ta: "ta-IN", hi: "hi-IN", ml: "ml-IN", te: "te-IN", kn: "kn-IN",
  mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN", or: "or-IN", ur: "ur-IN", as: "as-IN",
};

export const voicePromptParts: Record<Language, { before: string; after: string }> = {
  en: { before: "You are on the", after: "screen. Say a navigation command, or tap listen to hear the screen guidance." },
  hi: { before: "आप", after: "स्क्रीन पर हैं। आगे जाने के लिए कोई आदेश बोलें या स्क्रीन मार्गदर्शन सुनें।" },
  mr: { before: "तुम्ही", after: "स्क्रीनवर आहात. पुढे जाण्यासाठी आदेश बोला किंवा स्क्रीन मार्गदर्शन ऐका." },
  ta: { before: "நீங்கள்", after: "திரையில் உள்ளீர்கள். செல்ல வேண்டிய பகுதியின் கட்டளையைச் சொல்லுங்கள் அல்லது வழிகாட்டுதலைக் கேளுங்கள்." },
  te: { before: "మీరు", after: "స్క్రీన్‌లో ఉన్నారు. ముందుకు వెళ్లడానికి కమాండ్ చెప్పండి లేదా స్క్రీన్ మార్గదర్శకాన్ని వినండి." },
  kn: { before: "ನೀವು", after: "ಪರದೆಯಲ್ಲಿದ್ದೀರಿ. ಮುಂದುವರಿಯಲು ಆದೇಶ ಹೇಳಿ ಅಥವಾ ಪರದೆ ಮಾರ್ಗದರ್ಶನವನ್ನು ಕೇಳಿ." },
  ml: { before: "നിങ്ങൾ", after: "സ്ക്രീനിലാണ്. മുന്നോട്ട് പോകാൻ കമാൻഡ് പറയുക അല്ലെങ്കിൽ സ്ക്രീൻ മാർഗനിർദേശം കേൾക്കുക." },
  bn: { before: "আপনি", after: "স্ক্রিনে আছেন। যেতে একটি কমান্ড বলুন অথবা স্ক্রিন নির্দেশনা শুনুন।" },
  gu: { before: "તમે", after: "સ્ક્રીન પર છો. આગળ જવા આદેશ બોલો અથવા સ્ક્રીન માર્ગદર્શન સાંભળો." },
  pa: { before: "ਤੁਸੀਂ", after: "ਸਕ੍ਰੀਨ ਉੱਤੇ ਹੋ। ਅੱਗੇ ਜਾਣ ਲਈ ਕਮਾਂਡ ਬੋਲੋ ਜਾਂ ਸਕ੍ਰੀਨ ਮਾਰਗਦਰਸ਼ਨ ਸੁਣੋ।" },
  or: { before: "ଆପଣ", after: "ସ୍କ୍ରିନ୍‌ରେ ଅଛନ୍ତି। ଆଗକୁ ଯିବାକୁ କମାଣ୍ଡ କହନ୍ତୁ କିମ୍ବା ସ୍କ୍ରିନ୍ ମାର୍ଗଦର୍ଶନ ଶୁଣନ୍ତୁ।" },
  as: { before: "আপুনি", after: "স্ক্ৰীনত আছে। আগবাঢ়িবলৈ আদেশ কওক বা স্ক্ৰীন নিৰ্দেশনা শুনক।" },
  ur: { before: "آپ", after: "اسکرین پر ہیں۔ آگے جانے کے لیے کمانڈ بولیں یا اسکرین کی رہنمائی سنیں۔" },
};

export const seedLots: Lot[] = [
  {
    id: "LOT-2214", material: "cables", weight: 8, condition: "Sorted", location: "Pimpri, Pune",
    createdAt: "2026-08-26T09:30:00.000Z", estimatedMin: 624, estimatedMax: 768, status: "completed",
    syncStatus: "synced", imageName: "cable-lot.jpg", aiConfidence: 91, selectedRecyclerId: "greenloop",
    lockedRate: 92, fairLockId: "FL-7421", finalWeight: 8.1, finalRate: 92, paymentStatus: "paid",
    handoverCode: "KBS-8042", completedAt: "2026-08-27T12:15:00.000Z",
  },
  {
    id: "LOT-2381", material: "batteries", weight: 6, condition: "Mixed", location: "Bhosari, Pune",
    createdAt: "2026-08-30T08:40:00.000Z", estimatedMin: 239, estimatedMax: 342, status: "available",
    syncStatus: "synced", imageName: "battery-lot.jpg", aiConfidence: 84,
  },
];

export const statusLabel: Record<LotStatus, string> = {
  available: "Ready to match", offline: "Pending sync", locked: "FairLock active", scheduled: "Pickup scheduled", completed: "Completed",
};

export const navItems = [
  { key: "home" as CollectorView, icon: Home, translation: "home" as const },
  { key: "create" as CollectorView, icon: Plus, translation: "create" as const },
  { key: "matches" as CollectorView, icon: Handshake, translation: "matches" as const },
  { key: "ledger" as CollectorView, icon: WalletCards, translation: "ledger" as const },
  { key: "safety" as CollectorView, icon: ShieldAlert, translation: "safety" as const },
  { key: "market" as CollectorView, icon: ChartCandlestick, translation: "market" as const },
  { key: "help" as CollectorView, icon: LifeBuoy, translation: "help" as const },
  { key: "faq" as CollectorView, icon: CircleHelp, translation: "faq" as const },
];

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
