import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-context';

const schema = z.object({
  identifier: z.string().min(1, 'Enter your email or employee ID.'),
  password: z.string().min(1, 'Enter your password.'),
});

type FormValues = z.infer<typeof schema>;

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
          <ThemedView style={styles.form}>
            <ThemedText type="title" style={styles.title}>
              LIMS Zekindo
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Sign in to continue
            </ThemedText>

            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  placeholder="Email or employee ID"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.identifier && (
              <ThemedText type="small" style={styles.fieldError}>
                {errors.identifier.message}
              </ThemedText>
            )}

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  placeholder="Password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <ThemedText type="small" style={styles.fieldError}>
                {errors.password.message}
              </ThemedText>
            )}

            {formError && (
              <ThemedText type="small" style={styles.fieldError}>
                {formError}
              </ThemedText>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.backgroundSelected },
                pressed && styles.pressed,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}>
              <ThemedText type="smallBold">{submitting ? 'Signing in…' : 'Sign in'}</ThemedText>
            </Pressable>
          </ThemedView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    width: '100%',
    maxWidth: 360,
    gap: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  fieldError: {
    color: '#e5484d',
  },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
