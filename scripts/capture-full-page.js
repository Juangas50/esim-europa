const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const PREVIEWSDIR = path.join(__dirname, "../docs/design/previews");

async function captureFullPage() {
  let browser;
  try {
    // Health check
    const healthResponse = await fetch("http://localhost:3000", { timeout: 5000 });
    if (!healthResponse.ok) throw new Error(`Health check failed: ${healthResponse.status}`);
    console.log("✅ Server is ready");

    browser = await puppeteer.launch({ headless: "new" });
    console.log("🎬 Launching browser...");

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // Desktop full-page
    await page.setViewport({ width: 1440, height: 900 });
    console.log("📱 Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000)); // Wait for animations

    console.log("📷 Capturing full-page desktop...");
    const desktopPath = path.join(PREVIEWSDIR, "PR5.1_desktop_fullpage.png");
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`✅ Saved: ${path.basename(desktopPath)}`);

    // Mobile full-page
    await page.setViewport({ width: 375, height: 812 });
    console.log("📱 Navigating to http://localhost:3000 (mobile)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    console.log("📷 Capturing full-page mobile...");
    const mobilePath = path.join(PREVIEWSDIR, "PR5.1_mobile_fullpage.png");
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`✅ Saved: ${path.basename(mobilePath)}`);

    // Tablet full-page
    await page.setViewport({ width: 768, height: 1024 });
    console.log("📱 Navigating to http://localhost:3000 (tablet)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));

    console.log("📷 Capturing full-page tablet...");
    const tabletPath = path.join(PREVIEWSDIR, "PR5.1_tablet_fullpage.png");
    await page.screenshot({ path: tabletPath, fullPage: true });
    console.log(`✅ Saved: ${path.basename(tabletPath)}`);

    await browser.close();
    console.log("\n✨ Full-page screenshots saved to " + PREVIEWSDIR);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

captureFullPage();
