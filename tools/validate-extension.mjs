import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const requiredFiles = [
  "manifest.json",
  "src/background.js",
  "src/content-script.js",
  "src/sidepanel.html",
  "src/sidepanel.css",
  "src/sidepanel.js",
  "icons/icon16.png",
  "icons/icon32.png",
  "icons/icon48.png",
  "icons/icon128.png"
];

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));

if (manifest.manifest_version !== 3) {
  throw new Error("manifest_version must be 3");
}

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

for (const file of ["src/background.js", "src/content-script.js", "src/sidepanel.js"]) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Extension check passed.");
