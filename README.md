# Create a zerodot node package

A template for community node packages for [zerodot](https://github.com/zerodot-io/zerodot). One repository holds one registry. The registry lists each package in `packages/*`, and each package can have many nodes.

```
registry.json            one address that an admin adds
packages/
  example/               one npm package: zerodot-example
    src/text-case.ts     a node
    src/api-request.ts   a node
    src/credential.ts    a credential type
```

The `example` package has two nodes, one credential type, and tests:

- `Text Case` (`src/text-case.ts`): a node with no credential. It changes the input and sends it on.
- `Example API Request` (`src/api-request.ts`): a node with a credential. It calls an API and sends the JSON answer on.
- `Example API` (`src/credential.ts`): a credential type with a token and a `test()` for the Test button.

## Start

1. Click **Use this template** on GitHub, or copy this folder.
2. In the root `package.json`, set `zerodot.registry.name` (the name that admins see) and `zerodot.registry.homepage`.
3. Rename `packages/example`. In its `package.json`, change `name`, `description`, `zerodot.label`, and `zerodot.summary`. The name without the scope must start with `zerodot-`, for example `zerodot-slack` or `@acme/zerodot-slack`. zerodot does not show other names from a registry.
4. Change the node types. Start each type with your own prefix (for example `acme.slack.send`), so it is not the same as the type of another package. A package cannot replace a built-in node.
5. Put your icon in `icon.svg`.

To add another package, copy `packages/example` to `packages/<name>` and change it in the same way. Put nodes that people install together in one package. Make a new package for a different app or service.

```sh
pnpm install
pnpm test
pnpm run check-types
pnpm run lint
```

## The package contract

Each package in `packages/*`:

- `src/index.ts` exports `nodes` and can export `credentialTypes`.
- `package.json` has `"zerodot": { "sdk": "^1.2" }`: the node contract versions that the package works with. zerodot checks the range before it runs any package code.
- `@zerodot/node-sdk` and `zod` are peer dependencies. zerodot gives them. Do not bundle them. Put other libraries in `dependencies`.
- The build makes one CommonJS file, `dist/index.cjs`. zerodot can then load a new version without a restart.
- Install scripts do not run. A package that needs a native build step does not work.
- Each enum in a config needs `labels` and `hints` in `.meta()`, as in `src/text-case.ts`.

See the [official packages](https://github.com/zerodot-io/nodes) for more examples: triggers, polling, webhooks, and binary data.

## Publish

1. Publish each new or changed package to npm:

   ```sh
   pnpm --filter zerodot-example publish
   ```

2. Write `registry.json`. The script builds all packages and reads the nodes from them. A package that is `private`, or has no `zerodot.sdk`, is not in the list:

   ```sh
   pnpm run registry
   ```

3. Commit `registry.json` and put it on an https address, for example:

   ```
   https://raw.githubusercontent.com/<you>/<repo>/main/registry.json
   ```

4. In zerodot, an instance admin opens **System > Nodes > Community registries**, clicks **Add registry**, and pastes the address. Your packages then show in the Community group.

Run `pnpm run registry` again after each new version. zerodot installs the version that `registry.json` lists, and reads the file again after ten minutes. Publish the version to npm before you push `registry.json`.

## Security

A node package runs on the zerodot server with all the rights of zerodot. zerodot shows a strong warning before an admin adds your registry or installs your package. Keep your npm account safe (use two-factor authentication), and do not publish code that you did not read.

MIT license.
