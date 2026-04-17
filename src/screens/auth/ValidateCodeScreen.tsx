import React, { useState, useRef } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { ServiceError } from '../../services/errorHandler';

type ValidateNavProp = NativeStackNavigationProp<AuthStackParamList, 'ValidateCode'>;
type ValidateRouteProp = RouteProp<AuthStackParamList, 'ValidateCode'>;

const CODE_LENGTH = 6;

/**
 * Pantalla "Validar identidad" — 6 inputs de un dígito.
 * Requisitos: 4.4, 4.5, 4.6, 4.7
 */
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
    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleValidate = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authService.validateCode(email, code);
      // Req 4.7 — navigate to NewPassword
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Validar identidad</Text>
      <Text style={styles.description}>
        Ingresa el código de 6 dígitos enviado a {email}.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Req 4.4 — 6 individual digit inputs */}
      <View style={styles.codeRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
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
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Validar</Text>
        )}
      </TouchableOpacity>

      {/* Req 4.6 — allow requesting a new code */}
      <TouchableOpacity onPress={handleResend} disabled={isLoading} testID="btn-resend">
        <Text style={styles.link}>Solicitar nuevo código</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  digitInput: {
    width: 44,
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
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
    fontSize: 14,
  },
});
