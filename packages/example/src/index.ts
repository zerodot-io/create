// SPDX-License-Identifier: MIT
// zerodot reads two exports: `nodes` and `credentialTypes`.
import type { CredentialTypeDefinition, NodeDefinition } from "@zerodot/node-sdk";
import apiRequest from "./api-request";
import { apiCredential } from "./credential";
import textCase from "./text-case";

export const nodes: NodeDefinition[] = [textCase, apiRequest];
export const credentialTypes: CredentialTypeDefinition[] = [apiCredential];
