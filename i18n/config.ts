import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import ml from "./locales/ml.json";
import te from "./locales/te.json";
import kn from "./locales/kn.json";
import mr from "./locales/mr.json";
import bn from "./locales/bn.json";
import gu from "./locales/gu.json";
import pa from "./locales/pa.json";
import or from "./locales/or.json";
import ur from "./locales/ur.json";

export const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  ml: { translation: ml },
  te: { translation: te },
  kn: { translation: kn },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  ur: { translation: ur },
} as const;

export type SupportedLanguage = keyof typeof resources;

export const supportedLanguages: { code: SupportedLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "hi", label: "हिन्दी" },
  { code: "ml", label: "മലയാളം" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "mr", label: "मराठी" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "ur", label: "اردو" },
];

const getSavedLanguage = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || localStorage.getItem("kabadisetu-language") || "en";
  }
  return "en";
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getSavedLanguage(),
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
}

export function changeLanguage(lang: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
    localStorage.setItem("kabadisetu-language", lang);
    document.documentElement.lang = lang;
    if (lang === "ur") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }
  return i18n.changeLanguage(lang);
}

export default i18n;
