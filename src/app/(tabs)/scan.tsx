import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/lib/api-client';
import { resolveNfcTag } from '@/lib/nfc-api';
import { cancelNfcRead, isNfcSupported, readNfcTagText } from '@/lib/nfc-reader';

// Mirrors the payload convention the web scanner (ScannerClient.tsx) already
// uses: a decoded value starting with "/samples/" is a full app path,
// anything else is treated as a bare sample ID.
function resolveScannedSampleId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/samples/')) {
    return trimmed.slice('/samples/'.length).split(/[?#]/)[0] || null;
  }
  if (trimmed.startsWith('/')) return null;
  return trimmed;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualId, setManualId] = useState('');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [mode, setMode] = useState<'camera' | 'nfc'>('camera');
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'scanning' | 'resolving'>('idle');
  const [nfcError, setNfcError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;
    isNfcSupported().then((supported) => {
      if (cancelled) return;
      setNfcSupported(supported);
      if (supported) setMode('nfc');
    });
    return () => {
      cancelled = true;
      cancelNfcRead();
    };
  }, []);

  const goToSample = (id: string) => {
    setManualId('');
    router.push({ pathname: '/samples/[id]', params: { id } });
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    const id = resolveScannedSampleId(data);
    if (!id) return;
    setScanned(true);
    goToSample(id);
    setTimeout(() => setScanned(false), 1500);
  };

  const handleNfcScan = async () => {
    setNfcError(null);
    setNfcStatus('scanning');
    try {
      const text = await readNfcTagText();
      if (!text) {
        setNfcError('This tag has no readable data.');
        return;
      }
      setNfcStatus('resolving');
      const result = await resolveNfcTag(text);
      goToSample(result.sampleId);
    } catch (e) {
      setNfcError(e instanceof ApiError ? e.message : 'Could not read the tag. Try again.');
    } finally {
      setNfcStatus('idle');
    }
  };

  const canUseCamera = Platform.OS !== 'web';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.headerBar, { borderBottomColor: theme.borderSoft }]}>
          <ThemedText type="title">Scan</ThemedText>
        </View>

        <View style={styles.body}>
          {nfcSupported && (
            <View style={[styles.modeRow, { backgroundColor: theme.chipBg }]}>
              <Pressable
                style={[styles.modeButton, mode === 'nfc' && [styles.modeButtonActive, { backgroundColor: theme.backgroundElement }]]}
                onPress={() => setMode('nfc')}>
                <ThemedText type="link" style={{ color: mode === 'nfc' ? theme.primaryDark : theme.faint }}>
                  NFC
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modeButton, mode === 'camera' && [styles.modeButtonActive, { backgroundColor: theme.backgroundElement }]]}
                onPress={() => setMode('camera')}>
                <ThemedText type="link" style={{ color: mode === 'camera' ? theme.primaryDark : theme.faint }}>
                  Camera
                </ThemedText>
              </Pressable>
            </View>
          )}

          {mode === 'nfc' && nfcSupported ? (
            <Card style={styles.centerCard}>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {nfcStatus === 'scanning'
                  ? 'Hold your phone near the sample tag…'
                  : nfcStatus === 'resolving'
                    ? 'Looking up sample…'
                    : 'Tap the button, then hold your phone near the sample tag.'}
              </ThemedText>
              {nfcError && (
                <ThemedText type="small" style={styles.errorText}>
                  {nfcError}
                </ThemedText>
              )}
              <Button label="Tap to scan" onPress={handleNfcScan} disabled={nfcStatus !== 'idle'} fullWidth={false} />
            </Card>
          ) : canUseCamera ? (
            permission?.granted ? (
              <View style={styles.cameraWrap}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39', 'ean13'] }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
              </View>
            ) : (
              <Card style={styles.centerCard}>
                <ThemedText themeColor="textSecondary" style={styles.centerText}>
                  {permission?.canAskAgain === false
                    ? 'Camera access was denied. Enable it in system settings, or enter the sample ID below.'
                    : 'Camera access is needed to scan a sample label.'}
                </ThemedText>
                {permission?.canAskAgain !== false && (
                  <Button label="Allow camera" onPress={requestPermission} fullWidth={false} />
                )}
              </Card>
            )
          ) : (
            <Card style={styles.centerCard}>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                Camera scanning isn&apos;t available on this platform. Enter the sample ID below.
              </ThemedText>
            </Card>
          )}

          <Card style={styles.manualCard}>
            <ThemedText type="small" themeColor="textSecondary">
              Or enter the sample ID manually
            </ThemedText>
            <View style={styles.manualRow}>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. LAB-24-0123"
                placeholderTextColor={theme.faint}
                autoCapitalize="characters"
                autoCorrect={false}
                value={manualId}
                onChangeText={setManualId}
                onSubmitEditing={() => manualId.trim() && goToSample(manualId.trim())}
              />
              <Pressable
                style={[styles.goButton, { backgroundColor: theme.primarySoft }]}
                onPress={() => manualId.trim() && goToSample(manualId.trim())}>
                <ThemedText type="link" style={{ color: theme.primaryDark }}>
                  Go
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        </View>
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
  body: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  modeRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  modeButton: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one + 2,
  },
  modeButtonActive: {},
  errorText: {
    color: '#D0021B',
    textAlign: 'center',
  },
  cameraWrap: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0B1418',
  },
  camera: {
    flex: 1,
  },
  centerCard: {
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  manualCard: {
    gap: Spacing.two,
  },
  manualRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  goButton: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
