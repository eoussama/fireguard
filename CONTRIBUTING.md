# Contributing to Fireguard

Thank you for your interest in contributing to **Fireguard**! We appreciate your help in making the project better.

Before you start contributing, please take a moment to review this guide, which outlines the process for contributing and the community guidelines we follow.

## Code of Conduct

We have a [Code of Conduct](CODE_OF_CONDUCT.md) that we expect all contributors to adhere to. Please read it and make sure you understand and follow it in all your interactions within our project.

## Getting Started

- If you are new to our project, please review our [README](README.md) for an overview of the project and how to get started.

- Check our [Issues](https://github.com/eoussama/fireguard/issues) to find tasks that need assistance or to report any bugs or feature requests.

## Requirements

- Node.js 24 or later.
- [pnpm](https://pnpm.io), the version pinned in the `packageManager` field of `package.json` (`corepack enable` picks it up).

## How to Contribute

1. Fork the repository to your GitHub account.

2. Create a new branch for your contribution:

   ```bash
   git checkout -b feat/your-feature-name
   ```

3. Install the dependencies:

   ```bash
   pnpm install
   ```

4. Make your changes, and run `pnpm dev` to try them with a host page such as the [Firemitt playground](https://github.com/eoussama/firemitt#playground).

5. Add or update tests and documentation, and make sure `pnpm check` passes (audit, lint, type-check, coverage, mutation tests and build).

6. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org) (e.g. `fix: ...`, `feat: ...`, `docs: ...`), then push your branch to your fork.

7. Open a pull request against the `develop` branch, describing your changes and referencing the related issues.

## Compatibility

Deployed Fireguard instances talk to host pages using any Firemitt version. Changes to the message protocol must stay backward compatible with older Firemitt versions.
