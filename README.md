# Create a zerodot node package

A template for a community node package for [zerodot](https://github.com/zerodot-io/zerodot). It has two example nodes, one credential type, tests, and a script that writes `registry.json`.

- `Text Case` (`src/text-case.ts`): a node with no credential. It changes the input and sends it on.
- `Example API Request` (`src/api-request.ts`): a node with a credential. It calls an API and sends the JSON answer on.
- `Example API` (`src/credential.ts`): a credential type with a token and a `test()` for the Test button.

## Start

1. Click **Use this template** on GitHub, or copy this folder.
2. In `package.json`, change `name`, `description`, `zerodot.label`, and `zerodot.summary`. The name without the scope must start with `zerodot-`, for example `zerodot-slack` or `@acme/zerodot-slack`. zerodot does not show other names from a registry.
3. Change the node types. Start each type with your own prefix (for example `acme.slack.send`), so it is not the same as the type of another package. A package cannot replace a built-in node.
4. Put your icon in `icon.svg`.

```sh
pnpm install
pnpm test
pnpm run check-types
pnpm run lint
```

## The package contract

- `src/index.ts` exports `nodes` and can export `credentialTypes`.
- `package.json` has `"zerodot": { "sdk": "^1.2" }`: the node contract versions that the package works with. zerodot checks the range before it runs any package code.
- `@zerodot/node-sdk` and `zod` are peer dependencies. zerodot gives them. Do not bundle them. Put other libraries in `dependencies`.
- The build makes one CommonJS file, `dist/index.cjs`. zerodot can then load a new version without a restart.
- Install scripts do not run. A package that needs a native build step does not work.
- Each enum in a config needs `labels` and `hints` in `.meta()`, as in `src/text-case.ts`.

See the [official packages](https://github.com/zerodot-io/nodes) for more examples: triggers, polling, webhooks, and binary data.

## Publish

1. Publish the package to npm:

   ```sh
   pnpm publish
   ```

2. Write `registry.json`. The script builds the package and reads the nodes from it:

   ```sh
   pnpm run registry
   ```

3. Commit `registry.json` and put it on an https address, for example:

   ```
   https://raw.githubusercontent.com/<you>/<repo>/main/registry.json
   ```

4. In zerodot, an instance admin opens **System > Nodes > Community registries**, clicks **Add registry**, and pastes the address. Your package then shows in the Community group.

Run `pnpm run registry` again after each new version. zerodot installs the version that `registry.json` lists, and reads the file again after ten minutes. You can list more than one package in one `registry.json`.

## Security

A node package runs on the zerodot server with all the rights of zerodot. zerodot shows a strong warning before an admin adds your registry or installs your package. Keep your npm account safe (use two-factor authentication), and do not publish code that you did not read.

MIT license.
