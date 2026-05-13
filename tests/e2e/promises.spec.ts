import { test, expect } from "@playwright/test"

test("promises page loads and shows table", async ({ page }) => {
  await page.goto("/promises")
  await expect(page.getByText("Poll Promises Tracker")).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()
})

test("search filter narrows results", async ({ page }) => {
  await page.goto("/promises")
  await page.getByPlaceholder("Search promises...").fill("Mahalakshmi")
  await expect(page.getByText("Mahalakshmi", { exact: false })).toBeVisible()
})

test("promise detail page renders", async ({ page }) => {
  await page.goto("/promises/mahalakshmi-bus-pass")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.getByText("Sources")).toBeVisible()
})

test("stat cards show numbers", async ({ page }) => {
  await page.goto("/promises")
  await expect(page.getByText("Total")).toBeVisible()
  await expect(page.getByText("Fulfilled")).toBeVisible()
})
