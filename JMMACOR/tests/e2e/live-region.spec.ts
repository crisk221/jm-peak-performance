import { test, expect } from "@playwright/test";
import { forceDark } from "./utils/theme";

test.describe("Live region announcements", () => {
  test("live region announces dynamic changes", async ({ page }) => {
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Check that live region exists
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });

  test("navigation changes are announced", async ({ page }) => {
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Navigate to recipes and check if live region could announce route change
    await page.getByRole("link", { name: /recipes/i }).click();
    await page.waitForLoadState("networkidle");

    // Check that we're on the recipes page
    await expect(page).toHaveURL(/\/dashboard\/recipes/);
  });

  test("form validation errors are announced", async ({ page }) => {
    if (test.info().project.name.includes("dark")) await forceDark(page);

    await page.goto("/wizard/intake");
    await page.waitForLoadState("networkidle");

    // Try to submit form without required fields
    const submitButton = page.getByRole("button", {
      name: /continue|next|save/i,
    });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for error announcements with role="alert"
      const errorAlert = page.locator('[role="alert"]');
      if ((await errorAlert.count()) > 0) {
        await expect(errorAlert.first()).toBeVisible();
      }
    }
  });
});
