import { Page } from "@playwright/test";

export async function forceDark(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } catch (e) {
      console.log("Could not set dark theme:", e);
    }
  });
}
