// SPDX-License-Identifier: MIT
// Writes registry.json: the file that a zerodot admin adds in System > Nodes > Community registries.
// It lists each package in packages/*. Run: `pnpm run registry` (it builds the packages first).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const settings = readJson(join(root, "package.json")).zerodot?.registry ?? {};
if (!settings.name) throw new Error('Set "zerodot.registry.name" in the root package.json');

// zerodot installs a community package only when npm has this exact checksum for the version.
const npmRegistry = (process.env.ZERODOT_NPM_REGISTRY || "https://registry.npmjs.org").replace(
  /\/+$/,
  "",
);
async function integrityOf(name, version) {
  const response = await fetch(`${npmRegistry}/${name.replace("/", "%2f")}`);
  const packument = response.ok ? await response.json() : null;
  const integrity = packument?.versions?.[version]?.dist?.integrity;
  if (!integrity?.startsWith("sha512-")) {
    throw new Error(`${name}@${version} is not on npm. Publish it first, then run this again`);
  }
  return integrity;
}

const packages = [];
for (const folder of readdirSync(join(root, "packages")).sort()) {
  const dir = join(root, "packages", folder);
  const json = readJson(join(dir, "package.json"));
  if (json.private || !json.zerodot?.sdk) continue;
  if (!/^(@[^/]+\/)?zerodot-[a-z0-9]/.test(json.name)) {
    throw new Error(`${json.name}: the name without the scope must start with "zerodot-"`);
  }
  const entry = typeof json.exports === "string" ? json.exports : json.exports?.["."];
  const loaded = await import(pathToFileURL(join(dir, entry)).href);
  // The icon of the package is the icon of its first node that has one.
  const icon = loaded.nodes.find((node) => node.iconUrl || node.icon);
  packages.push({
    name: json.name,
    label: json.zerodot.label ?? json.name,
    summary: json.zerodot.summary ?? "",
    description: json.description ?? "",
    version: json.version,
    sdk: json.zerodot.sdk,
    integrity: await integrityOf(json.name, json.version),
    ...(icon?.icon ? { icon: icon.icon } : {}),
    ...(icon?.iconUrl ? { iconUrl: icon.iconUrl } : {}),
    nodes: loaded.nodes.map((node) => ({
      type: node.type,
      label: node.label,
      ...(node.description ? { description: node.description } : {}),
    })),
  });
}

const registry = {
  name: settings.name,
  ...(settings.homepage ? { homepage: settings.homepage } : {}),
  packages,
};
writeFileSync(join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`registry.json: ${packages.length} package(s)`);
