const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");

const url = process.argv[2] || "https://storeops.tech";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pagesToScan = [url, `${url}/login`, `${url}/signup`];

  for (const target of pagesToScan) {
    console.log(`\n=== Scanning: ${target} ===`);
    try {
      await page.goto(target, { waitUntil: "networkidle", timeout: 30000 });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "best-practice"])
        .analyze();

      if (results.violations.length === 0) {
        console.log("  No violations found.");
      } else {
        for (const v of results.violations) {
          console.log(`\n  [${v.impact?.toUpperCase()}] ${v.id} — ${v.description}`);
          console.log(`  Help: ${v.helpUrl}`);
          for (const node of v.nodes) {
            console.log(`    • ${node.html.slice(0, 150)}`);
            const fix = node.failureSummary?.split("\n").slice(0, 2).join(" ") ?? "";
            console.log(`      Fix: ${fix}`);
          }
        }
      }
      console.log(`\n  Passes: ${results.passes.length}  Violations: ${results.violations.length}  Incomplete: ${results.incomplete.length}`);
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }

  await browser.close();
})();
