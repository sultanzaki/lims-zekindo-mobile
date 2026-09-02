import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CardShadowSm, Fonts, Radius, Spacing, TestStatusStyles } from '@/constants/theme';
import { useSampleDetail } from '@/hooks/use-sample-detail';
import {
  useSubmitTestResult,
  useAddTestReading,
  useDeleteTestReading,
  useUploadTestAttachment,
  useApproveSample,
  useRejectSample,
} from '@/hooks/use-sample-mutations';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';
import { canApproveAsQa, canReviewAsSupervisor } from '@/lib/roles';
import { parseSpecVerdict, specNumericLimit } from '@/lib/spec';
import type { CustodyEvent, SampleAttachment, SampleDetail, SampleTest } from '@/lib/samples-api';

const TABS = ['Results', 'Details', 'Custody'] as const;
type Tab = (typeof TABS)[number];

function parseResultNumber(result: string | null | undefined): number | null {
  if (!result) return null;
  const n = parseFloat(String(result).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: active ? theme.primaryDark : theme.border, backgroundColor: active ? theme.primaryDark : theme.backgroundElement }]}>
      <ThemedText type="small" style={{ color: active ? '#FFFFFF' : theme.text }}>
        {label}
      </ThemedText>
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
  const replicates =
    test.replicateCount && test.replicateCount > 1 ? Array.from({ length: test.replicateCount }, (_, i) => i + 1) : [];

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
    <View style={[styles.readingsBlock, { borderTopColor: theme.borderSoft }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.uppercaseLabel}>
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
            <ThemedText type="small" style={{ color: theme.danger }}>
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
          style={[styles.input, styles.flexInput, { color: theme.text, borderColor: theme.border }]}
          placeholder={`Value${test.unit ? ` (${test.unit})` : ''}`}
          placeholderTextColor={theme.faint}
          value={value}
          onChangeText={setValue}
        />
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.primarySoft, opacity: canAdd ? 1 : 0.5 }]}
          disabled={!canAdd || addReading.isPending}
          onPress={handleAdd}>
          <ThemedText type="link" style={{ color: theme.primaryDark }}>
            {addReading.isPending ? '…' : 'Add'}
          </ThemedText>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        placeholder="Note (optional)"
        placeholderTextColor={theme.faint}
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

async function pickAndUploadAttachment(
  source: 'camera' | 'library',
  testId: string,
  upload: ReturnType<typeof useUploadTestAttachment>
) {
  const permission =
    source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return;

  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync({ quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
  if (result.canceled || !result.assets?.[0]) return;

  const asset = result.assets[0];
  upload.mutate({
    testId,
    asset: { uri: asset.uri, name: asset.fileName || `photo-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' },
  });
}

function PendingTestCard({ sampleId, test }: { sampleId: string; test: SampleTest }) {
  const theme = useTheme();
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const submitResult = useSubmitTestResult(sampleId);
  const uploadAttachment = useUploadTestAttachment(sampleId);
  const st = TestStatusStyles.pending;

  return (
    <Card style={styles.testCard}>
      <View style={styles.testHeaderRow}>
        <View style={styles.rowBody}>
          <ThemedText type="subtitle" style={styles.testName}>
            {test.name}
          </ThemedText>
        </View>
        <StatusBadge status="pending" short={st.label} />
      </View>

      {test.resultMode === 'MULTI' && <ReadingsEntry sampleId={sampleId} test={test} />}

      <View style={[styles.attachmentRowButtons, { borderTopColor: theme.borderSoft }]}>
        <Pressable
          style={[styles.ghostButton, { backgroundColor: theme.chipBg }]}
          disabled={uploadAttachment.isPending}
          onPress={() => pickAndUploadAttachment('camera', test.id, uploadAttachment)}>
          <ThemedText type="small">{uploadAttachment.isPending ? 'Uploading…' : 'Take photo'}</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.ghostButton, { backgroundColor: theme.chipBg }]}
          disabled={uploadAttachment.isPending}
          onPress={() => pickAndUploadAttachment('library', test.id, uploadAttachment)}>
          <ThemedText type="small">Choose photo</ThemedText>
        </Pressable>
      </View>
      {uploadAttachment.isError && (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {uploadAttachment.error instanceof Error ? uploadAttachment.error.message : 'Upload failed.'}
        </ThemedText>
      )}

      <View style={styles.resultEntry}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.uppercaseLabel}>
          Final result
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder={`Result${test.unit ? ` (${test.unit})` : ''}`}
          placeholderTextColor={theme.faint}
          value={result}
          onChangeText={setResult}
        />
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Notes (optional)"
          placeholderTextColor={theme.faint}
          value={notes}
          onChangeText={setNotes}
        />
        {submitResult.isError && (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {submitResult.error instanceof Error ? submitResult.error.message : 'Could not submit result.'}
          </ThemedText>
        )}
        <Button
          label={submitResult.isPending ? 'Submitting…' : 'Submit for review'}
          disabled={!result.trim() || submitResult.isPending}
          onPress={() => submitResult.mutate({ testId: test.id, result: result.trim(), notes: notes.trim() })}
        />
      </View>
    </Card>
  );
}

function ResultTestCard({ test }: { test: SampleTest }) {
  const theme = useTheme();
  const st = TestStatusStyles[test.status] ?? TestStatusStyles.pending;
  const verdict = parseSpecVerdict(test.spec, test.result);
  const verdictBg = verdict === 'Pass' ? theme.successBg : verdict === 'Fail' ? theme.dangerBg : theme.chipBg;
  const verdictColor = verdict === 'Pass' ? theme.successDark : verdict === 'Fail' ? theme.dangerDark : theme.textSecondary;
  const verdictNote = verdict === 'Pass' ? 'Within limit' : verdict === 'Fail' ? 'Exceeds limit' : 'Manual review';
  const limit = specNumericLimit(test.spec);
  const resultN = parseResultNumber(test.result);
  const showBar = limit != null && limit > 0 && resultN != null && /^[≤<]/.test(test.spec.trim());
  const barPct = showBar ? Math.min(100, Math.max(0, (resultN! / limit!) * 100)) : 0;

  return (
    <Card padded={false} style={styles.resultCard}>
      <View style={styles.testHeaderRow}>
        <View style={styles.rowBody}>
          <ThemedText type="subtitle" style={styles.testName}>
            {test.name}
          </ThemedText>
          {test.notes ? (
            <ThemedText type="small" themeColor="textSecondary">
              {test.notes}
            </ThemedText>
          ) : null}
        </View>
        <StatusBadge status={test.status} short={st.label} />
      </View>

      <View style={[styles.verdictRow, { borderTopColor: theme.borderSoft }]}>
        <View style={[styles.verdictCol, { borderRightColor: theme.borderSoft }]}>
          <ThemedText type="small" themeColor="faint" style={styles.uppercaseLabel}>
            Result
          </ThemedText>
          <ThemedText type="mono" style={styles.verdictResultText}>
            {test.result}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {test.unit}
          </ThemedText>
        </View>
        <View style={[styles.verdictCol, { borderRightColor: theme.borderSoft }]}>
          <ThemedText type="small" themeColor="faint" style={styles.uppercaseLabel}>
            Spec
          </ThemedText>
          <ThemedText type="mono">{test.spec}</ThemedText>
        </View>
        <View style={[styles.verdictBadge, { backgroundColor: verdictBg }]}>
          <ThemedText type="smallBold" style={{ color: verdictColor }}>
            {verdict ?? '—'}
          </ThemedText>
          <ThemedText type="small" style={{ color: verdictColor }}>
            {verdictNote}
          </ThemedText>
        </View>
      </View>

      {showBar && (
        <View style={[styles.barWrap, { borderTopColor: theme.borderSoft }]}>
          <View style={[styles.barTrack, { backgroundColor: theme.chipBg }]}>
            <View style={[styles.barFill, { width: `${barPct}%`, backgroundColor: verdictColor }]} />
          </View>
          <View style={styles.barLabels}>
            <ThemedText type="small" themeColor="faint">
              0
            </ThemedText>
            <ThemedText type="small" themeColor="faint">
              limit {test.spec}
            </ThemedText>
          </View>
        </View>
      )}

      {test.attachments.length > 0 && (
        <View style={[styles.attachmentsBlock, { borderTopColor: theme.borderSoft }]}>
          <ThemedText type="small" themeColor="faint" style={styles.uppercaseLabel}>
            Attachments ({test.attachments.length})
          </ThemedText>
          {test.attachments.map((a) => (
            <AttachmentRow key={a.id} attachment={a} />
          ))}
        </View>
      )}
    </Card>
  );
}

function ApprovalSection({ sample, userRole }: { sample: SampleDetail; userRole: string }) {
  const theme = useTheme();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [password, setPassword] = useState('');
  const approveMutation = useApproveSample(sample.id);
  const rejectMutation = useRejectSample(sample.id);

  const stage = sample.status === 'Awaiting Supervisor Review' ? 'supervisor' : sample.status === 'Awaiting QA Approval' ? 'qa' : null;
  const canAct =
    (stage === 'supervisor' && canReviewAsSupervisor(userRole)) || (stage === 'qa' && canApproveAsQa(userRole));

  if (!stage) return null;

  const mutation = action === 'reject' ? rejectMutation : approveMutation;

  const reset = () => {
    setAction(null);
    setPassword('');
  };

  const handleConfirm = () => {
    if (!password || !action) return;
    (action === 'approve' ? approveMutation : rejectMutation).mutate(password, { onSuccess: reset });
  };

  return (
    <View style={[styles.approvalCard, { backgroundColor: theme.warningBg, borderColor: 'rgba(245,166,35,0.3)' }]}>
      <ThemedText type="smallBold" style={{ color: theme.warningDark }}>
        {stage === 'supervisor' ? 'Awaiting supervisor review' : 'Awaiting QA approval'}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.warningDark }}>
        {canAct ? 'Sign your decision to move this sample forward.' : 'Waiting on a reviewer with permission to act.'}
      </ThemedText>

      {canAct &&
        (action === null ? (
          <View style={styles.reviewButtonRow}>
            <Pressable style={[styles.reviewOutlineButton, { borderColor: theme.danger }]} onPress={() => setAction('reject')}>
              <ThemedText type="link" style={{ color: theme.danger }}>
                Reject
              </ThemedText>
            </Pressable>
            <Pressable style={[styles.reviewSolidButton, { backgroundColor: theme.success }]} onPress={() => setAction('approve')}>
              <ThemedText type="link" style={{ color: '#FFFFFF' }}>
                Approve
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.reviewConfirmBlock}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: 'rgba(245,166,35,0.4)', backgroundColor: theme.backgroundElement }]}
              placeholder="Enter your password to sign this decision"
              placeholderTextColor={theme.faint}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {mutation.isError && (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {mutation.error instanceof Error ? mutation.error.message : 'Action failed.'}
              </ThemedText>
            )}
            <View style={styles.reviewButtonRow}>
              <Pressable style={[styles.reviewOutlineButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]} onPress={reset}>
                <ThemedText type="link">Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.reviewSolidButton,
                  { backgroundColor: action === 'approve' ? theme.success : theme.danger, opacity: password ? 1 : 0.5 },
                ]}
                disabled={!password || mutation.isPending}
                onPress={handleConfirm}>
                <ThemedText type="link" style={{ color: '#FFFFFF' }}>
                  {mutation.isPending ? 'Signing…' : `Confirm ${action}`}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
    </View>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: theme.borderSoft }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.infoValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

function CustodyRow({ event, isLast }: { event: CustodyEvent; isLast: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.custodyRow}>
      <View style={styles.custodyLine}>
        <View style={[styles.custodyDot, { backgroundColor: theme.primary }]} />
        {!isLast && <View style={[styles.custodyConnector, { backgroundColor: theme.borderSoft }]} />}
      </View>
      <View style={[styles.custodyBody, !isLast && { paddingBottom: Spacing.three }]}>
        <ThemedText type="small">{event.label}</ThemedText>
        {event.detail ? (
          <ThemedText type="small" themeColor="textSecondary">
            {event.detail}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="faint">
          {new Date(event.time).toLocaleString()}
        </ThemedText>
      </View>
    </View>
  );
}

function AttachmentRow({ attachment }: { attachment: SampleAttachment }) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.attachmentRow, { backgroundColor: theme.chipBg }]}
      disabled={!attachment.url}
      onPress={() => attachment.url && Linking.openURL(attachment.url)}>
      <View style={styles.rowBody}>
        <ThemedText type="small" numberOfLines={1}>
          {attachment.fileName}
        </ThemedText>
        <ThemedText type="small" themeColor="faint">
          {attachment.uploadedBy} · {new Date(attachment.uploadedAt).toLocaleDateString()}
        </ThemedText>
      </View>
      {attachment.url && (
        <ThemedText type="link" style={{ color: theme.primary }}>
          View
        </ThemedText>
      )}
    </Pressable>
  );
}

export default function SampleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('Results');
  const { data, isLoading, isError, error } = useSampleDetail(id);
  const sample = data?.sample;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={[styles.headerBar, { borderBottomColor: theme.borderSoft }]}>
            <View style={styles.headerTopRow}>
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
                style={[styles.backButton, { backgroundColor: theme.background }]}
                hitSlop={8}
                accessibilityLabel="Back">
                <BackIcon size={18} color={theme.primaryDark} />
              </Pressable>
              <View style={styles.rowBody}>
                <ThemedText type="mono" numberOfLines={1}>
                  {id}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {sample?.name || sample?.type || ''}
                </ThemedText>
              </View>
              {sample && <StatusBadge status={sample.status} />}
            </View>

            {sample && (
              <View style={[styles.tabSegment, { backgroundColor: theme.chipBg }]}>
                {TABS.map((t) => {
                  const active = tab === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTab(t)}
                      style={[styles.tabButton, active && [CardShadowSm, { backgroundColor: theme.backgroundElement }]]}>
                      <ThemedText type="link" style={{ color: active ? theme.primaryDark : theme.faint }}>
                        {t}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

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

            {sample && tab === 'Results' && (
              <>
                {user && <ApprovalSection sample={sample} userRole={user.accessRole} />}

                {sample.reports.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                      Reports
                    </ThemedText>
                    {sample.reports.map((r) => (
                      <AttachmentRow key={r.id} attachment={r} />
                    ))}
                  </View>
                )}

                {sample.tests.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                    No tests on this sample.
                  </ThemedText>
                ) : (
                  sample.tests.map((test) =>
                    test.status === 'pending' ? (
                      <PendingTestCard key={test.id} sampleId={sample.id} test={test} />
                    ) : (
                      <ResultTestCard key={test.id} test={test} />
                    )
                  )
                )}
              </>
            )}

            {sample && tab === 'Details' && (
              <Card padded={false}>
                <InfoRow label="Sample ID" value={sample.id} />
                <InfoRow label="Type" value={sample.type} />
                <InfoRow label="Source" value={sample.source} />
                <InfoRow label="Priority" value={sample.priority} />
                <InfoRow label="Collected by" value={sample.collectedBy} />
                <InfoRow label="Collected" value={new Date(sample.collectedDate).toLocaleString()} />
                <InfoRow label="Received" value={new Date(sample.receivedDate).toLocaleString()} />
                <InfoRow label="Container" value={sample.container} />
                {sample.businessUnit && <InfoRow label="Business unit" value={sample.businessUnit.name} />}
                <InfoRow label="Storage location" value={sample.storageLocation || '—'} last />
              </Card>
            )}

            {sample && tab === 'Custody' && (
              <Card>
                {sample.custodyEvents.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    No custody events yet.
                  </ThemedText>
                ) : (
                  sample.custodyEvents.map((event, i) => (
                    <CustodyRow key={event.id} event={event} isLast={i === sample.custodyEvents.length - 1} />
                  ))
                )}
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </>
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
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSegment: {
    flexDirection: 'row',
    gap: 3,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    padding: 3,
    borderRadius: Radius.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
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
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    marginBottom: Spacing.one,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10.5,
  },
  testCard: {
    gap: Spacing.two,
  },
  testHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  testName: {
    fontSize: 15,
  },
  resultCard: {
    overflow: 'hidden',
  },
  verdictRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  verdictCol: {
    flex: 1,
    padding: Spacing.three - 1,
    borderRightWidth: 1,
    gap: 4,
  },
  verdictResultText: {
    fontSize: 17,
  },
  verdictBadge: {
    width: 92,
    padding: Spacing.two,
    justifyContent: 'center',
    gap: 2,
  },
  barWrap: {
    borderTopWidth: 1,
    padding: Spacing.three - 1,
    gap: Spacing.one,
  },
  barTrack: {
    height: 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachmentsBlock: {
    borderTopWidth: 1,
    padding: Spacing.three - 1,
    gap: Spacing.one,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.sm,
    padding: Spacing.two,
  },
  attachmentRowButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  ghostButton: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  resultEntry: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  flexInput: {
    flex: 1,
  },
  readingsBlock: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  entryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  approvalCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  reviewButtonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  reviewOutlineButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
  },
  reviewSolidButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
  },
  reviewConfirmBlock: {
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - 3,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  custodyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  custodyLine: {
    alignItems: 'center',
    width: 10,
  },
  custodyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  custodyConnector: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  custodyBody: {
    flex: 1,
    gap: 1,
  },
});
