# LIMS Zekindo — Mobile

Mobile companion app for [lims-zekindo](https://github.com/sultanzaki/lims-zekindo), built with
[Expo](https://expo.dev) (React Native, TypeScript, Expo Router).

## Status

Login, dashboard, sample scan/lookup, test result entry, supervisor/QA approval (with password
e-signature), notifications, and photo attachment upload are wired up against the
`/api/mobile/*` routes in the `lims-zekindo` web repo. NFC tag scanning is implemented but needs
a custom dev client (see below) — it won't work in plain Expo Go. Inventory/equipment/reagent
management, admin/catalog CRUD, analytics, and the AI assistant stay web-only for now.

## Get started (Expo Go)

Covers everything except NFC scanning.

```bash
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your lims-zekindo dev server's LAN IP
npx expo start
```

Open in [Expo Go](https://expo.dev/go), an Android emulator, or the iOS Simulator (camera scan
won't work in the Simulator — use the manual sample-ID entry field instead).

## NFC scanning (needs a custom dev client)

`react-native-nfc-manager` is a native module Expo Go doesn't include, so NFC requires a
[development build](https://docs.expo.dev/develop/development-builds/introduction/) via
[EAS Build](https://docs.expo.dev/build/introduction/) — no local Xcode/Android Studio required,
it builds in Expo's cloud:

```bash
npx eas login                                    # free account at expo.dev if you don't have one
npx eas build:configure                          # one-time; writes your project's EAS id into app.json
npx eas build --profile development --platform android   # or --platform ios (needs an Apple Developer account for a real device)
```

Install the resulting build on your device, then run `npx expo start --dev-client` instead of
`npx expo start` to connect to it. Everything else (login, dashboard, scan, entry, approval,
notifications) still works the same way in the dev client as in Expo Go.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [EAS Build](https://docs.expo.dev/build/introduction/)
