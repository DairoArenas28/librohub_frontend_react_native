import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthContext } from '../../context/AuthContext';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

/**
 * Pantalla de inicio de sesión.
 * Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
 */
export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginNavProp>();
  const { login, isLoading, error } = useAuthContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Req 2.9 — validate empty fields
    if (!username.trim() || !password.trim()) {
      setValidationError('El usuario y la contraseña son obligatorios.');
      return;
    }
    setValidationError(null);
    try {
      await login({ username: username.trim(), password });
      // Navigation after login is handled by RootNavigator based on auth state
    } catch {
      // error is exposed via useAuth hook
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>LibroHub</Text>
      <Text style={styles.subtitle}>Iniciar sesión</Text>

      {/* Req 2.5 — error message */}
      {(validationError || error) && (
        <Text style={styles.errorText}>{validationError ?? error?.message}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Documento"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        editable={!isLoading}
        testID="input-username"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
        testID="input-password"
      />

      {/* Req 2.6 — loading indicator + disabled button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
        testID="btn-login"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      {/* Req 2.7 — forgot password link */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        testID="link-forgot-password"
      >
        <Text style={styles.link}>¿Olvidaste la contraseña?</Text>
      </TouchableOpacity>

      {/* Req 2.8 — register link */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        testID="link-register"
      >
        <Text style={styles.link}>Registrarse</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#90a4ae',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#1565c0',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});
