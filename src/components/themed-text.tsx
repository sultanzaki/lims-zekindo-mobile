import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'subtitle'
    | 'small'
    | 'smallBold'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'mono'
    | 'monoLg';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.link, { color: theme.primary }],
        type === 'code' && styles.code,
        type === 'mono' && styles.mono,
        type === 'monoLg' && styles.monoLg,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    lineHeight: 21,
  },
  small: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  smallBold: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 21,
  },
  link: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: Fonts.monoSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  monoLg: {
    fontFamily: Fonts.monoSemiBold,
    fontSize: 20,
    lineHeight: 24,
  },
});
