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

Fireguard is a SvelteKit-based web application designed to facilitate authentication for Chrome extensions and web apps in light of the changes introduced by Manifest V3. It utilizes Firebase Authentication to handle user sign-ins and securely communicates authentication tokens back to the parent application.

## Features

- **Firebase Authentication**: Leverages Firebase for robust, secure user authentication.
- **Compatibility with Manifest V3**: Designed to work with Chrome extensions adhering to Manifest V3 guidelines.
- **Easy Integration**: Can be easily integrated with extensions and web apps.
- **Token Communication**: Securely sends authentication tokens to the parent application using message events.

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
>>>>>>> Stashed changes

### Usage

1. **Open Fireguard in a new window**:
   - This can be triggered from your Chrome extension or web app.

2. **Complete authentication**:
   - The user will authenticate using the Fireguard authentication.

3. **Receive the token**:
   - Fireguard will send the authentication token back to the parent application using a message event.

4. **Integration with Firemitt**:
   - Fireguard is designed to work seamlessly with [Firemitt](https://github.com/eoussama/firemitt), an npm package that simplifies communication between your host application and Fireguard.
   - Refer to the [Firemitt documentation](https://eoussama.github.io/firemitt) for detailed integration steps.

## Contributing

Contributions to Fireguard are welcome. Please follow the standard fork-and-pull request workflow. Ensure that your code adheres to the project's coding standards and includes appropriate tests.
