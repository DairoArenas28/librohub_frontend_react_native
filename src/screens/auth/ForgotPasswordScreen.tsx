import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { ServiceError } from '../../services/errorHandler';

const banner = require('../../../assets/banner.jpg');

type ForgotNavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<ForgotNavProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) { setError('El correo es obligatorio.'); return; }
    if (!EMAIL_REGEX.test(trimmed)) { setError('El formato del correo no es válido.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await authService.sendResetCode(trimmed);
      navigation.navigate('ValidateCode', { email: trimmed });
    } catch (err) {
      setError((err as ServiceError).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior="padding" keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>

          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image source={banner} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.bannerOverlay} />
            <Text style={styles.bannerTitle}>LibroHub</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} testID="link-back-login">
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.description}>
              Ingresa tu correo registrado y te enviaremos un código de verificación.
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              testID="input-email"
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={isLoading}
              testID="btn-send-code"
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar código</Text>}
            </TouchableOpacity>
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
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bannerTitle: { position: 'absolute', bottom: 24, left: 20, fontSize: 38, fontWeight: '700', color: '#fff' },
  backButton: { position: 'absolute', top: 12, left: 16 },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  form: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 28, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  errorText: { color: '#d32f2f', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', marginBottom: 14 },
  button: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
