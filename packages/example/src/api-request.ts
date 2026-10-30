// SPDX-License-Identifier: MIT
import { defineNode } from "@zerodot/node-sdk";
import { z } from "zod";
import { ICON } from "./icon";

const config = z.object({
  path: z.string().min(1).default("/").meta({
    title: "Path",
    description: "Added to the base URL of the credential, for example /users",
  }),
});

/** A node with a credential: it calls an API and sends the JSON answer on. */
export default defineNode({
  type: "example.apiRequest",
  label: "Example API Request",
  description: "Get JSON from an API with a token",
  category: "integration",
  app: "Example",
  icon: "Globe02Icon",
  iconUrl: ICON,
  credentialTypes: ["example.api"],
  config,
  defaultConfig: { path: "/" },
  subtitle: (values) => (typeof values.path === "string" ? values.path : undefined),
  ports: { in: ["main"], out: ["main"] },
  async run({ config, credential, signal }) {
    if (!credential) throw new Error("Pick an Example API credential");
    const url = new URL(config.path, String(credential.data.baseUrl));
    // Pass `signal`: the run stops the call when a person cancels the run.
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${String(credential.data.token)}`,
      },
      signal,
    });
    if (!response.ok) throw new Error(`The API answered with status ${response.status}`);
    return { port: "main", data: await response.json() };
  },
});
