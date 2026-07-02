#!/usr/bin/env node

const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../docs/lighthouse');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runLighthouse() {
  let chrome;

  try {
    console.log(`🚀 Starting Chrome...`);
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

    console.log(`🔍 Running Lighthouse audit on ${URL}...`);

    const options = {
      logLevel: 'info',
      output: ['json', 'html'],
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const runnerResult = await lighthouse(URL, options);

    // Save JSON report
    const jsonPath = path.join(OUTPUT_DIR, `lighthouse-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(runnerResult.lhr, null, 2));
    console.log(`✅ JSON report saved: ${jsonPath}`);

    // Save HTML report
    const htmlPath = path.join(OUTPUT_DIR, `lighthouse-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, runnerResult.report[1]);
    console.log(`✅ HTML report saved: ${htmlPath}`);

    // Print scores
    console.log(`\n📊 Lighthouse Scores:\n`);
    const lhr = runnerResult.lhr;

    console.log(`  Performance:      ${lhr.categories.performance.score * 100}/100`);
    console.log(`  Accessibility:    ${lhr.categories.accessibility.score * 100}/100`);
    console.log(`  Best Practices:   ${lhr.categories['best-practices'].score * 100}/100`);
    console.log(`  SEO:              ${lhr.categories.seo.score * 100}/100`);

    const avgScore = Object.values(lhr.categories).reduce((sum, cat) => sum + cat.score, 0) / Object.keys(lhr.categories).length;
    console.log(`\n  📈 Average: ${Math.round(avgScore * 100)}/100\n`);

    // Audit details
    console.log(`\n⚠️  Key Audits:\n`);
    lhr.audits['largest-contentful-paint'] && console.log(`  LCP: ${lhr.audits['largest-contentful-paint'].displayValue}`);
    lhr.audits['cumulative-layout-shift'] && console.log(`  CLS: ${lhr.audits['cumulative-layout-shift'].displayValue}`);
    lhr.audits['first-input-delay'] && console.log(`  INP: ${lhr.audits['first-input-delay'].displayValue || 'N/A'}`);

    await chrome.kill();
    process.exit(0);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (chrome) {
      await chrome.kill();
    }
    process.exit(1);
  }
}

// Check if server is running
async function waitForServer(attempts = 10) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(`${URL}/`);
      if (response.ok || response.status === 307) {
        console.log(`✅ Server is ready\n`);
        return true;
      }
    } catch (err) {
      // Server not ready
    }
    if (i < attempts - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.error(`❌ Server did not respond at ${URL}`);
  console.error(`Run: npm run dev`);
  process.exit(1);
}

// Main
(async () => {
  await waitForServer();
  await runLighthouse();
})();
