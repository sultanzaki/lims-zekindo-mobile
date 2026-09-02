/**
 * Design tokens mirrored from the web app's src/app/globals.css (Tailwind
 * `@theme` block) and src/lib/status.ts — kept in sync manually since the
 * two repos can't share a file. Any color/radius/shadow value here should
 * trace back to one of those two files.
 */

import '@/global.css';

import { Platform } from 'react-native';

const brand = {
  primary: '#2B8DB8',
  primaryDark: '#1A5F7A',
  primarySoft: '#E8F4FA',
  success: '#28A745',
  successDark: '#1E7A34',
  successBg: '#E6F4EA',
  warning: '#F5A623',
  warningDark: '#9A6100',
  warningBg: '#FEF3E0',
  danger: '#D0021B',
  dangerDark: '#B00016',
  dangerBg: '#FDECEA',
} as const;

export const Colors = {
  light: {
    ...brand,
    // Kept as the original starter's key names (text/background/
    // backgroundElement/backgroundSelected/textSecondary) so existing
    // ThemedText/ThemedView usages don't need touching — only their
    // values changed, to the LIMS palette.
    text: '#111111',
    textSecondary: '#7A8B94',
    faint: '#93A6B0',
    background: '#F4F8FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F4FA',
    surfaceAlt: '#EDF3F7',
    border: '#ECF1F4',
    borderSoft: '#F2F6F8',
    chipBg: '#EEF2F5',
  },
  dark: {
    ...brand,
    text: '#F2F5F7',
    textSecondary: '#9AA8AF',
    faint: '#7C8A91',
    background: '#0E1A20',
    backgroundElement: '#16262E',
    backgroundSelected: '#1D3A46',
    surfaceAlt: '#16262E',
    border: '#22343C',
    borderSoft: '#1C2C33',
    chipBg: '#1C2C33',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const SampleStatuses = [
  'Pending Login',
  'In Testing',
  'Awaiting Supervisor Review',
  'Awaiting QA Approval',
  'Complete',
  'Rejected',
] as const;

// Status pill / dot colors per sample status (src/lib/status.ts).
export const StatusStyles: Record<string, { bg: string; color: string }> = {
  'Pending Login': { bg: '#EEF2F5', color: '#5B6B74' },
  'In Testing': { bg: '#E8F4FA', color: '#1A5F7A' },
  'Awaiting Supervisor Review': { bg: '#FEF3E0', color: '#9A6100' },
  'Awaiting QA Approval': { bg: '#FEF3E0', color: '#9A6100' },
  Complete: { bg: '#E6F4EA', color: '#1E7A34' },
  Rejected: { bg: '#FDECEA', color: '#B00016' },
};

export const CustodyDotColor: Record<string, string> = {
  'Pending Login': '#93A6B0',
  'In Testing': '#2B8DB8',
  'Awaiting Supervisor Review': '#F5A623',
  'Awaiting QA Approval': '#F5A623',
  Complete: '#28A745',
  Rejected: '#D0021B',
};

export const SampleStatusShort: Record<string, string> = {
  'Pending Login': 'Pending',
  'In Testing': 'Testing',
  'Awaiting Supervisor Review': 'Awaiting Supervisor',
  'Awaiting QA Approval': 'Awaiting QA',
  Complete: 'Complete',
  Rejected: 'Rejected',
};

export const TestStatusStyles: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'Not Started', bg: '#EEF2F5', color: '#5B6B74' },
  awaiting: { label: 'Awaiting QA', bg: '#FEF3E0', color: '#9A6100' },
  complete: { label: 'Reviewed', bg: '#E6F4EA', color: '#1E7A34' },
};

// Loaded via @expo-google-fonts/poppins and @expo-google-fonts/roboto-mono
// in the root layout (see src/app/_layout.tsx's useFonts call) — these
// string keys must match the family names passed to useFonts exactly.
export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  mono: 'RobotoMono_500Medium',
  monoSemiBold: 'RobotoMono_600SemiBold',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// rounded-[10px]/[13px]/[18px]/[20px] and rounded-full, as used across
// Card/Field/Button/BottomNav in the web app.
export const Radius = {
  sm: 10,
  md: 13,
  lg: 18,
  xl: 20,
  full: 9999,
} as const;

// RN can't express a layered box-shadow (web's --shadow-card is two
// layers) — this approximates the same "soft, low, blue-tinted" look with
// one shadow plus Android elevation.
export const CardShadow = {
  shadowColor: '#102A3A',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 3,
} as const;

export const CardShadowSm = {
  shadowColor: '#102A3A',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

export const GlowShadowPrimary = {
  shadowColor: '#2B8DB8',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.32,
  shadowRadius: 14,
  elevation: 4,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const TabBarHeight = Platform.select({ ios: 84, android: 68 }) ?? 68;
export const MaxContentWidth = 800;
