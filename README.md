<p align="center">
  <img width="100" src="https://raw.githubusercontent.com/eoussama/fireguard/main/static/images/logo.svg">
</p>

<h1 align="center">Fireguard</h1>
<p align="center">Firebase middleman authenticator.</p>

<p align="center">
    <img src="https://img.shields.io/github/license/eoussama/fireguard" />
    <img src="https://github.com/eoussama/fireguard/actions/workflows/publish.yml/badge.svg" />
    <img src="https://img.shields.io/github/v/tag/eoussama/fireguard" />
    <img src="https://img.shields.io/github/languages/code-size/eoussama/fireguard" />
</p>

## Description

Fireguard is a SvelteKit-based web application designed to facilitate authentication for Chrome extensions and web apps in light of the changes introduced by Manifest V3. It utilizes Firebase Authentication to handle user sign-ins and securely communicates authentication tokens back to the parent application via cross-window messaging.

Fireguard can be hosted as a standalone page and opened either as a popup window or embedded inside an iframe — both modes are fully supported.

## Features

- **Firebase Authentication**: Leverages Firebase for robust, secure user authentication.
- **Multiple auth providers**: Supports Google, GitHub, Facebook, Twitter, Microsoft, Apple, and Yahoo out of the box.
- **Popup and iframe support**: Can be opened as a browser popup or embedded directly inside an iframe in the host page.
- **Custom theming**: Accepts primary, secondary, text, and background color overrides from the host app.
- **Compatibility with Manifest V3**: Designed to work with Chrome extensions adhering to Manifest V3 guidelines.
- **Token communication**: Securely sends authentication tokens to the parent application using cross-window message events.

## Getting Started

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

3. **Environment variables**: Create a `.env` file from `.env.example` and populate it with the required values.

4. **Run the development server**:
    ```bash
    pnpm dev
    ```

### Usage

1. **Open Fireguard** in a new popup window or embed it in an iframe:
   - This can be triggered from your Chrome extension or web app.
   - Use [Firemitt](https://github.com/eoussama/firemitt) to manage the full lifecycle automatically.

2. **Complete authentication**:
   - The user signs in using the configured provider in the Fireguard UI.

3. **Receive the token**:
   - Fireguard sends the authentication token back to the host application via a cross-window message event.

4. **Integration with Firemitt**:
   - Fireguard is designed to work seamlessly with [Firemitt](https://github.com/eoussama/firemitt), an npm package that handles popup/iframe lifecycle, config passing, and token retrieval.
   - Refer to the [Firemitt documentation](https://eoussama.github.io/firemitt) for detailed integration steps.

## Contributing

Contributions to Fireguard are welcome. Please follow the standard fork-and-pull request workflow. Ensure that your code adheres to the project's coding standards and includes appropriate tests.
