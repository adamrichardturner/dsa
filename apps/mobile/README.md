# Mobile

The Expo app for the same course as the website. It signs in to the API, follows the same lessons, and reads the articles from the site.

Exercises are fill-in-the-gap rather than a full editor. The phone shows a TypeScript function with a few blanks and a set of snippets. Drag a snippet into a blank, or tap the blank and then the snippet. Submit asks the API to run the assembled program with the same tests as the website. A correct blank is outlined in green and a wrong one in red. After two misses, the written solution can be opened, and the lesson can be skipped.

TypeScript is not executed on the device. Sucrase and `node:vm` stay in the API, which is the one place the hidden tests, the time limit, and the disallowed snippets are enforced. On-device options (Hermes `eval` after a transpile, or a second engine such as QuickJS) would duplicate that runner and would share the app's JavaScript context. The gap check itself stays on the server too, so the app bundle does not contain which snippet is correct.

## Local setup

The API has to be running. From the repository root:

```bash
npm run dev:db
npm run dev:api
npm run dev:ios
```

`npm run dev:ios` compiles the development build and installs it on the simulator. After that, `npm run dev:mobile` (or `npm start` from this directory) is enough to reload JavaScript.

Copy the env file before starting the app. The GraphQL client reads `EXPO_PUBLIC_GRAPHQL_URL` and throws if it is missing.

```bash
cp .env.example .env.local
```

`EXPO_PUBLIC_GRAPHQL_URL` is the GraphQL endpoint. `EXPO_PUBLIC_WEB_URL` is the site the article reader opens. A simulator can use `localhost`. A phone on the same network needs your machine's address.

EAS Build does not read `.env.local`. The `development` and `development-device` profiles use the `development` environment, and `production` uses the `production` environment. Set `EXPO_PUBLIC_GRAPHQL_URL` on that environment as plain text or sensitive, not secret, so the build can inline it. `eas update` needs `--environment` set to the same environment.

Sign-in is email and password, plus Google and GitHub when the API has those providers configured. Sign in with Apple appears when `APPLE_CLIENT_ID` is set to this app's bundle id, `com.datastructuresandalgorithms.app`. Android uses Apple's web flow when `APPLE_SERVICES_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` are set. The redirect back into the app is `dsa://auth/callback`.

```bash
npm run typecheck
```

This app uses a development build (`expo-dev-client`), so Expo Go cannot open it. From the repository root, compile and install that build on the iOS Simulator, then start Metro:

```bash
npm run dev:ios
```

The first run generates the native project, compiles it with Xcode, and installs `com.datastructuresandalgorithms.app`. Later JavaScript changes only need `npm run dev:mobile`; open the installed app, or press `i` in that terminal. Run `npm run dev:ios` again after a native dependency, an `app.json` change, or an SDK upgrade.

Sign in with Apple’s entitlement makes Xcode require a development certificate, including on the simulator. Local `expo run:ios` builds omit that entitlement so they can compile without one. EAS builds still include it. `npm run dev:ios:device` installs on a plugged-in iPhone and needs that certificate.

Sign in with Apple and the drag-and-drop gestures need this development build, because they use native modules.

## iPhone, iPad and iPhone Duo

The app runs on iPhone, iPad, and the iPhone Duo, folded or open. `src/ui/layout.ts` sorts the window width into three classes:

| Class | Width | Devices | Layout |
| --- | --- | --- | --- |
| compact | under 600 pt | iPhone, the Duo folded | One column, 24 pt gutter |
| regular | 600 to 899 pt | the Duo open, iPad in Split View, iPad mini | Two columns of lessons, 40 pt gutter |
| expansive | 900 pt and over | iPad full screen | A lesson's reading and its exercise side by side |

Screens put their content in `frame(layout, measure.*)`, a centred column capped at a readable width, so lines stay short on a 13-inch iPad. Sheets and dialogs are capped too. iPhone stays portrait; iPad turns to any orientation (`UISupportedInterfaceOrientations~ipad` in `app.json`).

## App Store listing

`store.config.json` holds the name, subtitle, promotional text, description, keywords and release notes for EAS Metadata:

```bash
npx eas-cli@latest metadata:push --profile production
```

The screenshots and the product page's Header and Search Results creatives are real simulator captures, set in device frames by `store/compose/compose.mjs`. They are uploaded through App Store Connect's asset library, which also covers the iPhone Duo slot that EAS Metadata does not know. See `store/README.md`.
