import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>
          Scan sample
        </ThemedText>

        {nfcSupported && (
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, { backgroundColor: mode === 'nfc' ? theme.backgroundSelected : theme.backgroundElement }]}
              onPress={() => setMode('nfc')}>
              <ThemedText type="smallBold">NFC</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.modeButton, { backgroundColor: mode === 'camera' ? theme.backgroundSelected : theme.backgroundElement }]}
              onPress={() => setMode('camera')}>
              <ThemedText type="smallBold">Camera</ThemedText>
            </Pressable>
          </View>
        )}

        {mode === 'nfc' && nfcSupported ? (
          <ThemedView type="backgroundElement" style={styles.permissionCard}>
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
            <Pressable
              style={[styles.button, { backgroundColor: theme.backgroundSelected }]}
              disabled={nfcStatus !== 'idle'}
              onPress={handleNfcScan}>
              <ThemedText type="smallBold">Tap to scan</ThemedText>
            </Pressable>
          </ThemedView>
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
            <ThemedView type="backgroundElement" style={styles.permissionCard}>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {permission?.canAskAgain === false
                  ? 'Camera access was denied. Enable it in system settings, or enter the sample ID below.'
                  : 'Camera access is needed to scan a sample label.'}
              </ThemedText>
              {permission?.canAskAgain !== false && (
                <Pressable
                  style={[styles.button, { backgroundColor: theme.backgroundSelected }]}
                  onPress={requestPermission}>
                  <ThemedText type="smallBold">Allow camera</ThemedText>
                </Pressable>
              )}
            </ThemedView>
          )
        ) : (
          <ThemedView type="backgroundElement" style={styles.permissionCard}>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Camera scanning isn&apos;t available on this platform. Enter the sample ID below.
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView type="backgroundElement" style={styles.manualCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Or enter the sample ID manually
          </ThemedText>
          <View style={styles.manualRow}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              placeholder="e.g. LAB-24-0123"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              value={manualId}
              onChangeText={setManualId}
              onSubmitEditing={() => manualId.trim() && goToSample(manualId.trim())}
            />
            <Pressable
              style={[styles.goButton, { backgroundColor: theme.backgroundSelected }]}
              onPress={() => manualId.trim() && goToSample(manualId.trim())}>
              <ThemedText type="smallBold">Go</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
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
    padding: Spacing.three,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'center',
  },
  modeButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
  },
  errorText: {
    color: '#e5484d',
    textAlign: 'center',
  },
  cameraWrap: {
    flex: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  permissionCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  manualCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  manualRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  goButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
