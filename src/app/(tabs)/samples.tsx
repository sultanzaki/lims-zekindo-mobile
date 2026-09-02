import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronIcon, ClockIcon, SearchIcon } from '@/components/icons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, CustodyDotColor, MaxContentWidth, Radius, SampleStatuses, Spacing } from '@/constants/theme';
import { useSamples } from '@/hooks/use-samples';
import { useTheme } from '@/hooks/use-theme';
import { dueLabelFor } from '@/lib/format';
import type { SampleListItem } from '@/lib/samples-api';

const STATUS_OPTIONS = ['All', ...SampleStatuses];

function SampleRow({ item }: { item: SampleListItem }) {
  const theme = useTheme();
  const terminal = item.status === 'Complete' || item.status === 'Rejected';
  const due = !terminal ? dueLabelFor(item.receivedDate, item.sampleType?.targetTatHours ?? 48) : null;
  const footerLabel = terminal
    ? item.status === 'Complete'
      ? 'Complete'
      : 'Needs correction'
    : due!.label;
  const footerColor = terminal ? (item.status === 'Complete' ? theme.successDark : theme.dangerDark) : due!.color;

  return (
    <Link href={{ pathname: '/samples/[id]', params: { id: item.id } }} asChild>
      <Pressable>
        <ThemedView
          style={[styles.card, CardShadow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardIdRow}>
              <View style={[styles.dot, { backgroundColor: CustodyDotColor[item.status] ?? theme.faint }]} />
              <ThemedText type="mono" themeColor="textSecondary">
                {item.id}
              </ThemedText>
            </View>
            <StatusBadge status={item.status} />
          </View>
          <ThemedText type="subtitle" style={styles.cardTitle} numberOfLines={1}>
            {item.name || item.type}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {item.name ? `${item.type} · ${item.source}` : item.source}
          </ThemedText>
          <View style={[styles.cardFooter, { borderTopColor: theme.borderSoft }]}>
            <View style={styles.cardFooterLeft}>
              <ClockIcon size={13} color={footerColor} strokeWidth={2} />
              <ThemedText type="small" style={{ color: footerColor }}>
                {footerLabel}
              </ThemedText>
            </View>
            <View style={styles.cardFooterRight}>
              <ThemedText type="small" themeColor="faint" numberOfLines={1} style={styles.collectedBy}>
                {item.collectedBy}
              </ThemedText>
              <ChevronIcon />
            </View>
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export default function SamplesScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const { data, isLoading, isError, error, refetch, isRefetching } = useSamples({ status, q: query });

  const samples = data?.samples ?? [];
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: samples.length };
    for (const s of SampleStatuses) counts[s] = 0;
    for (const s of samples) counts[s.status] = (counts[s.status] ?? 0) + 1;
    return counts;
  }, [samples]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="title">Samples</ThemedText>
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
          <SearchIcon />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by ID, name, type, source…"
            placeholderTextColor={theme.faint}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillRow}>
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setStatus(opt)}
                style={[
                  styles.pill,
                  { backgroundColor: active ? theme.primaryDark : theme.backgroundElement, borderColor: active ? theme.primaryDark : theme.border },
                ]}>
                <ThemedText type="link" style={{ color: active ? '#FFFFFF' : theme.text }}>
                  {opt}
                </ThemedText>
                <ThemedText type="small" style={{ color: active ? 'rgba(255,255,255,0.75)' : theme.faint }}>
                  {statusCounts[opt] ?? 0}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.text} />}>
          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Loading samples…
            </ThemedText>
          )}
          {isError && (
            <ThemedText type="small" style={styles.errorText}>
              {error instanceof Error ? error.message : 'Could not load samples.'} Pull down to retry.
            </ThemedText>
          )}
          {!isLoading && samples.length === 0 && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              No samples match this filter.
            </ThemedText>
          )}
          {samples.map((item) => (
            <SampleRow key={item.id} item={item} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  pillScroll: {
    marginTop: Spacing.two,
    flexGrow: 0,
  },
  pillRow: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
  },
  list: {
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
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + 6,
    paddingBottom: Spacing.two,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTitle: {
    marginTop: Spacing.two,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two + 4,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  collectedBy: {
    maxWidth: 110,
  },
});
