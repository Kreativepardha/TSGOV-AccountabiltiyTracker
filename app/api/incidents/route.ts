import { loadIncidents } from "@/lib/content"

export const dynamic = "force-static"

export async function GET() {
  const incidents = await loadIncidents()
  return Response.json(
    {
      meta: {
        generated: new Date().toISOString(),
        count: incidents.length,
        license: "CC-BY-4.0",
        source: "https://tsgov.in",
      },
      data: incidents,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  )
}
