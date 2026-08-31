import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

export default function AboutScreen() {
  const { user, logout } = useAuth();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">About</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            LIMS Zekindo mobile companion app. Auth, dashboard, and sample scan/view are wired up
            to the web app&apos;s LIMS backend; result entry and approvals are still coming.
          </ThemedText>
        </ThemedView>

        {user && (
          <ThemedView type="backgroundElement" style={styles.accountCard}>
            <ThemedText type="smallBold">{user.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user.email} · {user.accessRole}
            </ThemedText>
            <Pressable
              style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              onPress={() => logout()}>
              <ThemedText type="smallBold">Sign out</ThemedText>
            </Pressable>
          </ThemedView>
        )}

        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  accountCard: {
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  signOutButton: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
});
