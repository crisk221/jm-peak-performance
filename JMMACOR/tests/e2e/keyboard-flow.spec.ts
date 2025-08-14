import { test, expect } from "@playwright/test";
import { forceDark } from "./utils/theme";

test.describe("Keyboard flow & skip link", () => {
  test("tab order header → nav → content, skip link works", async ({
    page,
  }) => {
    // Check if we're in dark mode project by looking at page config
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/dashboard/recipes");
    await page.waitForLoadState("networkidle");

    // Focus the page and Tab to reveal skip link
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: /skip to.*content/i });
    await expect(skip).toBeVisible();

    // Click the skip link
    await skip.press("Enter");

    // Focus should move to <main id="main">
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("dashboard navigation keyboard accessibility", async ({ page }) => {
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Tab through navigation items
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // First nav item

    const overviewLink = page.getByRole("link", { name: /overview/i });
    await expect(overviewLink).toBeFocused();

    // Tab to next navigation item
    await page.keyboard.press("Tab");
    const recipesLink = page.getByRole("link", { name: /recipes/i });
    await expect(recipesLink).toBeFocused();
  });

  test("form inputs maintain focus order", async ({ page }) => {
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/wizard/intake");
    await page.waitForLoadState("networkidle");

    // Tab to first input
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Should reach first form input

    const nameInput = page.getByRole("textbox", { name: /full name/i });
    await expect(nameInput).toBeFocused();
  });
});
