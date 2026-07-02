# Visual Validation Pipeline — Mandatory for All PRs

**Status:** ESTABLISHED (Starting PR2)  
**Last Updated:** 2026-06-30  
**Applies to:** All Future PRs (PR2+)

---

## Overview

Every PR that includes visual/UI changes MUST pass through this automated validation pipeline before being merged. This pipeline captures real screenshots (Desktop + Mobile), compares them against Design Pack mockups, runs build/lint verification, and generates proof of compliance.

**No visual PR can be merged without:**
- ✅ Desktop screenshot (1440×900) saved to `docs/design/previews/PR{N}_desktop.png`
- ✅ Mobile screenshot (375×812) saved to `docs/design/previews/PR{N}_mobile.png`
- ✅ Visual comparison against Design Pack mockup
- ✅ Build verification (npm run build)
- ✅ Lint verification (npm run lint)

---

## Pre-PR Checklist

Before opening a PR:

1. **Code Changes**
   - [ ] Implemented visual changes in React components
   - [ ] Used CSS tokens from `globals.css` (no hardcoded hex colors)
   - [ ] Mobile-first responsive design (`min-h-[100dvh]`, breakpoints)
   - [ ] No business logic changes

2. **Local Testing**
   - [ ] Dev server running: `npm run dev`
   - [ ] Page loads without errors (check browser console)
   - [ ] Visual appears correct at desktop (1440px)
   - [ ] Visual appears correct at mobile (375px)
   - [ ] No console errors or warnings

3. **Build & Lint**
   - [ ] Run `npm run build` — must complete successfully
   - [ ] Run `npm run lint` — no NEW errors introduced

---

## The Validation Pipeline (Automated)

### Step 1: Server Health Check

**Script:** `scripts/wait-for-dev.sh`

```bash
./scripts/wait-for-dev.sh 3000
```

**What it does:**
- Polls `http://localhost:3000` for HTTP 200/307 response
- Waits max 30 seconds
- Exits with success only when server is fully ready

**Why:**
- Prevents screenshot capture on a server that's still booting
- Eliminates blank/black screenshot artifacts

---

### Step 2: Capture Screenshots

**Script:** `scripts/capture-screenshots.js`

```bash
node scripts/capture-screenshots.js
```

**What it does:**
- Launches Puppeteer headless browser
- Navigates to http://localhost:3000
- Captures viewport: **Desktop 1440×900**
- Captures viewport: **Mobile 375×812**
- Saves as PNG to `docs/design/previews/PR{N}_*.png`

**Output files:**
```
docs/design/previews/
  ├── PR2_desktop.png (1440×900, ~900-1000 KB)
  ├── PR2_mobile.png (375×812, ~300-400 KB)
  ├── PR3_desktop.png
  ├── PR3_mobile.png
  └── ...
```

---

### Step 3: Visual Comparison

**Manual (Required for Approval)**

Compare screenshots against Design Pack mockups:

1. Open Design Pack mockup:
   - Desktop: `Design Pack/02_Home/01_home_desktop_v2_full.png`
   - Mobile: `Design Pack/02_Home/02_home_mobile_v2.png`

2. Open captured screenshots:
   - Desktop: `docs/design/previews/PR{N}_desktop.png`
   - Mobile: `docs/design/previews/PR{N}_mobile.png`

3. **Checklist for Desktop:**
   - [ ] Hero section layout matches (text left, image right)
   - [ ] Headline serif font, large, prominent
   - [ ] Subheadline readable, proper spacing
   - [ ] CTA buttons (gold + navy) positioned correctly
   - [ ] Hero image rounded, has shadow
   - [ ] Trust metrics at bottom (4 columns, icons + numbers)
   - [ ] Pricing section: 3-column grid
   - [ ] Popular card stands out (navy bg + gold ring)
   - [ ] Colors match token definitions (navy, gold, warm-white)
   - [ ] Spacing and proportions match mockup

4. **Checklist for Mobile:**
   - [ ] Hero stacks vertically (image top, text below)
   - [ ] Content full width (minus padding)
   - [ ] Text readable (no small fonts)
   - [ ] Buttons full width and touch-friendly (44px+ height)
   - [ ] Trust metrics 2 columns
   - [ ] Pricing cards 1 column
   - [ ] Popular card styling preserved
   - [ ] No horizontal scroll

5. **Sign-off:**
   - Comparison complete ✅
   - Visual fidelity confirmed ✅
   - Ready for merge ✅

---

### Step 4: Build Verification

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully in X.Xs
✓ All X routes compiled
```

**If it fails:** Fix TypeScript errors or missing imports before proceeding.

---

### Step 5: Lint Verification

```bash
npm run lint
```

**Expected output:**
```
XX problems (X errors, X warnings)
```

**Rule:** No NEW errors introduced by this PR. Pre-existing issues are acceptable.

---

## Full Pipeline Script (Automated)

**File:** `scripts/validate-pr.sh`

```bash
#!/bin/bash
set -e

PR_NUMBER=${1:-2}

echo "🚀 Validating PR$PR_NUMBER..."

# Step 1: Check server
echo "▶️  Step 1: Waiting for server..."
./scripts/wait-for-dev.sh 3000 || exit 1

# Step 2: Capture screenshots
echo "▶️  Step 2: Capturing screenshots..."
node scripts/capture-screenshots.js || exit 1

# Step 3: Build
echo "▶️  Step 3: Running build..."
npm run build || exit 1

# Step 4: Lint
echo "▶️  Step 4: Running lint..."
npm run lint || exit 1

echo "✅ All validations passed!"
echo ""
echo "Next steps:"
echo "1. Compare screenshots:"
echo "   - Desktop: docs/design/previews/PR${PR_NUMBER}_desktop.png"
echo "   - Mobile: docs/design/previews/PR${PR_NUMBER}_mobile.png"
echo "2. Against Design Pack mockups"
echo "3. Sign off in PR description when visual match confirmed"
```

---

## Running the Pipeline (Step-by-Step)

### Local Development

```bash
# 1. Make your visual changes
# 2. Test locally: npm run dev
# 3. In new terminal, run validation:

npm run dev  # Terminal 1 — keeps server running

# Terminal 2:
./scripts/validate-pr.sh 2

# Output:
# ✅ Captured PR2_desktop.png
# ✅ Captured PR2_mobile.png
# ✅ Build passed
# ✅ Lint passed
# 
# Next: Compare screenshots vs Design Pack
```

### Visual Comparison

```bash
# After screenshots are captured:
open docs/design/previews/PR2_desktop.png
open "Design Pack/02_Home/01_home_desktop_v2_full.png"

# Compare side-by-side, verify checklist items
# Take notes on any discrepancies
```

### PR Description Template

```markdown
## PR{N}: [Component Changes]

### Visual Validation ✅

- [x] Desktop screenshot captured
- [x] Mobile screenshot captured
- [x] Screenshots compared to Design Pack
- [x] Visual match confirmed
- [x] Build: PASS
- [x] Lint: PASS (X new, Y pre-existing)

### Screenshots

**Desktop (1440×900):**
[Embed or link to docs/design/previews/PR{N}_desktop.png]

**Mobile (375×812):**
[Embed or link to docs/design/previews/PR{N}_mobile.png]

### Design Alignment

[Describe which sections match Design Pack and any notes]

### Implementation Notes

[List files changed, component structure, token usage]
```

---

## Design Pack Reference

**Location:** `Design Pack/` directory

**Key files for validation:**
- `02_Home/01_home_desktop_v2_full.png` — Full desktop mockup
- `02_Home/02_home_mobile_v2.png` — Full mobile mockup

**What they show:**
- Hero section (text left + image right)
- Pricing grid (3 columns on desktop)
- Trust metrics
- Color palette (navy, gold, warm-white)
- Typography (serif headlines, sans-serif body)
- Spacing and proportions

---

## File Structure

```
/Users/Juan/Desktop/esim-europa/
├── docs/
│   ├── design/
│   │   ├── previews/
│   │   │   ├── PR2_desktop.png
│   │   │   ├── PR2_mobile.png
│   │   │   ├── PR3_desktop.png
│   │   │   ├── PR3_mobile.png
│   │   │   └── ...
│   │   ├── VALIDATION_PIPELINE.md (this file)
│   │   └── ...
│   └── ...
├── scripts/
│   ├── wait-for-dev.sh (server health check)
│   ├── capture-screenshots.js (Puppeteer screenshot tool)
│   └── validate-pr.sh (full pipeline)
├── src/
│   ├── app/
│   │   └── globals.css (design tokens)
│   └── components/
│       └── ... (UI components)
└── ...
```

---

## Debugging

### Blank Screenshots

**Symptom:** `PR2_desktop.png` is solid black or blank

**Causes:**
1. Server not running — check `npm run dev` is active
2. Server on wrong port — verify localhost:3000
3. Page loading JavaScript — wait for `networkidle2`
4. Browser window off-screen — Puppeteer headless mode issue

**Fix:**
```bash
# Verify server
curl -I http://localhost:3000

# Restart dev server
npm run dev

# Run screenshot script
node scripts/capture-screenshots.js
```

### Comparison Mismatch

**Symptom:** Screenshots don't match Design Pack

**Steps:**
1. Verify component code uses correct CSS tokens
2. Check responsive breakpoints (mobile 375px, desktop 1440px)
3. Inspect browser console for layout errors
4. Compare spacing, fonts, colors against `globals.css` tokens
5. Re-run build + lint to catch errors

---

## CI/CD Integration (Future)

When CI/CD is set up, this pipeline should run automatically on every PR:

```yaml
# .github/workflows/validate-visual.yml
name: Visual Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run dev &
      - run: ./scripts/wait-for-dev.sh 3000
      - run: node scripts/capture-screenshots.js
      - run: npm run build
      - run: npm run lint
      
      - uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: docs/design/previews/PR${{ github.event.pull_request.number }}_*.png
```

---

## Status

✅ **Pipeline ESTABLISHED**

- [x] `wait-for-dev.sh` created
- [x] `capture-screenshots.js` created
- [x] Documentation written
- [x] Process tested (PR2)
- [x] Ready for all future PRs

---

## Next PRs

For **PR3** onwards:

1. Implement visual changes
2. Run `./scripts/validate-pr.sh 3`
3. Compare screenshots vs Design Pack
4. Update PR description with screenshots
5. Get approval before merging

No exceptions — **all visual PRs must pass this pipeline.**

---

**Approved by:** User  
**Date:** 2026-06-30  
**Version:** 1.0
