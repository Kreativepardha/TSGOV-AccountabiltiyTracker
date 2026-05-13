import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = { title: "Admin — TSGOV" }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 h-12 flex items-center gap-3">
        <ShieldCheck className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold">TSGOV Admin</span>
        <nav className="flex gap-4 ml-4 text-xs text-gray-300">
          <Link href="/admin" className="hover:text-white">Overview</Link>
          <Link href="/admin/discoveries" className="hover:text-white">Discovery Queue</Link>
        </nav>
        <div className="ml-auto">
          <Link href="/" className="text-xs text-gray-400 hover:text-white">← Public site</Link>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
