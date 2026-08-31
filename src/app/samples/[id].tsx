import { Stack, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSampleDetail } from '@/hooks/use-sample-detail';
import { useTheme } from '@/hooks/use-theme';
import type { CustodyEvent, SampleAttachment, SampleTest } from '@/lib/samples-api';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function TestRow({ test }: { test: SampleTest }) {
  return (
    <ThemedView type="backgroundElement" style={styles.rowCard}>
      <View style={styles.rowBody}>
        <ThemedText type="smallBold">{test.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {test.status} {test.result ? `· ${test.result} ${test.unit}` : ''}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function CustodyRow({ event }: { event: CustodyEvent }) {
  return (
    <View style={styles.custodyRow}>
      <ThemedText type="small">{event.label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {new Date(event.time).toLocaleString()}
      </ThemedText>
    </View>
  );
}

function AttachmentRow({ attachment }: { attachment: SampleAttachment }) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.rowCard, { backgroundColor: theme.backgroundElement }]}
      disabled={!attachment.url}
      onPress={() => attachment.url && Linking.openURL(attachment.url)}>
      <View style={styles.rowBody}>
        <ThemedText type="smallBold">{attachment.fileName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {attachment.uploadedBy} · {new Date(attachment.uploadedAt).toLocaleDateString()}
        </ThemedText>
      </View>
      {attachment.url && (
        <ThemedText type="link" themeColor="text">
          View
        </ThemedText>
      )}
    </Pressable>
  );
}

export default function SampleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error } = useSampleDetail(id);
  const sample = data?.sample;

  const allAttachments = sample
    ? [...sample.tests.flatMap((t) => t.attachments), ...sample.reports]
    : [];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: id }} />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && (
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Loading sample…
            </ThemedText>
          )}

          {isError && (
            <ThemedText type="small" style={styles.errorText}>
              {error instanceof Error ? error.message : 'Could not load this sample.'}
            </ThemedText>
          )}

          {sample && (
            <>
              <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  {sample.name || sample.id}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {sample.id} · {sample.type} · {sample.priority}
                </ThemedText>
                <ThemedView type="backgroundElement" style={styles.statusBadge}>
                  <ThemedText type="smallBold">{sample.status}</ThemedText>
                </ThemedView>
              </View>

              <Section title="Tests">
                {sample.tests.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    No tests on this sample.
                  </ThemedText>
                ) : (
                  sample.tests.map((test) => <TestRow key={test.id} test={test} />)
                )}
              </Section>

              {allAttachments.length > 0 && (
                <Section title="Attachments & reports">
                  {allAttachments.map((a) => (
                    <AttachmentRow key={a.id} attachment={a} />
                  ))}
                </Section>
              )}

              <Section title="Custody trail">
                {sample.custodyEvents.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    No custody events yet.
                  </ThemedText>
                ) : (
                  sample.custodyEvents.map((event) => <CustodyRow key={event.id} event={event} />)
                )}
              </Section>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  errorText: {
    color: '#e5484d',
    textAlign: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    marginTop: Spacing.one,
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
  custodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
});
