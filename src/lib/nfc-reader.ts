import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// react-native-nfc-manager is a native module — not available in Expo Go,
// only in a custom dev client / standalone build (see app.json's
// react-native-nfc-manager plugin entry and eas.json).

let started = false;

export async function ensureNfcStarted() {
  if (started) return;
  await NfcManager.start();
  started = true;
}

export async function isNfcSupported() {
  try {
    await ensureNfcStarted();
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
}

// Reads the raw NDEF text payload off the next tag tapped, or null if the
// tag has no readable text record (blank tag, or a tag written by another
// app). The backend (resolveNfcToken) is what actually recognizes whether
// this is one of our tags — this just gets the raw text off the chip.
export async function readNfcTagText(): Promise<string | null> {
  await ensureNfcStarted();
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const tag = await NfcManager.getTag();
    const record = tag?.ndefMessage?.[0];
    if (!record) return null;
    return Ndef.text.decodePayload(new Uint8Array(record.payload));
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export function cancelNfcRead() {
  NfcManager.cancelTechnologyRequest().catch(() => {});
}
