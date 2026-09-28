// One-off conversion script for the FASE 4B email hero assets.
// Source: handoff/assets/*.png (Design Masters, approved, do not regenerate).
// Output: public/email/*.jpg — no crop/composition change, only format +
// resize + compression for email delivery.
//
// Run once: node scripts/convert-email-assets.mjs
// Safe to delete after the assets are committed — it has no runtime role.

import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";

const SRC_DIR = "/tmp/claude-0/-home-user-esim-europa/3a8cb94f-a350-50cc-baa1-8ad5ecc22c4c/scratchpad/handoff-review/handoff/assets";
const OUT_DIR = path.resolve("public/email");

const ASSETS = [
  "ruta34-hero-email1.png",
  "ruta34-hero-email2.png",
  "ruta34-hero-email3.png",
  "ruta34-hero-email4.png",
  "ruta34-hero-final.png",
];

mkdirSync(OUT_DIR, { recursive: true });

for (const file of ASSETS) {
  const srcPath = path.join(SRC_DIR, file);
  const outFile = file.replace(/\.png$/, ".jpg");
  const outPath = path.join(OUT_DIR, outFile);

  const image = sharp(srcPath);
  const meta = await image.metadata();

  await image
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .withMetadata({}) // strip EXIF but keep the pipeline sRGB-safe default
    .toColorspace("srgb")
    .toFile(outPath);

  const outStat = statSync(outPath);
  const outMeta = await sharp(outPath).metadata();
  console.log(
    `${file} (${meta.width}x${meta.height}, ${(statSync(srcPath).size / 1024).toFixed(0)} KB) -> ` +
    `${outFile} (${outMeta.width}x${outMeta.height}, ${(outStat.size / 1024).toFixed(0)} KB)`
  );
}
