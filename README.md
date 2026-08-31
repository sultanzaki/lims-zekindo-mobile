# LIMS Zekindo — Mobile

Mobile companion app for [lims-zekindo](https://github.com/sultanzaki/lims-zekindo), built with
[Expo](https://expo.dev) (React Native, TypeScript, Expo Router).

## Status

This is an early scaffold — it has no LIMS-specific screens or data yet. The web app
authenticates with cookie-based server sessions (Next.js Server Actions + Prisma), which isn't
callable from a mobile client. Before real LIMS features (sample lookup, barcode scan, result
entry, etc.) can be built here, the web app needs a token-based API surface (e.g. JWT-in-header
routes under `src/app/api/`) for this app to talk to.

## Get started

```bash
npm install
npx expo start
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Screens live in `src/app` (file-based routing via [Expo Router](https://docs.expo.dev/router/introduction)).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
