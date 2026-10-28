// SPDX-License-Identifier: MIT
import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { credentialTypes, nodes } from "./index";

const signal = new AbortController().signal;

function node(type: string) {
  const definition = nodes.find((entry) => entry.type === type);
  if (!definition) throw new Error(`missing ${type}`);
  return definition;
}

const run = async (
  type: string,
  config: Record<string, unknown>,
  input: unknown,
  credential: { type: string; data: Record<string, unknown> } | null = null,
) =>
  await node(type).run({
    config: node(type).config.parse(config),
    input,
    credential,
    signal,
    scope: {},
    sandbox: null,
    tables: null,
  });

afterEach(() => mock.restoreAll());

describe("package", () => {
  it("has an icon on each node and credential type", () => {
    for (const item of [...nodes, ...credentialTypes]) {
      assert.match(item.iconUrl ?? "", /^data:image\/svg\+xml/);
    }
  });

  it("has a default config that fits the schema of each node", () => {
    for (const item of nodes) assert.doesNotThrow(() => item.config.parse(item.defaultConfig));
  });
});

describe("Text Case", () => {
  it("changes the case of the field", async () => {
    const input = { text: "hello big world", id: 1 };
    assert.deepEqual(await run("example.textCase", { case: "upper" }, input), {
      port: "main",
      data: { text: "HELLO BIG WORLD", id: 1 },
    });
    const title = await run("example.textCase", { case: "title" }, input);
    assert.equal((title.data as { text: string }).text, "Hello Big World");
  });

  it("refuses a field that is not text", async () => {
    await assert.rejects(run("example.textCase", {}, { text: 4 }), /not text/);
  });
});

describe("Example API Request", () => {
  const credential = { type: "example.api", data: { baseUrl: "https://api.test", token: "T0K" } };

  it("sends the token and returns the JSON", async () => {
    const calls: { url: string; auth: string | null }[] = [];
    mock.method(globalThis, "fetch", async (url: URL, init: RequestInit) => {
      calls.push({ url: String(url), auth: new Headers(init.headers).get("authorization") });
      return Response.json({ ok: true });
    });
    const result = await run("example.apiRequest", { path: "/users" }, null, credential);
    assert.deepEqual(result, { port: "main", data: { ok: true } });
    assert.deepEqual(calls, [{ url: "https://api.test/users", auth: "Bearer T0K" }]);
  });

  it("needs a credential", async () => {
    await assert.rejects(run("example.apiRequest", {}, null), /Pick an Example API credential/);
  });
});
