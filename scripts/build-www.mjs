// Copies the web app into www/ (the folder the iOS and Android apps load)
// and bundles the native helpers, which only the store apps use.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

rmSync("www", { recursive: true, force: true });
mkdirSync("www", { recursive: true });
for (const f of ["manifest.webmanifest", "privacy.html", "terms.html"]) cpSync(f, `www/${f}`);
for (const d of ["icons", "vendor"]) cpSync(d, `www/${d}`, { recursive: true });

await build({ entryPoints: ["src/native.js"], bundle: true, minify: true, format: "iife", target: ["safari15", "chrome100"], outfile: "www/native.js" });

let html = readFileSync("index.html", "utf8");
const hook = '<script src="vendor/xlsx.full.min.js" defer></script>';
if (!html.includes(hook)) throw new Error("index.html changed: script hook not found");
html = html.replace(hook, '<script src="native.js"></script>\n' + hook);
writeFileSync("www/index.html", html);
console.log("www/ ready");
