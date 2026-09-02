import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertTriangleIcon, BellIcon, ChevronIcon, ClockIcon, SamplesIcon, ScanIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { BottomTabInset, CustodyDotColor, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import type { AttentionItem, QueueSample } from '@/lib/dashboard-api';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function AttentionRow({ item, index }: { item: AttentionItem; index: number }) {
  const theme = useTheme();
  const rejected = item.tag === 'REJECTED';
  const iconBg = rejected ? theme.dangerBg : theme.warningBg;
  const iconColor = rejected ? theme.danger : theme.warningDark;
  const labelColor = rejected ? theme.dangerDark : theme.warningDark;

  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <Card style={[styles.attentionCard, index > 0 && { marginTop: Spacing.two }]}>
          <View style={[styles.attentionIcon, { backgroundColor: iconBg }]}>
            {rejected ? <AlertTriangleIcon size={19} color={iconColor} /> : <ClockIcon size={19} color={iconColor} />}
          </View>
          <View style={styles.rowBody}>
            <ThemedText type="small" style={[styles.attentionTag, { color: labelColor }]}>
              {item.tag}
            </ThemedText>
            <ThemedText type="subtitle" numberOfLines={1} style={styles.attentionTitle}>
              {item.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {item.body}
            </ThemedText>
          </View>
          <ChevronIcon />
        </Card>
      </Pressable>
    </Link>
  );
}

function QueueRow({ item, isLast }: { item: QueueSample; isLast: boolean }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <View style={[styles.queueRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft }]}>
          <View style={[styles.dot, { backgroundColor: item.dotColor ?? CustodyDotColor[item.status] ?? theme.faint }]} />
          <View style={styles.rowBody}>
            <View style={styles.queueTitleRow}>
              <ThemedText type="mono">{item.id}</ThemedText>
              <ThemedText type="small" numberOfLines={1} style={styles.queueType}>
                {item.type}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {item.source}
            </ThemedText>
          </View>
          <View style={styles.queueMeta}>
            <ThemedText type="small" style={{ color: item.dueColor }}>
              {item.dueLabel}
            </ThemedText>
            <ThemedText type="small" themeColor="faint">
              {item.statusShort}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function QuickAction({ href, label, icon }: { href: '/scan' | '/samples' | '/notifications'; label: string; icon: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Link href={href} asChild>
      <Pressable style={{ flex: 1 }}>
        <Card small style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: theme.primarySoft }]}>{icon}</View>
          <ThemedText type="link" style={styles.quickActionLabel} numberOfLines={2}>
            {label}
          </ThemedText>
        </Card>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboard();

  const firstName = user?.name.trim().split(/\s+/)[0] ?? '';

  const totalActive = useMemo(() => {
    if (!data) return 0;
    return data.pendingLogin + data.inTesting + data.awaitingReview;
  }, [data]);

  const pct = (n: number): `${number}%` => (totalActive > 0 ? `${(n / totalActive) * 100}%` : '0%');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerWrap}>
          <View style={[styles.headerGlow, { backgroundColor: 'rgba(43,141,184,0.14)' }]} />
          <View style={styles.header}>
            <View style={styles.shrink}>
              <ThemedText type="small" themeColor="textSecondary">
                {greeting()}
              </ThemedText>
              <ThemedText type="title" style={styles.name} numberOfLines={1}>
                {firstName || 'LIMS Zekindo'}
              </ThemedText>
            </View>
            <Link href="/notifications" asChild>
              <Pressable style={[styles.bellButton, { backgroundColor: theme.chipBg }]}>
                <BellIcon size={19} color={theme.primaryDark} strokeWidth={1.9} />
                {data && data.unreadCount > 0 && (
                  <View style={[styles.bellBadge, { borderColor: theme.background }]}>
                    <ThemedText style={styles.bellBadgeText}>{data.unreadCount > 9 ? '9+' : data.unreadCount}</ThemedText>
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.text} />}>
          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Loading dashboard…
            </ThemedText>
          )}

          {isError && (
            <ThemedText type="small" style={styles.errorText}>
              {error instanceof Error ? error.message : 'Could not load the dashboard.'} Pull down to retry.
            </ThemedText>
          )}

          {data && (
            <>
              <LinearGradient
                colors={['#FFFFFF', '#F1F9FC']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.workloadCard, { borderColor: '#E4EFF4' }]}>
                <View style={styles.workloadHeader}>
                  <ThemedText type="subtitle">Today&apos;s workload</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {totalActive} active
                  </ThemedText>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.chipBg }]}>
                  <View style={{ width: pct(data.pendingLogin), backgroundColor: theme.faint }} />
                  <View style={{ width: pct(data.inTesting), backgroundColor: theme.primary }} />
                  <View style={{ width: pct(data.awaitingReview), backgroundColor: theme.warning }} />
                </View>
                <View style={styles.workloadStats}>
                  <Link href={{ pathname: '/samples' }} asChild>
                    <Pressable style={styles.workloadStat}>
                      <View style={styles.workloadStatRow}>
                        <View style={[styles.dot, { backgroundColor: theme.faint }]} />
                        <ThemedText type="monoLg">{data.pendingLogin}</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        Pending login
                      </ThemedText>
                    </Pressable>
                  </Link>
                  <Link href={{ pathname: '/samples' }} asChild>
                    <Pressable style={styles.workloadStat}>
                      <View style={styles.workloadStatRow}>
                        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                        <ThemedText type="monoLg">{data.inTesting}</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        In testing
                      </ThemedText>
                    </Pressable>
                  </Link>
                  <Link href={{ pathname: '/samples' }} asChild>
                    <Pressable style={styles.workloadStat}>
                      <View style={styles.workloadStatRow}>
                        <View style={[styles.dot, { backgroundColor: theme.warning }]} />
                        <ThemedText type="monoLg">{data.awaitingReview}</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        Awaiting QA
                      </ThemedText>
                    </Pressable>
                  </Link>
                </View>
              </LinearGradient>

              {data.passRate !== null && (
                <Card style={styles.passRateCard}>
                  <ThemedText type="title" style={{ color: theme.successDark }}>
                    {data.passRate}%
                  </ThemedText>
                  <View style={styles.rowBody}>
                    <ThemedText type="smallBold">Pass rate, last 7 days</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {data.approvedLast7} approved · {data.rejectedLast7} rejected
                    </ThemedText>
                  </View>
                </Card>
              )}

              {data.attentionItems.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Needs attention
                  </ThemedText>
                  {data.attentionItems.map((item, i) => (
                    <AttentionRow key={item.id} item={item} index={i} />
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ThemedText type="subtitle">My queue</ThemedText>
                  <Link href={{ pathname: '/samples' }} asChild>
                    <Pressable>
                      <ThemedText type="link" style={{ color: theme.primary }}>
                        See all
                      </ThemedText>
                    </Pressable>
                  </Link>
                </View>
                <Card padded={false} style={styles.queueCard}>
                  {data.queueSamples.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary" style={styles.emptyQueue}>
                      No open samples right now.
                    </ThemedText>
                  ) : (
                    data.queueSamples.map((item, i) => (
                      <QueueRow key={item.id} item={item} isLast={i === data.queueSamples.length - 1} />
                    ))
                  )}
                </Card>
              </View>

              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Quick actions
                </ThemedText>
                <View style={styles.quickActionsRow}>
                  <QuickAction href="/scan" label="Scan label" icon={<ScanIcon size={18} color={theme.primary} strokeWidth={1.9} />} />
                  <QuickAction href="/samples" label="My tasks" icon={<SamplesIcon size={18} color={theme.primary} strokeWidth={1.9} />} />
                  <QuickAction href="/notifications" label="Alerts" icon={<BellIcon size={18} color={theme.primary} strokeWidth={1.9} />} />
                </View>
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
  headerWrap: {
    position: 'relative',
  },
  headerGlow: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  shrink: {
    flexShrink: 1,
  },
  name: {
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 2,
    borderRadius: Radius.full,
    backgroundColor: '#D0021B',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
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
  workloadCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three + 2,
  },
  workloadHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  workloadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  workloadStat: {
    flex: 1,
    gap: 6,
  },
  workloadStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  passRateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  attentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  attentionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionTag: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10.5,
  },
  attentionTitle: {
    fontSize: 15,
    marginTop: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  queueCard: {
    overflow: 'hidden',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 2,
  },
  queueTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  queueType: {
    flexShrink: 1,
  },
  queueMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  emptyQueue: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
  },
  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm - 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    textAlign: 'center',
  },
});
