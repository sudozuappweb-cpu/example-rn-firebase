import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

export default function AuthScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      return;
    }

    return onAuthStateChanged(getFirebaseAuth(), setUser);
  }, [configured]);

  const runAuth = async (action: 'register' | 'login') => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(
        'Datos inválidos',
        'Escribe un correo y una contraseña de al menos 6 caracteres.',
      );
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();

      if (action === 'register') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        Alert.alert('Cuenta creada', 'El usuario se registró en Firebase.');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Error de autenticación', authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      Alert.alert('Error de autenticación', authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
          <ThemedText type="subtitle">Firebase Auth</ThemedText>
          <ThemedText themeColor="textSecondary">
            Crea una cuenta o inicia sesión con correo y contraseña.
          </ThemedText>

          {!configured ? (
            <ThemedText type="code">
              Copia .env.example a .env, pega tu firebaseConfig y reinicia Expo.
            </ThemedText>
          ) : null}

          {user ? (
            <ThemedView type="backgroundElement" style={styles.session}>
              <ThemedText type="small">Sesión activa</ThemedText>
              <ThemedText type="smallBold">{user.email}</ThemedText>
              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={logout}
                style={[styles.button, { backgroundColor: theme.backgroundSelected }]}>
                {loading ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <ThemedText type="smallBold">Cerrar sesión</ThemedText>
                )}
              </Pressable>
            </ThemedView>
          ) : (
            <>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Correo electrónico"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.backgroundElement },
                ]}
                value={email}
              />
              <TextInput
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.backgroundElement },
                ]}
                value={password}
              />

              {loading ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!configured}
                    onPress={() => runAuth('register')}
                    style={[styles.button, { backgroundColor: theme.text, opacity: configured ? 1 : 0.4 }]}>
                    <ThemedText type="smallBold" style={{ color: theme.background }}>
                      Crear cuenta
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!configured}
                    onPress={() => runAuth('login')}
                    style={[
                      styles.button,
                      {
                        backgroundColor: theme.backgroundElement,
                        opacity: configured ? 1 : 0.4,
                      },
                    ]}>
                    <ThemedText type="smallBold">Iniciar sesión</ThemedText>
                  </Pressable>
                </>
              )}
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

function authErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : 'No se pudo completar la operación.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado.';
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Activa Email/Password en Firebase Console.';
    case 'auth/invalid-api-key':
      return 'La API key de Firebase no es válida.';
    default:
      return error.message;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  session: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});
