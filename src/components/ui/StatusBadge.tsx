import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, StatusStyles } from '@/constants/theme';

// Mirrors STATUS_STYLES in the web app's src/lib/status.ts.
export function StatusBadge({ status, short }: { status: string; short?: string }) {
  const style = StatusStyles[status] ?? { bg: '#EEF2F5', color: '#5B6B74' };
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <ThemedText type="small" style={[styles.text, { color: style.color }]}>
        {short ?? status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
  },
});
