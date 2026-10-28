// SPDX-License-Identifier: MIT
// Writes registry.json: the file that a zerodot admin adds in System > Nodes > Community registries.
// Run: `pnpm run registry` (it builds the package first).
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const json = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const entry = typeof json.exports === "string" ? json.exports : json.exports?.["."];
const loaded = await import(pathToFileURL(join(root, entry)).href);
// The icon of the package is the icon of its first node that has one.
const icon = loaded.nodes.find((node) => node.iconUrl || node.icon);

const registry = {
  name: json.zerodot.label ?? json.name,
  ...(json.homepage ? { homepage: json.homepage } : {}),
  packages: [
    {
      name: json.name,
      label: json.zerodot.label ?? json.name,
      summary: json.zerodot.summary ?? "",
      description: json.description ?? "",
      version: json.version,
      sdk: json.zerodot.sdk,
      ...(icon?.icon ? { icon: icon.icon } : {}),
      ...(icon?.iconUrl ? { iconUrl: icon.iconUrl } : {}),
      nodes: loaded.nodes.map((node) => ({
        type: node.type,
        label: node.label,
        ...(node.description ? { description: node.description } : {}),
      })),
    },
  ],
};

writeFileSync(join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
console.log(`registry.json: ${json.name}@${json.version}`);
