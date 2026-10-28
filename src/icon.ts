// SPDX-License-Identifier: MIT
import { fileIcon } from "@zerodot/node-sdk";

// The file is in the package root. This works from `src` (tests) and from `dist` (published).
export const ICON = fileIcon(import.meta.url, "../icon.svg");
