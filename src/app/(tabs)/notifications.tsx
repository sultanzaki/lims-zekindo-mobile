import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useMarkAllNotificationsRead, useNotifications } from '@/hooks/use-notifications';
import { useTheme } from '@/hooks/use-theme';
import { relativeTime } from '@/lib/format';
import type { NotificationRow } from '@/lib/notifications-api';
import { notifAccent } from '@/lib/notifications';

function NotificationRowItem({ item }: { item: NotificationRow }) {
  const theme = useTheme();
  const accent = notifAccent(item.title);

  const content = (
    <View
      style={[
        styles.rowCard,
        {
          backgroundColor: item.unread ? theme.backgroundElement : theme.surfaceAlt,
          borderColor: item.unread ? theme.primarySoft : theme.borderSoft,
        },
      ]}>
      <View style={[styles.accentIcon, { backgroundColor: accent.bg }]}>
        <View style={[styles.accentDot, { backgroundColor: accent.color }]} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTopLine}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.rowTitle}>
            {item.title}
          </ThemedText>
          <ThemedText type="small" themeColor="faint">
            {relativeTime(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {item.body}
        </ThemedText>
        {item.sampleId && (
          <ThemedText type="mono" style={{ color: theme.primary, marginTop: 2 }}>
            {item.sampleId} →
          </ThemedText>
        )}
      </View>
    </View>
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
        <View style={[styles.headerRow, { borderBottomColor: theme.borderSoft }]}>
          <ThemedText type="title">Alerts</ThemedText>
          {hasUnread && (
            <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <ThemedText type="link" style={{ color: theme.primary }}>
                {markAllRead.isPending ? 'Marking…' : 'Mark all read'}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.text} />}>
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

          {!isLoading && !isError && notifications.length === 0 && <EmptyState>No notifications yet.</EmptyState>}

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  errorText: {
    color: '#D0021B',
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three - 2,
  },
  accentIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm - 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowTitle: {
    flexShrink: 1,
  },
});
