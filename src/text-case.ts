// SPDX-License-Identifier: MIT
import { defineNode, isRecord } from "@zerodot/node-sdk";
import { z } from "zod";
import { ICON } from "./icon";

const CASES = ["upper", "lower", "title"] as const;

const config = z.object({
  field: z.string().min(1).default("text").meta({
    title: "Field",
    description: "The field of the input that has the text",
  }),
  case: z
    .enum(CASES)
    .default("upper")
    .meta({
      title: "Case",
      // Each value of an enum needs a label and a hint.
      labels: { upper: "UPPER CASE", lower: "lower case", title: "Title Case" },
      hints: {
        upper: "Make all letters capital letters",
        lower: "Make all letters small letters",
        title: "Make the first letter of each word a capital letter",
      },
    }),
});

export function changeCase(text: string, to: (typeof CASES)[number]): string {
  if (to === "upper") return text.toUpperCase();
  if (to === "lower") return text.toLowerCase();
  return text.toLowerCase().replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}

/** A node with no credential: it changes the input and sends it on. */
export default defineNode({
  // Start the type with your own prefix, so it cannot be the same as the type of another package.
  type: "example.textCase",
  label: "Text Case",
  description: "Change text to upper, lower, or title case",
  category: "data",
  app: "Example",
  icon: "CaseSensitive",
  iconUrl: ICON,
  config,
  defaultConfig: { field: "text", case: "upper" },
  subtitle: (values) => (typeof values.case === "string" ? values.case : undefined),
  ports: { in: ["main"], out: ["main"] },
  run({ config, input }) {
    if (!isRecord(input)) throw new Error("The input must be an object");
    const value = input[config.field];
    if (typeof value !== "string") throw new Error(`The field "${config.field}" is not text`);
    return { port: "main", data: { ...input, [config.field]: changeCase(value, config.case) } };
  },
});
