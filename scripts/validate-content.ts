import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "../lib/schemas"

let errors = 0

function validate() {
  const promisesDir = path.join(process.cwd(), "content/promises")
  if (fs.existsSync(promisesDir)) {
    for (const file of fs.readdirSync(promisesDir).filter(f => f.endsWith(".json"))) {
      const filePath = path.join(promisesDir, file)
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"))
        const result = GovernmentPromiseSchema.safeParse(raw)
        if (!result.success) {
          console.error(`❌ content/promises/${file}:`)
          console.error(JSON.stringify(result.error.flatten(), null, 2))
          errors++
        } else {
          console.log(`✅ content/promises/${file}`)
        }
      } catch (e) {
        console.error(`❌ content/promises/${file}: Parse error —`, e)
        errors++
      }
    }
  }

  const incidentsDir = path.join(process.cwd(), "content/incidents")
  if (fs.existsSync(incidentsDir)) {
    for (const file of fs.readdirSync(incidentsDir).filter(f => f.endsWith(".md"))) {
      const filePath = path.join(incidentsDir, file)
      try {
        const { data } = matter(fs.readFileSync(filePath, "utf-8"))
        const result = IncidentFrontmatterSchema.safeParse(data)
        if (!result.success) {
          console.error(`❌ content/incidents/${file}:`)
          console.error(JSON.stringify(result.error.flatten(), null, 2))
          errors++
        } else {
          console.log(`✅ content/incidents/${file}`)
        }
      } catch (e) {
        console.error(`❌ content/incidents/${file}: Parse error —`, e)
        errors++
      }
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} validation error(s). Fix before merging.`)
    process.exit(1)
  } else {
    console.log("\nAll content valid ✅")
  }
}

validate()
