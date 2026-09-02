import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function EmptyState({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.box, { borderColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  text: {
    textAlign: 'center',
  },
});
