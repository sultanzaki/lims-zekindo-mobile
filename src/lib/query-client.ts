import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Wires TanStack Query's refetch-on-focus (on by default per query) to RN's
// app foreground/background state, so every query — not just notifications
// — refetches when the app comes back to the foreground, the same way it
// would refetch on browser tab focus on web.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
}
