"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/track-visit", { method: "POST" }).catch(() => {
      // silently ignore — DB may not be set up in local dev
    })
  }, [pathname])

  return null
}
