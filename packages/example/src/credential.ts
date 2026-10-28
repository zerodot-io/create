// SPDX-License-Identifier: MIT
import type { CredentialTypeDefinition } from "@zerodot/node-sdk";
import { z } from "zod";
import { ICON } from "./icon";

/** A token for an API. zerodot keeps the fields in `secretFields` encrypted and hidden. */
export const apiCredential: CredentialTypeDefinition = {
  type: "example.api",
  label: "Example API",
  fields: z.object({
    baseUrl: z.string().url(),
    token: z.string().min(1),
  }),
  secretFields: ["token"],
  icon: "KeyRound",
  iconUrl: ICON,
  // Optional. The "Test" button of the credential calls it. Throw when the credential does not work.
  async test(credential) {
    const response = await fetch(String(credential.data.baseUrl), {
      headers: { authorization: `Bearer ${String(credential.data.token)}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`The API answered with status ${response.status}`);
  },
};
