"use client";

import { useEffect, useRef } from "react";
import { Language } from "./kabadi-data";

const nativePhrases: Partial<Record<Language, Record<string, string>>> = {
  hi: {
    "Live Prices": "लाइव कीमतें", "Help": "सहायता", "FAQ": "अक्सर पूछे जाने वाले प्रश्न",
    "Collector app": "संग्रहकर्ता ऐप", "Connected": "कनेक्टेड",
    "Prices and recycler offers are current demo data.": "कीमतें और रीसायकलर ऑफ़र वर्तमान डेमो डेटा हैं।",
    "Live scrap price trend": "लाइव कबाड़ मूल्य रुझान",
    "Illustrative prototype rates — not a commodity exchange feed.": "उदाहरणात्मक प्रोटोटाइप दरें — यह कमोडिटी एक्सचेंज फ़ीड नहीं है।",
    "Help & feedback": "सहायता और प्रतिक्रिया", "Frequently asked questions": "अक्सर पूछे जाने वाले प्रश्न",
    "Tap a picture": "तस्वीर पर टैप करें", "What do you want to do?": "आप क्या करना चाहते हैं?", "Take a photo": "फोटो लें", "Show your scrap": "अपना कबाड़ दिखाएँ", "Check fair price": "उचित कीमत देखें", "See today’s range": "आज की कीमत सीमा देखें", "Choose pickup": "पिकअप चुनें", "Find a recycler": "रीसायकलर खोजें", "Hear these steps": "चरण सुनें",
    "Rate your recycler": "अपने रीसायकलर को रेट करें", "How was your experience with this recycler?": "इस रीसायकलर के साथ आपका अनुभव कैसा रहा?", "Save recycler rating": "रीसायकलर रेटिंग सहेजें", "Your rating": "आपकी रेटिंग", "Your feedback": "आपकी प्रतिक्रिया", "Submit feedback": "प्रतिक्रिया भेजें",
  },
  mr: {
    "Live Prices": "थेट किंमती", "Help": "मदत", "FAQ": "वारंवार विचारलेले प्रश्न",
    "Collector app": "संकलक ॲप", "Connected": "जोडलेले",
    "Prices and recycler offers are current demo data.": "किंमती आणि रिसायकलर ऑफर सध्याचा डेमो डेटा आहेत.",
    "Live scrap price trend": "थेट भंगार किंमत कल",
    "Illustrative prototype rates — not a commodity exchange feed.": "दर्शनी प्रोटोटाइप दर — कमोडिटी एक्सचेंज फीड नाही.",
    "Help & feedback": "मदत आणि अभिप्राय", "Frequently asked questions": "वारंवार विचारलेले प्रश्न",
    "Tap a picture": "चित्रावर टॅप करा", "What do you want to do?": "तुम्हाला काय करायचे आहे?", "Take a photo": "फोटो काढा", "Show your scrap": "तुमचा भंगार दाखवा", "Check fair price": "योग्य किंमत पाहा", "See today’s range": "आजची किंमत श्रेणी पाहा", "Choose pickup": "पिकअप निवडा", "Find a recycler": "रिसायकलर शोधा", "Hear these steps": "पायऱ्या ऐका",
    "Rate your recycler": "तुमच्या रिसायकलरला रेटिंग द्या", "How was your experience with this recycler?": "या रिसायकलरसोबतचा तुमचा अनुभव कसा होता?", "Save recycler rating": "रिसायकलर रेटिंग जतन करा", "Your rating": "तुमचे रेटिंग", "Your feedback": "तुमचा अभिप्राय", "Submit feedback": "अभिप्राय पाठवा",
  },
  ta: {
    "Live Prices": "நேரடி விலைகள்", "Help": "உதவி", "FAQ": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    "Collector app": "சேகரிப்பாளர் செயலி", "Connected": "இணைக்கப்பட்டுள்ளது",
    "Prices and recycler offers are current demo data.": "விலைகளும் மறுசுழற்சியாளர் சலுகைகளும் தற்போதைய மாதிரி தரவாகும்.",
    "Live scrap price trend": "நேரடி கழிவுப்பொருள் விலைப் போக்கு",
    "Illustrative prototype rates — not a commodity exchange feed.": "விளக்கத்திற்கான மாதிரி விலைகள் — இது பொருள் சந்தை நேரடி தரவு அல்ல.",
    "Help & feedback": "உதவி மற்றும் கருத்து", "Frequently asked questions": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    "Tap a picture": "ஒரு படத்தைத் தொடுங்கள்", "What do you want to do?": "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?", "Take a photo": "புகைப்படம் எடுக்கவும்", "Show your scrap": "உங்கள் கழிவுப்பொருளைக் காட்டவும்", "Check fair price": "நியாயமான விலையைப் பார்க்கவும்", "See today’s range": "இன்றைய விலை வரம்பைப் பார்க்கவும்", "Choose pickup": "எடுத்துச் செல்லுதலைத் தேர்வு செய்யவும்", "Find a recycler": "மறுசுழற்சியாளரைக் கண்டறியவும்", "Hear these steps": "இந்த படிகளைக் கேட்கவும்",
    "Rate your recycler": "உங்கள் மறுசுழற்சியாளருக்கு மதிப்பிடவும்", "How was your experience with this recycler?": "இந்த மறுசுழற்சியாளருடனான உங்கள் அனுபவம் எப்படி இருந்தது?", "Save recycler rating": "மறுசுழற்சியாளர் மதிப்பீட்டைச் சேமிக்கவும்", "Your rating": "உங்கள் மதிப்பீடு", "Your feedback": "உங்கள் கருத்து", "Submit feedback": "கருத்தைச் சமர்ப்பிக்கவும்",
  },
  te: {
    "Live Prices": "ప్రత్యక్ష ధరలు", "Help": "సహాయం", "FAQ": "తరచుగా అడిగే ప్రశ్నలు",
    "Collector app": "సేకరణకర్త యాప్", "Connected": "కనెక్ట్ అయింది",
    "Prices and recycler offers are current demo data.": "ధరలు మరియు రీసైక్లర్ ఆఫర్లు ప్రస్తుత డెమో డేటా.",
    "Live scrap price trend": "ప్రత్యక్ష స్క్రాప్ ధర ధోరణి",
    "Illustrative prototype rates — not a commodity exchange feed.": "ఉదాహరణ ప్రోటోటైప్ ధరలు — ఇది కమోడిటీ ఎక్స్చేంజ్ ఫీడ్ కాదు.",
    "Help & feedback": "సహాయం మరియు అభిప్రాయం", "Frequently asked questions": "తరచుగా అడిగే ప్రశ్నలు",
    "Tap a picture": "చిత్రాన్ని నొక్కండి", "What do you want to do?": "మీరు ఏమి చేయాలనుకుంటున్నారు?", "Take a photo": "ఫోటో తీయండి", "Show your scrap": "మీ స్క్రాప్‌ను చూపండి", "Check fair price": "న్యాయమైన ధరను చూడండి", "See today’s range": "నేటి ధర పరిధిని చూడండి", "Choose pickup": "పికప్ ఎంచుకోండి", "Find a recycler": "రీసైక్లర్‌ను కనుగొనండి", "Hear these steps": "ఈ దశలను వినండి",
    "Rate your recycler": "మీ రీసైక్లర్‌కు రేటింగ్ ఇవ్వండి", "How was your experience with this recycler?": "ఈ రీసైక్లర్‌తో మీ అనుభవం ఎలా ఉంది?", "Save recycler rating": "రీసైక్లర్ రేటింగ్‌ను సేవ్ చేయండి", "Your rating": "మీ రేటింగ్", "Your feedback": "మీ అభిప్రాయం", "Submit feedback": "అభిప్రాయం సమర్పించండి",
  },
  kn: {
    "Live Prices": "ನೇರ ಬೆಲೆಗಳು", "Help": "ಸಹಾಯ", "FAQ": "ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
    "Collector app": "ಸಂಗ್ರಾಹಕ ಆಪ್", "Connected": "ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    "Prices and recycler offers are current demo data.": "ಬೆಲೆಗಳು ಮತ್ತು ಮರುಬಳಕೆದಾರರ ಆಫರ್‌ಗಳು ಪ್ರಸ್ತುತ ಡೆಮೊ ಡೇಟಾ.",
    "Live scrap price trend": "ನೇರ ಸ್ಕ್ರ್ಯಾಪ್ ಬೆಲೆ ಪ್ರವೃತ್ತಿ",
    "Illustrative prototype rates — not a commodity exchange feed.": "ಉದಾಹರಣೆಯ ಪ್ರೋಟೋಟೈಪ್ ದರಗಳು — ಇದು ಸರಕು ವಿನಿಮಯ ಫೀಡ್ ಅಲ್ಲ.",
    "Help & feedback": "ಸಹಾಯ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ", "Frequently asked questions": "ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು",
    "Tap a picture": "ಚಿತ್ರವನ್ನು ಒತ್ತಿರಿ", "What do you want to do?": "ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?", "Take a photo": "ಫೋಟೋ ತೆಗೆಯಿರಿ", "Show your scrap": "ನಿಮ್ಮ ಸ್ಕ್ರ್ಯಾಪ್ ತೋರಿಸಿ", "Check fair price": "ನ್ಯಾಯವಾದ ಬೆಲೆ ನೋಡಿ", "See today’s range": "ಇಂದಿನ ಬೆಲೆ ವ್ಯಾಪ್ತಿ ನೋಡಿ", "Choose pickup": "ಪಿಕಪ್ ಆಯ್ಕೆಮಾಡಿ", "Find a recycler": "ಮರುಬಳಕೆದಾರರನ್ನು ಹುಡುಕಿ", "Hear these steps": "ಈ ಹಂತಗಳನ್ನು ಕೇಳಿ",
    "Rate your recycler": "ನಿಮ್ಮ ಮರುಬಳಕೆದಾರರಿಗೆ ರೇಟಿಂಗ್ ನೀಡಿ", "How was your experience with this recycler?": "ಈ ಮರುಬಳಕೆದಾರರೊಂದಿಗೆ ನಿಮ್ಮ ಅನುಭವ ಹೇಗಿತ್ತು?", "Save recycler rating": "ಮರುಬಳಕೆದಾರರ ರೇಟಿಂಗ್ ಉಳಿಸಿ", "Your rating": "ನಿಮ್ಮ ರೇಟಿಂಗ್", "Your feedback": "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ", "Submit feedback": "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ",
  },
  ml: {
    "Live Prices": "തത്സമയ വിലകൾ", "Help": "സഹായം", "FAQ": "പതിവ് ചോദ്യങ്ങൾ",
    "Collector app": "ശേഖരണ ആപ്പ്", "Connected": "ബന്ധിപ്പിച്ചു",
    "Prices and recycler offers are current demo data.": "വിലകളും റീസൈക്ലർ ഓഫറുകളും നിലവിലെ ഡെമോ ഡാറ്റയാണ്.",
    "Live scrap price trend": "തത്സമയ സ്ക്രാപ്പ് വില പ്രവണത",
    "Illustrative prototype rates — not a commodity exchange feed.": "ഉദാഹരണ പ്രോട്ടോടൈപ്പ് നിരക്കുകൾ — ഇത് കൊമോഡിറ്റി എക്സ്ചേഞ്ച് ഫീഡ് അല്ല.",
    "Help & feedback": "സഹായവും അഭിപ്രായവും", "Frequently asked questions": "പതിവ് ചോദ്യങ്ങൾ",
    "Tap a picture": "ഒരു ചിത്രം അമർത്തുക", "What do you want to do?": "നിങ്ങൾ എന്ത് ചെയ്യാൻ ആഗ്രഹിക്കുന്നു?", "Take a photo": "ഫോട്ടോ എടുക്കുക", "Show your scrap": "നിങ്ങളുടെ സ്ക്രാപ്പ് കാണിക്കുക", "Check fair price": "ന്യായമായ വില കാണുക", "See today’s range": "ഇന്നത്തെ വില പരിധി കാണുക", "Choose pickup": "പിക്കപ്പ് തിരഞ്ഞെടുക്കുക", "Find a recycler": "റീസൈക്ലറെ കണ്ടെത്തുക", "Hear these steps": "ഈ ഘട്ടങ്ങൾ കേൾക്കുക",
    "Rate your recycler": "നിങ്ങളുടെ റീസൈക്ലറെ വിലയിരുത്തുക", "How was your experience with this recycler?": "ഈ റീസൈക്ലറുമായുള്ള നിങ്ങളുടെ അനുഭവം എങ്ങനെയായിരുന്നു?", "Save recycler rating": "റീസൈക്ലർ റേറ്റിംഗ് സൂക്ഷിക്കുക", "Your rating": "നിങ്ങളുടെ റേറ്റിംഗ്", "Your feedback": "നിങ്ങളുടെ അഭിപ്രായം", "Submit feedback": "അഭിപ്രായം സമർപ്പിക്കുക",
  },
  bn: {
    "Live Prices": "লাইভ মূল্য", "Help": "সহায়তা", "FAQ": "সাধারণ প্রশ্ন",
    "Collector app": "সংগ্রাহক অ্যাপ", "Connected": "সংযুক্ত",
    "Prices and recycler offers are current demo data.": "মূল্য ও রিসাইক্লার অফার বর্তমান ডেমো ডেটা।",
    "Live scrap price trend": "লাইভ স্ক্র্যাপ মূল্য প্রবণতা",
    "Illustrative prototype rates — not a commodity exchange feed.": "উদাহরণমূলক প্রোটোটাইপ দর — এটি কমোডিটি এক্সচেঞ্জ ফিড নয়।",
    "Help & feedback": "সহায়তা ও মতামত", "Frequently asked questions": "সাধারণ জিজ্ঞাসা",
    "Tap a picture": "একটি ছবিতে চাপ দিন", "What do you want to do?": "আপনি কী করতে চান?", "Take a photo": "ছবি তুলুন", "Show your scrap": "আপনার স্ক্র্যাপ দেখান", "Check fair price": "ন্যায্য মূল্য দেখুন", "See today’s range": "আজকের মূল্যসীমা দেখুন", "Choose pickup": "পিকআপ বেছে নিন", "Find a recycler": "রিসাইক্লার খুঁজুন", "Hear these steps": "ধাপগুলো শুনুন",
    "Rate your recycler": "আপনার রিসাইক্লারকে রেটিং দিন", "How was your experience with this recycler?": "এই রিসাইক্লারের সঙ্গে আপনার অভিজ্ঞতা কেমন ছিল?", "Save recycler rating": "রিসাইক্লার রেটিং সংরক্ষণ করুন", "Your rating": "আপনার রেটিং", "Your feedback": "আপনার মতামত", "Submit feedback": "মতামত জমা দিন",
  },
  gu: {
    "Live Prices": "લાઇવ કિંમતો", "Help": "મદદ", "FAQ": "વારંવાર પૂછાતા પ્રશ્નો",
    "Collector app": "સંગ્રાહક એપ", "Connected": "જોડાયેલ",
    "Prices and recycler offers are current demo data.": "કિંમતો અને રિસાયકલર ઓફરો હાલના ડેમો ડેટા છે.",
    "Live scrap price trend": "લાઇવ સ્ક્રેપ કિંમત વલણ",
    "Illustrative prototype rates — not a commodity exchange feed.": "ઉદાહરણ પ્રોટોટાઇપ દરો — આ કોમોડિટી એક્સચેન્જ ફીડ નથી.",
    "Help & feedback": "મદદ અને પ્રતિસાદ", "Frequently asked questions": "વારંવાર પૂછાતા પ્રશ્નો",
    "Tap a picture": "ચિત્ર પર ટેપ કરો", "What do you want to do?": "તમે શું કરવા માંગો છો?", "Take a photo": "ફોટો લો", "Show your scrap": "તમારો ભંગાર બતાવો", "Check fair price": "વાજબી કિંમત જુઓ", "See today’s range": "આજની કિંમતની શ્રેણી જુઓ", "Choose pickup": "પિકઅપ પસંદ કરો", "Find a recycler": "રિસાયકલર શોધો", "Hear these steps": "આ પગલાં સાંભળો",
    "Rate your recycler": "તમારા રિસાયકલરને રેટિંગ આપો", "How was your experience with this recycler?": "આ રિસાયકલર સાથે તમારો અનુભવ કેવો રહ્યો?", "Save recycler rating": "રિસાયકલર રેટિંગ સાચવો", "Your rating": "તમારું રેટિંગ", "Your feedback": "તમારો પ્રતિસાદ", "Submit feedback": "પ્રતિસાદ મોકલો",
  },
  pa: {
    "Live Prices": "ਲਾਈਵ ਕੀਮਤਾਂ", "Help": "ਮਦਦ", "FAQ": "ਅਕਸਰ ਪੁੱਛੇ ਸਵਾਲ",
    "Collector app": "ਸੰਗ੍ਰਹਿਕ ਐਪ", "Connected": "ਜੁੜਿਆ",
    "Prices and recycler offers are current demo data.": "ਕੀਮਤਾਂ ਅਤੇ ਰੀਸਾਈਕਲਰ ਪੇਸ਼ਕਸ਼ਾਂ ਮੌਜੂਦਾ ਡੈਮੋ ਡਾਟਾ ਹਨ।",
    "Live scrap price trend": "ਲਾਈਵ ਸਕ੍ਰੈਪ ਕੀਮਤ ਰੁਝਾਨ",
    "Illustrative prototype rates — not a commodity exchange feed.": "ਉਦਾਹਰਨ ਪ੍ਰੋਟੋਟਾਈਪ ਦਰਾਂ — ਇਹ ਕਮੋਡਿਟੀ ਐਕਸਚੇਂਜ ਫੀਡ ਨਹੀਂ ਹੈ।",
    "Help & feedback": "ਮਦਦ ਅਤੇ ਫੀਡਬੈਕ", "Frequently asked questions": "ਅਕਸਰ ਪੁੱਛੇ ਸਵਾਲ",
    "Tap a picture": "ਤਸਵੀਰ ਉੱਤੇ ਟੈਪ ਕਰੋ", "What do you want to do?": "ਤੁਸੀਂ ਕੀ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?", "Take a photo": "ਫੋਟੋ ਖਿੱਚੋ", "Show your scrap": "ਆਪਣਾ ਕਬਾੜ ਦਿਖਾਓ", "Check fair price": "ਵਾਜਬ ਕੀਮਤ ਵੇਖੋ", "See today’s range": "ਅੱਜ ਦੀ ਕੀਮਤ ਸੀਮਾ ਵੇਖੋ", "Choose pickup": "ਪਿਕਅਪ ਚੁਣੋ", "Find a recycler": "ਰੀਸਾਈਕਲਰ ਲੱਭੋ", "Hear these steps": "ਇਹ ਕਦਮ ਸੁਣੋ",
    "Rate your recycler": "ਆਪਣੇ ਰੀਸਾਈਕਲਰ ਨੂੰ ਰੇਟਿੰਗ ਦਿਓ", "How was your experience with this recycler?": "ਇਸ ਰੀਸਾਈਕਲਰ ਨਾਲ ਤੁਹਾਡਾ ਅਨੁਭਵ ਕਿਵੇਂ ਰਿਹਾ?", "Save recycler rating": "ਰੀਸਾਈਕਲਰ ਰੇਟਿੰਗ ਸੰਭਾਲੋ", "Your rating": "ਤੁਹਾਡੀ ਰੇਟਿੰਗ", "Your feedback": "ਤੁਹਾਡਾ ਫੀਡਬੈਕ", "Submit feedback": "ਫੀਡਬੈਕ ਭੇਜੋ",
  },
  or: {
    "Live Prices": "ସିଧା ମୂଲ୍ୟ", "Help": "ସହାୟତା", "FAQ": "ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ",
    "Collector app": "ସଂଗ୍ରାହକ ଆପ୍", "Connected": "ସଂଯୁକ୍ତ",
    "Prices and recycler offers are current demo data.": "ମୂଲ୍ୟ ଏବଂ ରିସାଇକ୍ଲର୍ ଅଫର୍ ବର୍ତ୍ତମାନର ଡେମୋ ଡାଟା।",
    "Live scrap price trend": "ସିଧା ସ୍କ୍ରାପ୍ ମୂଲ୍ୟ ପ୍ରବଣତା",
    "Illustrative prototype rates — not a commodity exchange feed.": "ଉଦାହରଣ ପ୍ରୋଟୋଟାଇପ୍ ଦର — ଏହା କମୋଡିଟି ଏକ୍ସଚେଞ୍ଜ ଫିଡ୍ ନୁହେଁ।",
    "Help & feedback": "ସହାୟତା ଏବଂ ମତାମତ", "Frequently asked questions": "ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ",
    "Tap a picture": "ଚିତ୍ରକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ", "What do you want to do?": "ଆପଣ କଣ କରିବାକୁ ଚାହୁଁଛନ୍ତି?", "Take a photo": "ଫଟୋ ନିଅନ୍ତୁ", "Show your scrap": "ଆପଣଙ୍କ ସ୍କ୍ରାପ୍ ଦେଖାନ୍ତୁ", "Check fair price": "ଉଚିତ ମୂଲ୍ୟ ଦେଖନ୍ତୁ", "See today’s range": "ଆଜିର ମୂଲ୍ୟ ସୀମା ଦେଖନ୍ତୁ", "Choose pickup": "ପିକଅପ୍ ବାଛନ୍ତୁ", "Find a recycler": "ରିସାଇକ୍ଲର୍ ଖୋଜନ୍ତୁ", "Hear these steps": "ଏହି ପଦକ୍ଷେପ ଶୁଣନ୍ତୁ",
    "Rate your recycler": "ଆପଣଙ୍କ ରିସାଇକ୍ଲର୍‌କୁ ମୂଲ୍ୟାଙ୍କନ କରନ୍ତୁ", "How was your experience with this recycler?": "ଏହି ରିସାଇକ୍ଲର୍ ସହିତ ଆପଣଙ୍କ ଅନୁଭବ କିପରି ଥିଲା?", "Save recycler rating": "ରିସାଇକ୍ଲର୍ ରେଟିଂ ସଂରକ୍ଷଣ କରନ୍ତୁ", "Your rating": "ଆପଣଙ୍କ ରେଟିଂ", "Your feedback": "ଆପଣଙ୍କ ମତାମତ", "Submit feedback": "ମତାମତ ଦାଖଲ କରନ୍ତୁ",
  },
  as: {
    "Live Prices": "সজীৱ মূল্য", "Help": "সহায়", "FAQ": "সঘনাই সোধা প্ৰশ্ন",
    "Collector app": "সংগ্ৰাহক এপ", "Connected": "সংযুক্ত",
    "Prices and recycler offers are current demo data.": "মূল্য আৰু পুনঃচক্ৰীকৰণকাৰীৰ অফাৰ বৰ্তমানৰ ডেমো ডাটা।",
    "Live scrap price trend": "সজীৱ স্ক্ৰেপ মূল্যৰ ধাৰা",
    "Illustrative prototype rates — not a commodity exchange feed.": "উদাহৰণমূলক প্ৰোটোটাইপ দৰ — এইটো কমোডিটি এক্সচেঞ্জ ফিড নহয়।",
    "Help & feedback": "সহায় আৰু মতামত", "Frequently asked questions": "সঘনাই সোধা প্ৰশ্ন",
    "Tap a picture": "এখন ছবিত টিপক", "What do you want to do?": "আপুনি কি কৰিব বিচাৰে?", "Take a photo": "ফটো লওক", "Show your scrap": "আপোনাৰ স্ক্ৰেপ দেখুৱাওক", "Check fair price": "ন্যায্য মূল্য চাওক", "See today’s range": "আজিৰ মূল্য সীমা চাওক", "Choose pickup": "পিকআপ বাছক", "Find a recycler": "পুনঃচক্ৰীকৰণকাৰী বিচাৰক", "Hear these steps": "এই পদক্ষেপবোৰ শুনক",
    "Rate your recycler": "আপোনাৰ পুনঃচক্ৰীকৰণকাৰীক ৰেটিং দিয়ক", "How was your experience with this recycler?": "এই পুনঃচক্ৰীকৰণকাৰীৰ সৈতে আপোনাৰ অভিজ্ঞতা কেনেকুৱা আছিল?", "Save recycler rating": "পুনঃচক্ৰীকৰণকাৰীৰ ৰেটিং সংৰক্ষণ কৰক", "Your rating": "আপোনাৰ ৰেটিং", "Your feedback": "আপোনাৰ মতামত", "Submit feedback": "মতামত দাখিল কৰক",
  },
};

const wordKeys = "collector|recycler|home|create|lot|lots|matches|earnings|safety|live|prices|market|trend|help|faq|feedback|query|history|handover|pickup|payment|material|weight|rate|value|offer|available|scheduled|completed|pending|offline|verified|final|current|estimated|open|continue|back|review|submit|select|language|workspace|sign|name|mobile|email|organisation|authorization|photo|upload|condition|location|distance|minimum|high|low|change|updated|connected|demo|prototype|question|support|contact|cluster|save|find|listen|voice|details|clear|compare|confirm|required|reason|evidence|source|illustrative|screen|device".split("|");

const wordValues: Partial<Record<Language, string>> = {
  hi: "संग्रहकर्ता|रीसायकलर|होम|बनाएँ|लॉट|लॉट|मिलान|कमाई|सुरक्षा|लाइव|कीमतें|बाज़ार|रुझान|सहायता|सामान्य प्रश्न|प्रतिक्रिया|प्रश्न|इतिहास|हैंडओवर|पिकअप|भुगतान|सामग्री|वजन|दर|मूल्य|ऑफ़र|उपलब्ध|निर्धारित|पूर्ण|लंबित|ऑफ़लाइन|सत्यापित|अंतिम|वर्तमान|अनुमानित|खोलें|जारी रखें|वापस|समीक्षा|जमा करें|चुनें|भाषा|कार्यस्थान|साइन|नाम|मोबाइल|ईमेल|संगठन|प्राधिकरण|फोटो|अपलोड|स्थिति|स्थान|दूरी|न्यूनतम|उच्च|निम्न|बदलाव|अपडेट|जुड़ा|डेमो|प्रोटोटाइप|प्रश्न|सहायता|संपर्क|समूह|सहेजें|खोजें|सुनें|आवाज़|विवरण|स्पष्ट|तुलना|पुष्टि|आवश्यक|कारण|सबूत|स्रोत|उदाहरणात्मक|स्क्रीन|डिवाइस",
  mr: "संकलक|रिसायकलर|मुख्यपृष्ठ|तयार करा|लॉट|लॉट|जुळण्या|कमाई|सुरक्षा|थेट|किंमती|बाजार|कल|मदत|सामान्य प्रश्न|अभिप्राय|प्रश्न|इतिहास|हस्तांतरण|पिकअप|देयक|साहित्य|वजन|दर|मूल्य|ऑफर|उपलब्ध|नियोजित|पूर्ण|प्रलंबित|ऑफलाइन|सत्यापित|अंतिम|सध्याचे|अंदाजित|उघडा|पुढे|मागे|पुनरावलोकन|सबमिट|निवडा|भाषा|कार्यस्थान|साइन|नाव|मोबाइल|ईमेल|संस्था|अधिकृतता|फोटो|अपलोड|स्थिती|स्थान|अंतर|किमान|उच्च|कमी|बदल|अद्यतनित|जोडलेले|डेमो|प्रोटोटाइप|प्रश्न|मदत|संपर्क|समूह|जतन|शोधा|ऐका|आवाज|तपशील|स्पष्ट|तुलना|पुष्टी|आवश्यक|कारण|पुरावा|स्रोत|दर्शनी|स्क्रीन|उपकरण",
  ta: "சேகரிப்பாளர்|மறுசுழற்சியாளர்|முகப்பு|உருவாக்கு|லாட்|லாட்கள்|பொருத்தங்கள்|வருமானம்|பாதுகாப்பு|நேரடி|விலைகள்|சந்தை|போக்கு|உதவி|அடிக்கடி கேள்விகள்|கருத்து|கேள்வி|வரலாறு|ஒப்படைப்பு|பிக்கப்|பணம்|பொருள்|எடை|விலை|மதிப்பு|சலுகை|கிடைக்கும்|திட்டமிடப்பட்டது|முடிந்தது|நிலுவை|இணையமின்றி|சரிபார்க்கப்பட்டது|இறுதி|தற்போதைய|மதிப்பிடப்பட்ட|திற|தொடர்|பின்|மதிப்பாய்வு|சமர்ப்பி|தேர்வு|மொழி|பணியிடம்|உள்நுழை|பெயர்|கைபேசி|மின்னஞ்சல்|நிறுவனம்|அங்கீகாரம்|புகைப்படம்|பதிவேற்று|நிலை|இடம்|தூரம்|குறைந்தபட்சம்|அதிகம்|குறைவு|மாற்றம்|புதுப்பிக்கப்பட்டது|இணைக்கப்பட்டது|மாதிரி|முன்மாதிரி|கேள்வி|ஆதரவு|தொடர்பு|குழு|சேமி|கண்டுபிடி|கேள்|குரல்|விவரங்கள்|தெளிவு|ஒப்பிடு|உறுதிப்படுத்து|தேவை|காரணம்|ஆதாரம்|மூலம்|விளக்கத்திற்கான|திரை|சாதனம்",
  te: "సేకరణకర్త|రీసైక్లర్|హోమ్|సృష్టించు|లాట్|లాట్లు|మ్యాచ్‌లు|ఆదాయం|భద్రత|ప్రత్యక్ష|ధరలు|మార్కెట్|ధోరణి|సహాయం|తరచు ప్రశ్నలు|అభిప్రాయం|ప్రశ్న|చరిత్ర|అప్పగింత|పికప్|చెల్లింపు|పదార్థం|బరువు|ధర|విలువ|ఆఫర్|అందుబాటులో|షెడ్యూల్|పూర్తి|పెండింగ్|ఆఫ్‌లైన్|ధృవీకరించిన|తుది|ప్రస్తుత|అంచనా|తెరువు|కొనసాగించు|వెనుకకు|సమీక్ష|సమర్పించు|ఎంచుకో|భాష|పని ప్రదేశం|సైన్|పేరు|మొబైల్|ఇమెయిల్|సంస్థ|అనుమతి|ఫోటో|అప్‌లోడ్|స్థితి|ప్రదేశం|దూరం|కనిష్ఠం|ఎక్కువ|తక్కువ|మార్పు|నవీకరించబడింది|కనెక్ట్|డెమో|ప్రోటోటైప్|ప్రశ్న|సహాయం|సంప్రదింపు|సమూహం|సేవ్|కనుగొను|విను|వాయిస్|వివరాలు|స్పష్టం|పోల్చు|నిర్ధారించు|అవసరం|కారణం|ఆధారం|మూలం|ఉదాహరణ|స్క్రీన్|పరికరం",
  kn: "ಸಂಗ್ರಾಹಕ|ಮರುಬಳಕೆದಾರ|ಮುಖಪುಟ|ರಚಿಸಿ|ಲಾಟ್|ಲಾಟ್‌ಗಳು|ಹೊಂದಾಣಿಕೆ|ಆದಾಯ|ಸುರಕ್ಷತೆ|ನೇರ|ಬೆಲೆಗಳು|ಮಾರುಕಟ್ಟೆ|ಪ್ರವೃತ್ತಿ|ಸಹಾಯ|ಪದೇ ಪ್ರಶ್ನೆಗಳು|ಪ್ರತಿಕ್ರಿಯೆ|ಪ್ರಶ್ನೆ|ಇತಿಹಾಸ|ಹಸ್ತಾಂತರ|ಪಿಕಪ್|ಪಾವತಿ|ವಸ್ತು|ತೂಕ|ದರ|ಮೌಲ್ಯ|ಆಫರ್|ಲಭ್ಯ|ನಿಗದಿತ|ಪೂರ್ಣ|ಬಾಕಿ|ಆಫ್‌ಲೈನ್|ಪರಿಶೀಲಿತ|ಅಂತಿಮ|ಪ್ರಸ್ತುತ|ಅಂದಾಜು|ತೆರೆಯಿರಿ|ಮುಂದುವರಿಸಿ|ಹಿಂದೆ|ಪರಿಶೀಲನೆ|ಸಲ್ಲಿಸಿ|ಆಯ್ಕೆ|ಭಾಷೆ|ಕಾರ್ಯಸ್ಥಳ|ಸೈನ್|ಹೆಸರು|ಮೊಬೈಲ್|ಇಮೇಲ್|ಸಂಸ್ಥೆ|ಅಧಿಕೃತತೆ|ಫೋಟೋ|ಅಪ್‌ಲೋಡ್|ಸ್ಥಿತಿ|ಸ್ಥಳ|ದೂರ|ಕನಿಷ್ಠ|ಹೆಚ್ಚು|ಕಡಿಮೆ|ಬದಲಾವಣೆ|ನವೀಕರಿಸಲಾಗಿದೆ|ಸಂಪರ್ಕಿತ|ಡೆಮೊ|ಪ್ರೋಟೋಟೈಪ್|ಪ್ರಶ್ನೆ|ಬೆಂಬಲ|ಸಂಪರ್ಕ|ಗುಂಪು|ಉಳಿಸಿ|ಹುಡುಕಿ|ಕೇಳಿ|ಧ್ವನಿ|ವಿವರಗಳು|ಸ್ಪಷ್ಟ|ಹೋಲಿಸಿ|ದೃಢೀಕರಿಸಿ|ಅಗತ್ಯ|ಕಾರಣ|ಸಾಕ್ಷಿ|ಮೂಲ|ಉದಾಹರಣೆ|ಪರದೆ|ಸಾಧನ",
  ml: "ശേഖരകൻ|റീസൈക്ലർ|ഹോം|സൃഷ്ടിക്കുക|ലോട്ട്|ലോട്ടുകൾ|പൊരുത്തങ്ങൾ|വരുമാനം|സുരക്ഷ|തത്സമയ|വിലകൾ|വിപണി|പ്രവണത|സഹായം|പതിവ് ചോദ്യങ്ങൾ|അഭിപ്രായം|ചോദ്യം|ചരിത്രം|കൈമാറ്റം|പിക്കപ്പ്|പണമടവ്|വസ്തു|ഭാരം|നിരക്ക്|മൂല്യം|ഓഫർ|ലഭ്യം|ക്രമീകരിച്ചു|പൂർത്തിയായി|കുടിശ്ശിക|ഓഫ്‌ലൈൻ|സ്ഥിരീകരിച്ചത്|അന്തിമ|നിലവിലെ|കണക്കാക്കിയ|തുറക്കുക|തുടരുക|പിന്നോട്ട്|പരിശോധന|സമർപ്പിക്കുക|തിരഞ്ഞെടുക്കുക|ഭാഷ|പ്രവർത്തനസ്ഥലം|സൈൻ|പേര്|മൊബൈൽ|ഇമെയിൽ|സ്ഥാപനം|അംഗീകാരം|ഫോട്ടോ|അപ്‌ലോഡ്|നില|സ്ഥലം|ദൂരം|കുറഞ്ഞത്|ഉയർന്ന|താഴ്ന്ന|മാറ്റം|പുതുക്കി|ബന്ധിപ്പിച്ചു|ഡെമോ|പ്രോട്ടോടൈപ്പ്|ചോദ്യം|പിന്തുണ|ബന്ധപ്പെടുക|കൂട്ടം|സൂക്ഷിക്കുക|കണ്ടെത്തുക|കേൾക്കുക|ശബ്ദം|വിശദാംശങ്ങൾ|വ്യക്തം|താരതമ്യം|സ്ഥിരീകരിക്കുക|ആവശ്യമാണ്|കാരണം|തെളിവ്|ഉറവിടം|ഉദാഹരണം|സ്ക്രീൻ|ഉപകരണം",
  bn: "সংগ্রাহক|রিসাইক্লার|হোম|তৈরি|লট|লটসমূহ|মিল|আয়|নিরাপত্তা|লাইভ|মূল্য|বাজার|প্রবণতা|সহায়তা|সাধারণ প্রশ্ন|মতামত|প্রশ্ন|ইতিহাস|হস্তান্তর|পিকআপ|পেমেন্ট|উপাদান|ওজন|দর|মূল্য|অফার|উপলব্ধ|নির্ধারিত|সম্পন্ন|বাকি|অফলাইন|যাচাইকৃত|চূড়ান্ত|বর্তমান|আনুমানিক|খুলুন|চালিয়ে যান|ফিরে|পর্যালোচনা|জমা দিন|নির্বাচন|ভাষা|কর্মক্ষেত্র|সাইন|নাম|মোবাইল|ইমেইল|প্রতিষ্ঠান|অনুমোদন|ছবি|আপলোড|অবস্থা|স্থান|দূরত্ব|ন্যূনতম|উচ্চ|নিম্ন|পরিবর্তন|আপডেট|সংযুক্ত|ডেমো|প্রোটোটাইপ|প্রশ্ন|সহায়তা|যোগাযোগ|গুচ্ছ|সংরক্ষণ|খুঁজুন|শুনুন|কণ্ঠ|বিবরণ|স্পষ্ট|তুলনা|নিশ্চিত|প্রয়োজন|কারণ|প্রমাণ|উৎস|উদাহরণ|স্ক্রিন|ডিভাইস",
  gu: "સંગ્રાહક|રિસાયકલર|મુખ્ય|બનાવો|લોટ|લોટ્સ|મેળ|આવક|સુરક્ષા|લાઇવ|કિંમતો|બજાર|વલણ|મદદ|વારંવાર પ્રશ્નો|પ્રતિસાદ|પ્રશ્ન|ઇતિહાસ|સોંપણી|પિકઅપ|ચુકવણી|સામગ્રી|વજન|દર|મૂલ્ય|ઓફર|ઉપલબ્ધ|નક્કી|પૂર્ણ|બાકી|ઓફલાઇન|ચકાસેલ|અંતિમ|વર્તમાન|અંદાજિત|ખોલો|ચાલુ રાખો|પાછા|સમીક્ષા|સબમિટ|પસંદ|ભાષા|કાર્યસ્થળ|સાઇન|નામ|મોબાઇલ|ઇમેઇલ|સંસ્થા|અધિકૃતતા|ફોટો|અપલોડ|સ્થિતિ|સ્થાન|અંતર|ન્યૂનતમ|ઉચ્ચ|નીચું|ફેરફાર|અપડેટ|જોડાયેલ|ડેમો|પ્રોટોટાઇપ|પ્રશ્ન|સહાય|સંપર્ક|સમૂહ|સાચવો|શોધો|સાંભળો|અવાજ|વિગતો|સ્પષ્ટ|સરખાવો|પુષ્ટિ|જરૂરી|કારણ|પુરાવો|સ્ત્રોત|ઉદાહરણ|સ્ક્રીન|ઉપકરણ",
  pa: "ਸੰਗ੍ਰਹਿਕ|ਰੀਸਾਈਕਲਰ|ਹੋਮ|ਬਣਾਓ|ਲਾਟ|ਲਾਟਾਂ|ਮਿਲਾਣ|ਕਮਾਈ|ਸੁਰੱਖਿਆ|ਲਾਈਵ|ਕੀਮਤਾਂ|ਬਾਜ਼ਾਰ|ਰੁਝਾਨ|ਮਦਦ|ਅਕਸਰ ਸਵਾਲ|ਫੀਡਬੈਕ|ਸਵਾਲ|ਇਤਿਹਾਸ|ਹਵਾਲਗੀ|ਪਿਕਅਪ|ਭੁਗਤਾਨ|ਸਮੱਗਰੀ|ਵਜ਼ਨ|ਦਰ|ਮੁੱਲ|ਪੇਸ਼ਕਸ਼|ਉਪਲਬਧ|ਨਿਯਤ|ਪੂਰਾ|ਬਾਕੀ|ਆਫਲਾਈਨ|ਤਸਦੀਕਸ਼ੁਦਾ|ਅੰਤਿਮ|ਮੌਜੂਦਾ|ਅੰਦਾਜ਼ਨ|ਖੋਲ੍ਹੋ|ਜਾਰੀ ਰੱਖੋ|ਪਿੱਛੇ|ਸਮੀਖਿਆ|ਜਮ੍ਹਾਂ|ਚੁਣੋ|ਭਾਸ਼ਾ|ਕੰਮ ਥਾਂ|ਸਾਈਨ|ਨਾਮ|ਮੋਬਾਈਲ|ਈਮੇਲ|ਸੰਸਥਾ|ਅਧਿਕਾਰ|ਫੋਟੋ|ਅਪਲੋਡ|ਹਾਲਤ|ਸਥਾਨ|ਦੂਰੀ|ਘੱਟੋ-ਘੱਟ|ਉੱਚ|ਘੱਟ|ਬਦਲਾਅ|ਅਪਡੇਟ|ਜੁੜਿਆ|ਡੈਮੋ|ਪ੍ਰੋਟੋਟਾਈਪ|ਸਵਾਲ|ਸਹਾਇਤਾ|ਸੰਪਰਕ|ਗਰੁੱਪ|ਸੰਭਾਲੋ|ਲੱਭੋ|ਸੁਣੋ|ਆਵਾਜ਼|ਵੇਰਵੇ|ਸਪਸ਼ਟ|ਤੁਲਨਾ|ਪੁਸ਼ਟੀ|ਲੋੜੀਂਦਾ|ਕਾਰਨ|ਸਬੂਤ|ਸਰੋਤ|ਉਦਾਹਰਨ|ਸਕ੍ਰੀਨ|ਡਿਵਾਈਸ",
  or: "ସଂଗ୍ରାହକ|ରିସାଇକ୍ଲର୍|ମୁଖ୍ୟ|ତିଆରି|ଲଟ୍|ଲଟ୍‌ଗୁଡ଼ିକ|ମେଳ|ଆୟ|ସୁରକ୍ଷା|ସିଧା|ମୂଲ୍ୟ|ବଜାର|ପ୍ରବଣତା|ସହାୟତା|ସାଧାରଣ ପ୍ରଶ୍ନ|ମତାମତ|ପ୍ରଶ୍ନ|ଇତିହାସ|ହସ୍ତାନ୍ତର|ପିକଅପ୍|ଦେୟ|ସାମଗ୍ରୀ|ଓଜନ|ଦର|ମୂଲ୍ୟ|ଅଫର୍|ଉପଲବ୍ଧ|ନିର୍ଦ୍ଧାରିତ|ସମ୍ପୂର୍ଣ୍ଣ|ବକେୟା|ଅଫଲାଇନ୍|ଯାଞ୍ଚିତ|ଅନ୍ତିମ|ବର୍ତ୍ତମାନ|ଆନୁମାନିକ|ଖୋଲନ୍ତୁ|ଜାରି|ପଛକୁ|ସମୀକ୍ଷା|ଦାଖଲ|ବାଛନ୍ତୁ|ଭାଷା|କାର୍ଯ୍ୟସ୍ଥଳ|ସାଇନ୍|ନାମ|ମୋବାଇଲ୍|ଇମେଲ୍|ସଂସ୍ଥା|ଅନୁମତି|ଫଟୋ|ଅପଲୋଡ୍|ଅବସ୍ଥା|ସ୍ଥାନ|ଦୂରତା|ସର୍ବନିମ୍ନ|ଉଚ୍ଚ|ନିମ୍ନ|ପରିବର୍ତ୍ତନ|ଅଦ୍ୟତନ|ସଂଯୁକ୍ତ|ଡେମୋ|ପ୍ରୋଟୋଟାଇପ୍|ପ୍ରଶ୍ନ|ସହାୟତା|ଯୋଗାଯୋଗ|ଗୋଷ୍ଠୀ|ସଂରକ୍ଷଣ|ଖୋଜନ୍ତୁ|ଶୁଣନ୍ତୁ|ସ୍ୱର|ବିବରଣୀ|ସ୍ପଷ୍ଟ|ତୁଳନା|ନିଶ୍ଚିତ|ଆବଶ୍ୟକ|କାରଣ|ପ୍ରମାଣ|ଉତ୍ସ|ଉଦାହରଣ|ସ୍କ୍ରିନ୍|ଉପକରଣ",
  as: "সংগ্ৰাহক|পুনঃচক্ৰীকৰণকাৰী|হোম|সৃষ্টি|লট|লটসমূহ|মিল|উপাৰ্জন|সুৰক্ষা|সজীৱ|মূল্য|বজাৰ|ধাৰা|সহায়|সঘনাই প্ৰশ্ন|মতামত|প্ৰশ্ন|ইতিহাস|হস্তান্তৰ|পিকআপ|পৰিশোধ|সামগ্ৰী|ওজন|দৰ|মূল্য|অফাৰ|উপলব্ধ|নিৰ্ধাৰিত|সম্পূৰ্ণ|বাকী|অফলাইন|যাচাইকৃত|চূড়ান্ত|বৰ্তমান|আনুমানিক|খোলক|আগবাঢ়ক|পিছলৈ|পৰ্যালোচনা|দাখিল|বাছক|ভাষা|কৰ্মস্থান|চাইন|নাম|মোবাইল|ইমেইল|সংস্থা|অনুমোদন|ফটো|আপলোড|অৱস্থা|স্থান|দূৰত্ব|ন্যূনতম|উচ্চ|নিম্ন|পৰিৱৰ্তন|আপডেট|সংযুক্ত|ডেমো|প্ৰোটোটাইপ|প্ৰশ্ন|সহায়|যোগাযোগ|গোট|সংৰক্ষণ|বিচাৰক|শুনক|কণ্ঠ|বিৱৰণ|স্পষ্ট|তুলনা|নিশ্চিত|প্ৰয়োজন|কাৰণ|প্ৰমাণ|উৎস|উদাহৰণ|স্ক্ৰীন|ডিভাইচ",
};

const protectedWords = new Set(["English", "KabadiSetu", "FairLock", "CPCB", "SPCB", "SIH", "PWA", "QR", "AI", "JPG", "PNG", "Ravi", "GreenLoop", "EcoCycle", "UrbanMine", "Pune", "Bhosari", "KBS", "LOT", "FL", "KQ"]);

function lexicon(language: Language) {
  const values = wordValues[language]?.split("|") ?? [];
  return new Map(wordKeys.map((key, index) => [key, values[index] ?? key]));
}

export function translateText(value: string, language: Language) {
  if (language === "en" || !/[A-Za-z]/.test(value)) return value;
  const trimmed = value.trim();
  const exact = nativePhrases[language]?.[trimmed];
  if (exact) return value.replace(trimmed, exact);
  const words = lexicon(language);
  return value.replace(/[A-Za-z][A-Za-z’-]*/g, (word) => {
    if (protectedWords.has(word) || /^[A-Z0-9-]{2,}$/.test(word)) return word;
    const key = word.toLowerCase().replace(/[’']s$/, "");
    return words.get(key) ?? word;
  });
}

export function LanguageRuntime({ language }: { language: Language }) {
  const originals = useRef(new WeakMap<Text, string>());
  const translated = useRef(new WeakSet<Text>());
  const lastApplied = useRef(new WeakMap<Text, string>());
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>());

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en-IN" : language;
    const observer = new MutationObserver(() => apply());

    const apply = () => {
      observer.disconnect();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        const parent = node.parentElement;
        if (parent && !parent.closest("script, style, [data-no-translate]") && node.nodeValue?.trim()) {
          const current = node.nodeValue;
          if (language === "en") {
            if (translated.current.has(node)) node.nodeValue = originals.current.get(node) ?? current;
            translated.current.delete(node);
            lastApplied.current.delete(node);
          } else if (translated.current.has(node)) {
            if (lastApplied.current.get(node) !== current) originals.current.set(node, current);
            const next = translateText(originals.current.get(node) ?? current, language);
            if (next !== current) node.nodeValue = next;
            lastApplied.current.set(node, next);
          } else if (/^[\x00-\x7F\s\p{P}\p{N}\p{S}]+$/u.test(current)) {
            originals.current.set(node, current);
            const next = translateText(current, language);
            node.nodeValue = next;
            translated.current.add(node);
            lastApplied.current.set(node, next);
          }
        }
        node = walker.nextNode() as Text | null;
      }

      document.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => {
        if (element.closest("[data-no-translate]")) return;
        const stored = originalAttributes.current.get(element) ?? new Map<string, string>();
        for (const attribute of ["placeholder", "title", "aria-label"]) {
          const current = element.getAttribute(attribute);
          if (!current) continue;
          if (!stored.has(attribute)) stored.set(attribute, current);
          element.setAttribute(attribute, language === "en" ? stored.get(attribute)! : translateText(stored.get(attribute)!, language));
        }
        originalAttributes.current.set(element, stored);
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    };

    apply();
    return () => observer.disconnect();
  }, [language]);

  return null;
}
