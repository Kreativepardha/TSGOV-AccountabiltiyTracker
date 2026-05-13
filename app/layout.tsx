import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/Nav"
import { TranslationProvider } from "@/components/TranslationProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "TSGOV Accountability Tracker",
    template: "%s — TSGOV Accountability Tracker",
  },
  description:
    "A non-partisan public archive tracking Telangana government promises, incidents, and governance outcomes. Every claim is sourced, evidence-graded, and open to correction.",
  metadataBase: new URL("https://tsgov.in"),
  openGraph: {
    siteName: "TSGOV Accountability Tracker",
    type: "website",
    locale: "en_IN",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <Nav />
          <div className="min-h-screen">{children}</div>
          <footer className="border-t mt-16 py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <p>
                TSGOV Accountability Tracker — non-partisan public archive.
                All content sourced and evidence-graded.
              </p>
              <div className="flex gap-4 flex-wrap items-center">
                <a href="/feed.xml" className="underline hover:text-foreground">RSS Feed</a>
                <a href="/api/promises" className="underline hover:text-foreground">API</a>
                <a
                  href="https://github.com/your-org/tsgov/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Report an error
                </a>
                <a href="/about" className="underline hover:text-foreground">
                  About & Editorial Policy
                </a>
              </div>
            </div>
          </footer>
        </TranslationProvider>
      </body>
    </html>
  )
}
