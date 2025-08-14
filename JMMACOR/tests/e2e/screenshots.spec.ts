import { test, expect } from "@playwright/test";
import { forceDark } from "./utils/theme";

const pages = [
  { name: "dashboard", path: "/dashboard" },
  { name: "recipes", path: "/dashboard/recipes" },
  { name: "ingredients", path: "/dashboard/ingredients" },
  { name: "exports", path: "/dashboard/exports" },
  { name: "settings", path: "/dashboard/settings" },
  { name: "intake", path: "/wizard/intake" },
  { name: "macros", path: "/wizard/macros" },
  { name: "plan", path: "/wizard/plan" },
];

test.describe("Light/Dark screenshots", () => {
  for (const p of pages) {
    test(`light: ${p.name}`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      // Wait a bit for any animations to settle
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${p.name}-light.png`, {
        animations: "disabled",
        fullPage: true,
        threshold: 0.3, // Allow for slight differences
      });
    });

    test(`dark: ${p.name}`, async ({ page }) => {
      await forceDark(page);
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      // Wait a bit for any animations to settle
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${p.name}-dark.png`, {
        animations: "disabled",
        fullPage: true,
        threshold: 0.3, // Allow for slight differences
      });
    });
  }
});
