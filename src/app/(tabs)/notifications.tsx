import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMarkAllNotificationsRead, useNotifications } from '@/hooks/use-notifications';
import { useTheme } from '@/hooks/use-theme';
import type { NotificationRow } from '@/lib/notifications-api';

function NotificationRowItem({ item }: { item: NotificationRow }) {
  const theme = useTheme();
  const content = (
    <ThemedView type="backgroundElement" style={styles.rowCard}>
      {item.unread && <View style={[styles.unreadDot, { backgroundColor: theme.text }]} />}
      <View style={styles.rowBody}>
        <ThemedText type="smallBold">{item.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.body}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {new Date(item.createdAt).toLocaleString()}
        </ThemedText>
      </View>
    </ThemedView>
  );

  if (!item.sampleId) return content;

  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.sampleId } }} asChild>
      <Pressable>{content}</Pressable>
    </Link>
  );
}

export default function NotificationsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const theme = useTheme();

  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.text} />}>
          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.title}>
              Notifications
            </ThemedText>
            {hasUnread && (
              <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
                <ThemedText type="small" themeColor="textSecondary">
                  {markAllRead.isPending ? 'Marking…' : 'Mark all read'}
                </ThemedText>
              </Pressable>
            )}
          </View>

          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Loading…
            </ThemedText>
          )}

          {isError && (
            <ThemedText type="small" style={styles.errorText}>
              Couldn&apos;t load notifications. Pull down to retry.
            </ThemedText>
          )}

          {!isLoading && notifications.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Nothing here yet.
            </ThemedText>
          )}

          {notifications.map((item) => (
            <NotificationRowItem key={item.id} item={item} />
          ))}
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
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  centerText: {
    textAlign: 'center',
  },
  errorText: {
    color: '#e5484d',
    textAlign: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});
