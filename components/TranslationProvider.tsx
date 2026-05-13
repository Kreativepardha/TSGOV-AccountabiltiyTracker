"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, type Lang, type TranslationKey } from "@/lib/translations"

type TranslationContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
})

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")
  const t = (key: TranslationKey) => translations[lang][key]
  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}
