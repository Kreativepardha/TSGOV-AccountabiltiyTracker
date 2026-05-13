import { loadPromises } from "@/lib/content"

export const dynamic = "force-static"

export async function GET() {
  const promises = await loadPromises()
  return Response.json(
    {
      meta: {
        generated: new Date().toISOString(),
        count: promises.length,
        license: "CC-BY-4.0",
        source: "https://tsgov.in",
      },
      data: promises,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  )
}
