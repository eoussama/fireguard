<p align="center">
  <img width="180" alt="Fireguard logo" src="https://raw.githubusercontent.com/eoussama/fireguard/main/static/images/logo.svg">
</p>

<h1 align="center">Fireguard</h1>
<p align="center">Firebase middleman authenticator.</p>

<p align="center">
    <img alt="License" src="https://img.shields.io/github/license/eoussama/fireguard" />
    <img alt="Publish workflow" src="https://github.com/eoussama/fireguard/actions/workflows/publish.yml/badge.svg" />
    <img alt="Latest tag" src="https://img.shields.io/github/v/tag/eoussama/fireguard" />
    <img alt="Code size" src="https://img.shields.io/github/languages/code-size/eoussama/fireguard" />
</p>

## Description

Fireguard is a SvelteKit-based web application designed to facilitate authentication for Chrome extensions and web apps in light of the changes introduced by Manifest V3. It uses Firebase Authentication to handle user sign-ins and sends the resulting OAuth token back to the page that opened it via cross-window messaging.

Fireguard can be hosted as a standalone static page and opened either as a popup window or embedded inside an iframe — both modes are supported.

## Features

- **Firebase Authentication**: Leverages Firebase for robust user authentication.
- **Multiple auth providers**: Supports Google, GitHub, Facebook, Twitter, Microsoft, Apple, Yahoo and custom OIDC providers out of the box (SAML providers return no OAuth token, so they are not supported).
- **Popup and iframe support**: Can be opened as a browser popup or embedded directly inside an iframe in the host page.
- **Custom theming**: Accepts primary, secondary, text, and background color overrides from the host app.
- **Compatibility with Manifest V3**: Designed to work with Chrome extensions adhering to Manifest V3 guidelines.
- **Robust handshake**: Fireguard announces itself until the host answers, only accepts the configuration from the window that opened or embeds it, and then replies to that window's origin only.
- **No lingering session**: The Firebase session only lives in memory and is signed out as soon as the token is extracted.

## Getting Started

### Requirements

- Node.js 24 or later.
- [pnpm](https://pnpm.io), the version pinned in the `packageManager` field of `package.json` (`corepack enable` picks it up).

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/eoussama/fireguard.git
   cd fireguard
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Run the development server**:

   ```bash
   pnpm dev
   ```

   Fireguard is then available at `http://localhost:5173`. It has to be opened by another page (see [Usage](#usage)), the [Firemitt playground](https://github.com/eoussama/firemitt#playground) is the easiest way to try it.

### Developing with a local Firemitt

When a [Firemitt](https://github.com/eoussama/firemitt) checkout sits next to Fireguard (`../firemitt`), Fireguard uses its source (`../firemitt/src`) instead of the published `@eoussama/firemitt` package: in the dev server, the tests, the type-check and the build. Changes to Firemitt are picked up right away, without building or publishing it. Set `FIREMITT=npm` to use the published package anyway (e.g. `FIREMITT=npm pnpm check`). The CI has no sibling checkout, so it always uses the published package: publish Firemitt before releasing a Fireguard version that depends on its changes.

### Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Build the static site into `build`. |
| `pnpm preview` | Preview the production build. |
| `pnpm typecheck` | Type-check the project with `svelte-check`. |
| `pnpm test` | Run the unit tests. |
| `pnpm coverage` | Run the unit tests with coverage, 100% coverage of `src/lib/core` is enforced. |
| `pnpm mutation` | Run the mutation tests ([Stryker](https://stryker-mutator.io)), the report is written to `reports/mutation`. A mutation score below 90% fails. |
| `pnpm lint` / `pnpm lint:fix` | Lint (and fix) the code base. |
| `pnpm check` | Run everything: audit, lint, type-check, coverage, mutation tests and build, as the CI does. |

## Usage

1. **Open Fireguard** in a popup window or embed it in an iframe:
   - This can be triggered from your Chrome extension or web app.
   - Use [Firemitt](https://github.com/eoussama/firemitt) to manage the full lifecycle automatically.

2. **Complete authentication**:
   - The user signs in using the configured provider in the Fireguard UI.

3. **Receive the token**:
   - Fireguard sends the authentication token back to the host application via a cross-window message event.

4. **Integration with Firemitt**:
   - Fireguard is designed to work seamlessly with [Firemitt](https://github.com/eoussama/firemitt), an npm package that handles popup/iframe lifecycle, config passing, and token retrieval.
   - Refer to the [Firemitt documentation](https://ouss.es/firemitt) for detailed integration steps.

### Prerequisites

- Add the domain serving Fireguard (`ouss.es` for the hosted instance) to the **authorized domains** of your Firebase project (**Authentication → Settings → Authorized domains**), otherwise the sign-in fails with `auth/unauthorized-domain`.
- Enable the sign-in providers you use in the Firebase console.
- Fireguard opens the provider's sign-in page in a popup: popups must not be blocked for the Fireguard page, and when embedding it in an iframe, the iframe must not be sandboxed (the sign-in popup would inherit the sandbox, unless `allow-popups-to-escape-sandbox` is set along with `allow-scripts allow-same-origin allow-popups`).

### Message protocol

Messages are Base64 encoded JSON objects (`{ type, payload }`, see Firemitt's `Base64helper` and `EventType`).

| Event | Direction | Payload | Description |
| ----- | --------- | ------- | ----------- |
| `Loaded` | Fireguard → host | | Fireguard is ready. It is announced again (with a backoff) until the configuration arrives, and Fireguard gives up after 15 seconds or as soon as the host is closed. |
| `Config` | host → Fireguard | `TFireguardConfig` | The configuration. Only accepted from the window that opened or embeds Fireguard. |
| `AuthSucceded` | Fireguard → host | `{ token }` | The sign-in succeeded. Sent as soon as the token is available. |
| `AuthFailed` | Fireguard → host | `{ error: IError }` | The sign-in failed. Sent right away for errors that cannot be retried. Errors that can be retried (e.g. the sign-in popup was closed or blocked) are sent when Fireguard is closed, with their Firebase `code`. |
| `Retry` | Fireguard → host | | Informational, the user retried in place. |
| `Closed` | Fireguard → host | | The user closed Fireguard before any sign-in attempt failed. |

`Loaded` is sent to any origin (`"*"`), since the origin of the host is not known yet. Every later message targets the origin of the window that sent the `Config` message (or `"*"` when that origin is opaque, e.g. a sandboxed page).

> With hosts using Firemitt 0.1.8 and earlier, which accept results from any window, closing a leftover Fireguard popup from a previous attempt can settle the current attempt. Firemitt 0.1.9 only accepts messages from the window of the current session.

## Self-hosting

Fireguard builds into a static site (`build` directory) that can be served by any static host.

- In production, Fireguard is built for the `/fireguard` base path (it is served from `https://ouss.es/fireguard/`). Set the `BASE_PATH` environment variable at build time to serve it from another path, for example `BASE_PATH="" pnpm build` for the root of a domain, or `BASE_PATH="/auth" pnpm build`.
- The version shown in the footer is read from `package.json`, no environment file is needed.
- Prefer a **dedicated domain** for Fireguard, and authorize only that domain in your Firebase project.

## Security model

- Fireguard only accepts its configuration from the window that opened it (popup) or embeds it (iframe), and sends the token to that window's origin only.
- Fireguard is an open relay by design: any page can open a public Fireguard instance with a Firebase configuration and receive a token for the user who signs in. The user always sees the application name and logo before signing in, and tokens are issued for the Firebase project of that configuration. Restrict your Firebase project's authorized domains to Fireguard instances you trust, and prefer self-hosting for production.
- The Firebase session is kept in memory only and signed out once the token is extracted, nothing is persisted on the Fireguard origin.

## Releasing

1. Bump the version in `package.json`.
2. Publish a GitHub release: the [publish workflow](.github/workflows/publish.yml) runs `pnpm check` and deploys the site to GitHub Pages.

## Contributing

Contributions to Fireguard are welcome. Please read the [contributing guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) before opening a pull request.
