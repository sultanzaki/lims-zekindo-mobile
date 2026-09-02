import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
  identifier: z.string().min(1, 'Enter your email or employee ID.'),
  password: z.string().min(1, 'Enter your password.'),
});

type FormValues = z.infer<typeof schema>;

function LabeledInput({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & React.ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="small" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
        placeholderTextColor={theme.faint}
        {...inputProps}
      />
      {error && (
        <ThemedText type="small" style={styles.fieldError}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await login(values.identifier, values.password);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.brandBlock}>
              <Image
                source={require('../../assets/images/brand/zekindo-logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
                Laboratory Information Management System
              </ThemedText>
            </View>

            <Card style={styles.card}>
              <ThemedText type="title" style={styles.heading}>
                Sign in
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subheading}>
                Use your lab credentials to continue
              </ThemedText>

              <Controller
                control={control}
                name="identifier"
                render={({ field: { onChange, onBlur, value } }) => (
                  <LabeledInput
                    label="Email or Employee ID"
                    placeholder="a.wijaya@lab.local"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.identifier?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <LabeledInput
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete="current-password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />

              {formError && (
                <ThemedText type="small" style={styles.formError}>
                  {formError}
                </ThemedText>
              )}

              <Button label={submitting ? 'Signing in…' : 'Sign In'} onPress={handleSubmit(onSubmit)} disabled={submitting} style={styles.submitButton} />

              <ThemedText type="small" themeColor="textSecondary" style={styles.footerHint}>
                Forgot your password? Ask your Lab Manager to reset it.
              </ThemedText>
            </Card>

            <ThemedText type="small" themeColor="faint" style={styles.poweredBy}>
              Powered by Product Specialist Microbiology
            </ThemedText>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 100,
    height: 34,
  },
  tagline: {
    fontFamily: Fonts.semiBold,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  card: {
    gap: Spacing.three,
  },
  heading: {
    marginBottom: -Spacing.one,
  },
  subheading: {
    marginTop: -Spacing.one,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 6,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  fieldError: {
    color: '#D0021B',
  },
  formError: {
    color: '#D0021B',
    marginTop: -Spacing.one,
  },
  submitButton: {
    marginTop: Spacing.one,
  },
  footerHint: {
    textAlign: 'center',
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
