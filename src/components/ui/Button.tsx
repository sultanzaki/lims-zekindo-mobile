import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { GlowShadowPrimary, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outlineDanger' | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

// Mirrors src/components/ui/buttonStyles.ts on the web: full-pill buttons,
// same variant palette.
export function Button({ label, variant = 'primary', loading, fullWidth = true, disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle = {
    primary: { backgroundColor: theme.primary, borderColor: theme.primary, ...GlowShadowPrimary },
    secondary: { backgroundColor: theme.backgroundElement, borderColor: theme.primarySoft, borderWidth: 1 },
    success: { backgroundColor: theme.success, borderColor: theme.success },
    outlineDanger: { backgroundColor: theme.backgroundElement, borderColor: theme.danger, borderWidth: 1 },
    ghost: { backgroundColor: theme.chipBg, borderColor: theme.chipBg },
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: theme.primaryDark,
    success: '#FFFFFF',
    outlineDanger: theme.danger,
    ghost: theme.text,
  }[variant];

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style as object,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <ThemedText type="link" style={{ color: textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: 50,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.975 }],
  },
});
