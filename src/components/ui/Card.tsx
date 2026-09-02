import { StyleSheet, View, type ViewProps } from 'react-native';

import { CardShadow, CardShadowSm, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  padded?: boolean;
  small?: boolean;
};

// Mirrors src/components/ui/Card.tsx on the web: white surface, border,
// rounded-[18px], shadow-card.
export function Card({ style, padded = true, small = false, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.base,
        small ? CardShadowSm : CardShadow,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        padded && styles.padded,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.three,
  },
});
