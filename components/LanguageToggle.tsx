"use client"

import { useTranslation } from "./TranslationProvider"

export function LanguageToggle() {
  const { lang, setLang } = useTranslation()
  return (
    <button
      onClick={() => setLang(lang === "en" ? "te" : "en")}
      className="text-xs font-medium px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
      title={lang === "en" ? "Switch to Telugu" : "Switch to English"}
    >
      {lang === "en" ? "తె" : "EN"}
    </button>
  )
}
