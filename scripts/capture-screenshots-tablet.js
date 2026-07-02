#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../docs/design/previews');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureTabletScreenshot() {
  let browser;

  try {
    console.log(`🎬 Launching browser...`);
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X) AppleWebKit/605.1.15'
    );

    console.log(`📱 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for animations
    await new Promise(r => setTimeout(r, 2000));

    // Tablet screenshot (768x1024)
    console.log(`📷 Capturing tablet screenshot (768x1024)...`);
    await page.setViewport({ width: 768, height: 1024 });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'PR2_tablet.png'),
      fullPage: true,
    });
    console.log(`✅ Saved: PR2_tablet.png`);

    console.log(`\n✨ Tablet screenshot saved to ${OUTPUT_DIR}`);
    console.log(`  - PR2_tablet.png (768x1024)`);

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (browser) await browser.close();
    process.exit(1);
  }
}

// Check server is ready first
async function waitForServer(attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/`, { method: 'HEAD' });
      if (response.ok || response.status === 307) {
        console.log(`✅ Server is ready`);
        return true;
      }
    } catch (err) {
      // Server not ready yet
    }
    if (i < attempts - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.error(`❌ Server did not respond after ${attempts}s`);
  process.exit(1);
}

// Main
(async () => {
  await waitForServer();
  await captureTabletScreenshot();
})();
