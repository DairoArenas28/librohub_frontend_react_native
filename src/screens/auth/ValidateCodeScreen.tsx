import React, { useState, useRef } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { ServiceError } from '../../services/errorHandler';

const banner = require('../../../assets/banner.jpg');

type ValidateNavProp = NativeStackNavigationProp<AuthStackParamList, 'ValidateCode'>;
type ValidateRouteProp = RouteProp<AuthStackParamList, 'ValidateCode'>;

const CODE_LENGTH = 6;

export default function ValidateCodeScreen(): React.JSX.Element {
  const navigation = useNavigation<ValidateNavProp>();
  const route = useRoute<ValidateRouteProp>();
  const { email } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleValidate = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) { setError('Ingresa el código completo de 6 dígitos.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await authService.validateCode(email, code);
      navigation.navigate('NewPassword', { email, code });
    } catch (err) {
      setError((err as ServiceError).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.sendResetCode(email);
      setDigits(Array(CODE_LENGTH).fill(''));
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.title}>Validar identidad</Text>
            <Text style={styles.description}>
              Ingresa el código de 6 dígitos enviado a {email}.
            </Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.codeRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={styles.digitInput}
                  value={digit}
                  onChangeText={(v) => handleDigitChange(index, v)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!isLoading}
                  testID={`input-digit-${index}`}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleValidate}
              disabled={isLoading}
              testID="btn-validate"
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Validar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} disabled={isLoading} testID="btn-resend">
              <Text style={styles.link}>Solicitar nuevo código</Text>
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

  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  digitInput: {
    width: 44, height: 52,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  button: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#555', textAlign: 'center', fontSize: 14 },
});
