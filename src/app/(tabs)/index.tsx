import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import type { AttentionItem, QueueSample } from '@/lib/dashboard-api';

function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <ThemedView type="backgroundElement" style={styles.kpiTile}>
      <ThemedText type="subtitle" style={styles.kpiValue}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function AttentionRow({ item }: { item: AttentionItem }) {
  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.rowCard}>
          <View style={[styles.tagDot, { backgroundColor: item.tag === 'REJECTED' ? '#e5484d' : '#f5a623' }]} />
          <View style={styles.rowBody}>
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.body}
            </ThemedText>
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

function QueueRow({ item }: { item: QueueSample }) {
  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={styles.rowCard}>
          <View style={[styles.tagDot, { backgroundColor: item.dotColor }]} />
          <View style={styles.rowBody}>
            <ThemedText type="smallBold">{item.name || item.id}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.type} · {item.statusShort}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: item.dueColor }}>
            {item.dueLabel}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data, isLoading, isError, refetch, isRefetching } = useDashboard();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.text} />}>
          <ThemedText type="title" style={styles.title}>
            {user ? `Hi, ${user.name.split(' ')[0]}` : 'LIMS Zekindo'}
          </ThemedText>

          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Loading dashboard…
            </ThemedText>
          )}

          {isError && (
            <ThemedText type="small" style={styles.errorText}>
              Couldn&apos;t load the dashboard. Pull down to retry.
            </ThemedText>
          )}

          {data && (
            <>
              <View style={styles.kpiGrid}>
                <KpiTile label="Pending Login" value={data.pendingLogin} />
                <KpiTile label="In Testing" value={data.inTesting} />
                <KpiTile label="Awaiting QA" value={data.awaitingReview} />
                <KpiTile label="Overdue" value={data.overdueCount} />
              </View>

              {data.passRate !== null && (
                <ThemedView type="backgroundElement" style={styles.passRateCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Last 7 days: {data.approvedLast7} approved, {data.rejectedLast7} rejected
                  </ThemedText>
                  <ThemedText type="smallBold">{data.passRate}% pass rate</ThemedText>
                </ThemedView>
              )}

              {data.attentionItems.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Needs attention
                  </ThemedText>
                  {data.attentionItems.map((item) => (
                    <AttentionRow key={item.id} item={item} />
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  My queue
                </ThemedText>
                {data.queueSamples.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Nothing open right now.
                  </ThemedText>
                ) : (
                  data.queueSamples.map((item) => <QueueRow key={item.id} item={item} />)
                )}
              </View>
            </>
          )}
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
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  kpiTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  kpiValue: {
    fontSize: 28,
    lineHeight: 32,
  },
  passRateCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
