import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            LIMS Zekindo
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            {user ? `Signed in as ${user.name} (${user.accessRole})` : 'Mobile companion app for the LIMS Zekindo laboratory system.'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Status"
            hint={<ThemedText type="code">auth wired up — dashboard/scan next</ThemedText>}
          />
          <HintRow
            title="Web app"
            hint={<ThemedText type="code">sultanzaki/lims-zekindo</ThemedText>}
          />
        </ThemedView>

        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}
          onPress={() => logout()}>
          <ThemedText type="smallBold">Sign out</ThemedText>
        </Pressable>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  signOutButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
