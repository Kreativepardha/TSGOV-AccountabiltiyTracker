import { SearchBar } from "@/components/SearchBar"

export const metadata = { title: "Search" }

export default function SearchPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">
          Search across all promises and incidents. Results are filtered locally — no data
          is sent to any server.
        </p>
      </div>
      <SearchBar />
    </main>
  )
}
