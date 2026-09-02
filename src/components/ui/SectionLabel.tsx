import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

export function SectionLabel({ children, style, ...rest }: ViewProps & { children: string }) {
  return (
    <View style={style} {...rest}>
      <ThemedText style={styles.label} themeColor="textSecondary">
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
