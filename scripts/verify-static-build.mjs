import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const assetsDir = join(distDir, "assets");
const expectedBasePath = normalizeBasePath(process.env.VITE_BASE_PATH);

const failures = [];

if (!existsSync(indexPath)) {
  failures.push("dist/index.html is missing.");
}

if (!existsSync(assetsDir) || !statSync(assetsDir).isDirectory()) {
  failures.push("dist/assets directory is missing.");
}

const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const hasJavaScript = assets.some((asset) => asset.endsWith(".js"));
const hasCss = assets.some((asset) => asset.endsWith(".css"));

if (!hasJavaScript) {
  failures.push("dist/assets does not contain a JavaScript bundle.");
}

if (!hasCss) {
  failures.push("dist/assets does not contain a CSS bundle.");
}

if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, "utf8");
  const assetReferences = Array.from(
    html.matchAll(/\b(?:href|src)="([^"]+)"/g),
    (match) => match[1],
  ).filter((reference) => reference.includes("/assets/"));

  if (assetReferences.length === 0) {
    failures.push("dist/index.html does not reference built assets.");
  }

  for (const reference of assetReferences) {
    if (!reference.startsWith(`${expectedBasePath}assets/`)) {
      failures.push(
        `Asset reference ${reference} does not use expected base path ${expectedBasePath}.`,
      );
    }
  }

  if (html.includes("/src/")) {
    failures.push("dist/index.html still references source files.");
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Static build verified in dist/ with base path ${expectedBasePath}`);

function normalizeBasePath(rawBasePath) {
  const basePath = rawBasePath?.trim();

  if (!basePath || basePath === "/") {
    return "/";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}
