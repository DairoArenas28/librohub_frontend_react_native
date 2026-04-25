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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useRegister } from '../../hooks/useRegister';

const banner = require('../../../assets/banner.jpg');

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!document.trim()) errors.document = 'El documento es obligatorio.';
    if (!email.trim()) errors.email = 'El correo es obligatorio.';
    if (!phone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!password.trim()) errors.password = 'La contraseña es obligatoria.';
    if (!confirmPassword.trim()) errors.confirmPassword = 'Confirmar contraseña es obligatorio.';
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) errors.email = 'El formato del correo no es válido.';
    if (password && confirmPassword && password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({ name: name.trim(), document: document.trim(), email: email.trim(), phone: phone.trim(), password });
      navigation.navigate('Login');
    } catch {
      // error shown via hook state
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} testID="link-back">
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.title}>Registrarse</Text>

            {error && <Text style={styles.errorText}>{error.message}</Text>}

            <Field label="Nombre" value={name} onChangeText={setName} editable={!isLoading} error={fieldErrors.name} testID="input-name" />
            <Field label="Documento" value={document} onChangeText={setDocument} editable={!isLoading} error={fieldErrors.document} testID="input-document" />
            <Field label="Correo" value={email} onChangeText={setEmail} editable={!isLoading} error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" testID="input-email" />
            <Field label="Teléfono" value={phone} onChangeText={setPhone} editable={!isLoading} error={fieldErrors.phone} keyboardType="phone-pad" testID="input-phone" />
            <Field label="Contraseña" value={password} onChangeText={setPassword} editable={!isLoading} error={fieldErrors.password} secureTextEntry testID="input-password" />
            <Field label="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} editable={!isLoading} error={fieldErrors.confirmPassword} secureTextEntry testID="input-confirm-password" />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              testID="btn-register"
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} testID="link-login">
              <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

function Field({ label, value, onChangeText, editable = true, error, secureTextEntry, keyboardType = 'default', autoCapitalize = 'sentences', testID }: FieldProps): React.JSX.Element {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholder={label}
        placeholderTextColor="#bbb"
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
  safeArea: { flex: 1, backgroundColor: '#000' },
  scroll: { flexGrow: 1 },

  bannerContainer: { width: '100%', height: 200, position: 'relative', overflow: 'hidden' },
  bannerImage: { width: '100%', height: '160%', position: 'absolute', top: '-20%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bannerTitle: { position: 'absolute', bottom: 24, left: 20, fontSize: 38, fontWeight: '700', color: '#fff' },
  backButton: { position: 'absolute', top: 12, left: 16 },
  backButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  form: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 20 },
  errorText: { color: '#d32f2f', marginBottom: 12, textAlign: 'center', fontSize: 14 },

  fieldContainer: { marginBottom: 10 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a' },
  inputError: { borderWidth: 1, borderColor: '#d32f2f' },
  fieldError: { color: '#d32f2f', fontSize: 12, marginTop: 3 },

  button: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#555', textAlign: 'center', fontSize: 14 },
});
