"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Scale } from "lucide-react"
import { LanguageToggle } from "./LanguageToggle"

const NAV_LINKS = [
  { href: "/promises",   label: "Promises" },
  { href: "/incidents",  label: "Incidents" },
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/calendar",   label: "Calendar" },
  { href: "/compare",    label: "Compare" },
  { href: "/timeline",   label: "Timeline" },
  { href: "/search",     label: "Search" },
  { href: "/about",      label: "About" },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <Scale className="h-5 w-5 text-blue-600" />
          <span className="hidden sm:block">TSGOV Accountability Tracker</span>
          <span className="sm:hidden">TSGOV</span>
        </Link>
        <nav className="hidden lg:flex gap-5 flex-1 justify-center">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors hover:text-foreground ${
                pathname.startsWith(l.href)
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            className="lg:hidden p-2"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t px-4 py-3 flex flex-col gap-3 bg-white">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
