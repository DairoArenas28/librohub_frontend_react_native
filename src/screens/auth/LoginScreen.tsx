import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuthContext } from '../../context/AuthContext';
import { useAppConfig } from '../../context/AppConfigContext';

const banner = require('../../../assets/banner.jpg');

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginNavProp>();
  const { login, isLoading, error } = useAuthContext();
  const { config } = useAppConfig();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setValidationError('El usuario y la contraseña son obligatorios.');
      return;
    }
    setValidationError(null);
    try {
      await login({ username: username.trim(), password });
    } catch {
      // error exposed via context
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image source={banner} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
            <Text style={styles.bannerTitle}>LibroHub</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {(validationError || error) && (
              <Text style={styles.errorText}>{validationError ?? error?.message}</Text>
            )}

            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Documento"
              placeholderTextColor="#bbb"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              testID="input-username"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#bbb"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              testID="input-password"
            />

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

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              testID="link-forgot-password"
            >
              <Text style={styles.link}>¿Olvidaste la contraseña?</Text>
            </TouchableOpacity>

            {config.allowPublicRegistration && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                testID="link-register"
              >
                <Text style={styles.link}>Registrarse</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  scroll: { flexGrow: 1 },

  bannerContainer: { width: '100%', height: 200, position: 'relative', overflow: 'hidden' },
  bannerImage: { width: '100%', height: '160%', position: 'absolute', top: '-20%' },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerTitle: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
  },

  form: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 24 },
  errorText: { color: '#d32f2f', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#555', textAlign: 'center', marginTop: 10, fontSize: 14 },
});
