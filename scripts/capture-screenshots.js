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

async function captureScreenshots() {
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
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    );

    console.log(`📱 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for animations
    await new Promise(r => setTimeout(r, 2000));

    // Desktop screenshot (1440x900)
    console.log(`📷 Capturing desktop screenshot (1440x900)...`);
    await page.setViewport({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'PR2_desktop.png'),
      fullPage: true,
    });
    console.log(`✅ Saved: PR2_desktop.png`);

    // Mobile screenshot (375x812)
    console.log(`📱 Capturing mobile screenshot (375x812)...`);
    await page.setViewport({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'PR2_mobile.png'),
      fullPage: true,
    });
    console.log(`✅ Saved: PR2_mobile.png`);

    console.log(`\n✨ Screenshots saved to ${OUTPUT_DIR}`);
    console.log(`  - PR2_desktop.png (1440x900)`);
    console.log(`  - PR2_mobile.png (375x812)`);

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
  await captureScreenshots();
})();
