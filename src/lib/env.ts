export function apiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set — point it at the lims-zekindo dev server, e.g. http://192.168.1.20:3000 (not localhost: Expo Go runs outside this machine).'
    );
  }
  return url.replace(/\/$/, '');
}
