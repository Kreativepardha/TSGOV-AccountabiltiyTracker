import { test, expect } from "@playwright/test"

test("incidents page loads", async ({ page }) => {
  await page.goto("/incidents")
  await expect(page.getByText("Incident & Controversy Tracker")).toBeVisible()
})

test("incident cards are shown", async ({ page }) => {
  await page.goto("/incidents")
  const cards = page.locator(".border.rounded-lg")
  await expect(cards.first()).toBeVisible()
})

test("incident detail page renders", async ({ page }) => {
  await page.goto("/incidents/2024-03-fee-reimbursement-delay")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByText("Sources")).toBeVisible()
})
