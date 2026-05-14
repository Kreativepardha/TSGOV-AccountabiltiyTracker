/**
 * NVIDIA NIM classifier — uses Qwen3 to classify discovered articles
 * as promise/incident/unknown, suggest category and evidence_grade.
 *
 * Free tier: https://build.nvidia.com — set NVIDIA_API_KEY env var.
 */

const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const DEFAULT_MODEL = "qwen/qwen3.5-397b-a17b"

const SYSTEM_PROMPT = `You are a classifier for a Telangana government accountability tracker.
Given a news article (title + excerpt), output ONLY valid JSON in this exact shape:
{
  "type": "promise" | "incident" | "unknown",
  "category": "<one of: Welfare, Employment, Agriculture, Infrastructure, Education, Health, Women & Child, Housing, Finance, Governance>" | null,
  "evidence_grade": "<one of: Official Record, Primary Evidence, Multiple Sources, Single Source, Allegation>",
  "reasoning": "<one short sentence>"
}

Rules:
- "promise" = government announcement of new scheme, target, deadline, or commitment
- "incident" = governance failure: delay, scam, protest, missed deadline, infrastructure failure
- "unknown" = neither
- Default evidence_grade for news_article source is "Single Source"; for 3+ independent reports use "Multiple Sources"; for govt orders use "Official Record"
- Output JSON only. No markdown fences. No explanation outside the JSON.`

export type Classification = {
  type: "promise" | "incident" | "unknown"
  category: string | null
  evidence_grade: string
  reasoning: string
}

export async function classifyArticle(
  title: string,
  excerpt: string
): Promise<Classification | null> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    console.warn("[nvidia-classify] NVIDIA_API_KEY not set — skipping LLM classification")
    return null
  }

  const model = process.env.NVIDIA_MODEL ?? DEFAULT_MODEL
  const userMessage = `Title: ${title}\n\nExcerpt: ${excerpt.slice(0, 1500)}`

  try {
    const res = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 200,
        stream: false,
      }),
    })

    if (!res.ok) {
      console.warn(`[nvidia-classify] ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content as string | undefined
    if (!text) return null

    const cleaned = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return {
      type: parsed.type,
      category: parsed.category,
      evidence_grade: parsed.evidence_grade,
      reasoning: parsed.reasoning ?? "",
    }
  } catch (e) {
    console.warn("[nvidia-classify] error:", (e as Error).message)
    return null
  }
}
