import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { ROLE_LABELS } from '@/lib/roles';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.headerBar, { borderBottomColor: theme.borderSoft }]}>
          <ThemedText type="title">Profile</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {user && (
            <Card style={styles.accountCard}>
              <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                <ThemedText type="subtitle" style={{ color: theme.primaryDark }}>
                  {user.initials}
                </ThemedText>
              </View>
              <View style={styles.rowBody}>
                <ThemedText type="subtitle">{user.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {user.role} · {user.section}
                </ThemedText>
                <ThemedText type="mono" themeColor="faint">
                  {user.employeeId} · {ROLE_LABELS[user.accessRole] ?? user.accessRole}
                </ThemedText>
              </View>
            </Card>
          )}

          <Pressable onPress={() => logout()}>
            <Card small style={[styles.signOutCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="link" style={{ color: theme.danger }}>
                Sign Out
              </ThemedText>
            </Card>
          </Pressable>

          <ThemedText type="small" themeColor="faint" style={styles.footer}>
            LIMS Zekindo Mobile{'\n'}Powered by Product Specialist Microbiology
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  signOutCard: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
});
