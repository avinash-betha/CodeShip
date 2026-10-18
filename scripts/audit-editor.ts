import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto("http://127.0.0.1:4200");
await page.getByText("All changes saved").waitFor();
const results = await new AxeBuilder({ page })
  .setLegacyMode()
  .options({ iframes: false })
  .analyze();
console.log(
  JSON.stringify(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        message: n.failureSummary,
      })),
    })),
    null,
    2,
  ),
);
await browser.close();
