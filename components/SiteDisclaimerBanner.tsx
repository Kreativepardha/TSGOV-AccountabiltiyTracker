"use client"

import { useTranslation } from "./TranslationProvider"

const CONTRIBUTE_URL =
  "https://github.com/Kreativepardha/TSGOV-AccountabiltiyTracker"

export function SiteDisclaimerBanner() {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      className="border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-xs leading-snug text-amber-950 sm:text-sm"
    >
      <p className="mx-auto max-w-5xl">
        <span>{t("site_disclaimer")} </span>
        <span>{t("site_disclaimer_help_prefix")}</span>
        <a
          href={CONTRIBUTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-amber-900 underline decoration-amber-700/60 underline-offset-2 hover:text-amber-800"
        >
          {t("site_disclaimer_help_link")}
        </a>
        <span>{t("site_disclaimer_help_suffix")}</span>
      </p>
    </div>
  )
}
