import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useRegister } from '../../hooks/useRegister';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pantalla de registro de usuario.
 * Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<RegisterNavProp>();
  const { register, isLoading, error } = useRegister();

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Req 3.7 ÔÇö required fields
    if (!name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!document.trim()) errors.document = 'El documento es obligatorio.';
    if (!email.trim()) errors.email = 'El correo es obligatorio.';
    if (!phone.trim()) errors.phone = 'El tel├®fono es obligatorio.';
    if (!password.trim()) errors.password = 'La contrase├▒a es obligatoria.';
    if (!confirmPassword.trim()) errors.confirmPassword = 'Confirmar contrase├▒a es obligatorio.';

    // Req 3.3 ÔÇö email format
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      errors.email = 'El formato del correo no es v├ílido.';
    }

    // Req 3.4 ÔÇö password match
    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Las contrase├▒as no coinciden.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({
        name: name.trim(),
        document: document.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      // Req 3.6 ÔÇö navigate to Login on success
      navigation.navigate('Login');
    } catch {
      // error shown via hook state
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registrarse</Text>

        {/* Server-side error (Req 3.5) */}
        {error && <Text style={styles.errorText}>{error.message}</Text>}

        <Field
          label="Nombre"
          value={name}
          onChangeText={setName}
          editable={!isLoading}
          error={fieldErrors.name}
          testID="input-name"
        />
        <Field
          label="Documento"
          value={document}
          onChangeText={setDocument}
          editable={!isLoading}
          error={fieldErrors.document}
          testID="input-document"
        />
        <Field
          label="Correo"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          error={fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-email"
        />
        <Field
          label="Tel├®fono"
          value={phone}
          onChangeText={setPhone}
          editable={!isLoading}
          error={fieldErrors.phone}
          keyboardType="phone-pad"
          testID="input-phone"
        />
        <Field
          label="Contrase├▒a"
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          error={fieldErrors.password}
          secureTextEntry
          testID="input-password"
        />
        <Field
          label="Confirmar contrase├▒a"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
          error={fieldErrors.confirmPassword}
          secureTextEntry
          testID="input-confirm-password"
        />

        {/* Req 3.8 ÔÇö loading indicator + disabled button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          testID="btn-register"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} testID="link-login">
          <Text style={styles.link}>┬┐Ya tienes cuenta? Inicia sesi├│n</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ÔöÇÔöÇ Inline helper component ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  editable?: boolean;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
  testID?: string;
}

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  testID,
}: FieldProps): React.JSX.Element {
  return (
    <View style={styles.fieldContainer}>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholder={label}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        testID={testID}
      />
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  fieldError: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
