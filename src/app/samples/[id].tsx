import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSampleDetail } from '@/hooks/use-sample-detail';
import { useSubmitTestResult, useAddTestReading, useDeleteTestReading } from '@/hooks/use-sample-mutations';
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

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.backgroundSelected, backgroundColor: active ? theme.backgroundSelected : 'transparent' },
      ]}>
      <ThemedText type="small">{label}</ThemedText>
    </Pressable>
  );
}

function ReadingsEntry({ sampleId, test }: { sampleId: string; test: SampleTest }) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [checkpoint, setCheckpoint] = useState<string | null>(null);
  const [replicate, setReplicate] = useState<number | null>(null);

  const addReading = useAddTestReading(sampleId);
  const deleteReading = useDeleteTestReading(sampleId);

  const checkpoints = test.intervalPlan ? test.intervalPlan.split(',') : [];
  const replicates = test.replicateCount && test.replicateCount > 1
    ? Array.from({ length: test.replicateCount }, (_, i) => i + 1)
    : [];

  const numericValues = test.readings.map((r) => Number(r.value)).filter((n) => Number.isFinite(n));
  const suggestedAverage =
    numericValues.length > 0 ? (numericValues.reduce((sum, n) => sum + n, 0) / numericValues.length).toFixed(2) : null;

  const canAdd = value.trim().length > 0 && (checkpoints.length === 0 || checkpoint) && (replicates.length === 0 || replicate);

  const handleAdd = () => {
    if (!canAdd) return;
    addReading.mutate(
      { testId: test.id, value: value.trim(), intervalLabel: checkpoint, replicateIndex: replicate, note: note.trim() || null },
      {
        onSuccess: () => {
          setValue('');
          setNote('');
          setCheckpoint(null);
          setReplicate(null);
        },
      }
    );
  };

  return (
    <View style={styles.readingsBlock}>
      <ThemedText type="small" themeColor="textSecondary">
        Readings {test.readings.length > 0 ? `(${test.readings.length})` : ''}
      </ThemedText>

      {test.readings.map((r) => (
        <View key={r.id} style={styles.readingRow}>
          <ThemedText type="small">
            {r.value} {test.unit}
            {r.replicateIndex ? ` · Rep ${r.replicateIndex}` : ''}
            {r.intervalLabel ? ` · ${r.intervalLabel}` : ''}
          </ThemedText>
          <Pressable onPress={() => deleteReading.mutate({ testId: test.id, readingId: r.id })}>
            <ThemedText type="small" style={styles.removeLink}>
              Remove
            </ThemedText>
          </Pressable>
        </View>
      ))}

      {checkpoints.length > 0 && (
        <View style={styles.chipRow}>
          {checkpoints.map((c) => (
            <Chip key={c} label={c} active={checkpoint === c} onPress={() => setCheckpoint(c)} />
          ))}
        </View>
      )}
      {replicates.length > 0 && (
        <View style={styles.chipRow}>
          {replicates.map((r) => (
            <Chip key={r} label={`Rep ${r}`} active={replicate === r} onPress={() => setReplicate(r)} />
          ))}
        </View>
      )}

      <View style={styles.entryRow}>
        <TextInput
          style={[styles.input, styles.flexInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
          placeholder={`Value${test.unit ? ` (${test.unit})` : ''}`}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={setValue}
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.backgroundSelected, opacity: canAdd ? 1 : 0.5 }]}
          disabled={!canAdd || addReading.isPending}
          onPress={handleAdd}>
          <ThemedText type="smallBold">{addReading.isPending ? '…' : 'Add'}</ThemedText>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        placeholder="Note (optional)"
        placeholderTextColor={theme.textSecondary}
        value={note}
        onChangeText={setNote}
      />

      {suggestedAverage && (
        <ThemedText type="small" themeColor="textSecondary">
          Suggested average of {numericValues.length} reading{numericValues.length > 1 ? 's' : ''}: {suggestedAverage}{' '}
          {test.unit} — enter the final reported result below.
        </ThemedText>
      )}
    </View>
  );
}

function PendingTestCard({ sampleId, test }: { sampleId: string; test: SampleTest }) {
  const theme = useTheme();
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const submitResult = useSubmitTestResult(sampleId);

  return (
    <ThemedView type="backgroundElement" style={styles.testCard}>
      <ThemedText type="smallBold">{test.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {test.spec} {test.unit ? `(${test.unit})` : ''}
      </ThemedText>

      {test.resultMode === 'MULTI' && <ReadingsEntry sampleId={sampleId} test={test} />}

      <ThemedText type="small" themeColor="textSecondary" style={styles.resultLabel}>
        Final result
      </ThemedText>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        placeholder={`Result${test.unit ? ` (${test.unit})` : ''}`}
        placeholderTextColor={theme.textSecondary}
        value={result}
        onChangeText={setResult}
      />
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        placeholder="Notes (optional)"
        placeholderTextColor={theme.textSecondary}
        value={notes}
        onChangeText={setNotes}
      />
      {submitResult.isError && (
        <ThemedText type="small" style={styles.errorText}>
          {submitResult.error instanceof Error ? submitResult.error.message : 'Could not submit result.'}
        </ThemedText>
      )}
      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.backgroundSelected, opacity: result.trim() ? 1 : 0.5 }]}
        disabled={!result.trim() || submitResult.isPending}
        onPress={() => submitResult.mutate({ testId: test.id, result: result.trim(), notes: notes.trim() })}>
        <ThemedText type="smallBold">{submitResult.isPending ? 'Submitting…' : 'Submit for review'}</ThemedText>
      </Pressable>
    </ThemedView>
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
                  sample.tests.map((test) =>
                    test.status === 'pending' ? (
                      <PendingTestCard key={test.id} sampleId={sample.id} test={test} />
                    ) : (
                      <TestRow key={test.id} test={test} />
                    )
                  )
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
  testCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  resultLabel: {
    marginTop: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  flexInput: {
    flex: 1,
  },
  submitButton: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  readingsBlock: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeLink: {
    color: '#e5484d',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  entryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
