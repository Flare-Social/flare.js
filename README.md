# @flaresocial/api

Flare Social API wrapper for javascript.


## Installation

```bash
npm install --save @flaresocial/api
# or
yarn add @flaresocial/api
# or
pnpm add @flaresocial/api
# or
bun add @flaresocial/api
```

## Usage

```ts
// Import the module
import FlareApi from "@flaresocial/api";

// get your token by creating an app, when for calling the api as a user account
// you can get it by logging in or registering
const token = FlareApi.login("usernameOrEmail", "password" /* baseUrl: string */);
// or
const _token = FlareApi.register("username", "email", "password", "Display Name", /* baseUrl: string */); // Display Name is optional

// create a new FlareApi instance:
const flare = new FlareApi(() => token /* baseUrl: string */);
```

## License
This project is licensed under the [MIT License](LICENSE)
