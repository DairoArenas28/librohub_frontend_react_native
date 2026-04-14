import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReaderStackParamList } from '../../types';
import { useProfile } from '../../hooks/useProfile';

type ChangePasswordNavProp = StackNavigationProp<ReaderStackParamList, 'ChangePassword'>;

/**
 * Pantalla de cambio de contraseña del Lector.
 * Requisitos: 8.3, 8.4, 8.5, 8.6
 */
export default function ChangePasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<ChangePasswordNavProp>();
  const { changePassword, isChangingPassword, changePasswordError, changePasswordSuccess } =
    useProfile();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    if (changePasswordSuccess) {
      const timer = setTimeout(() => navigation.goBack(), 1500);
      return () => clearTimeout(timer);
    }
  }, [changePasswordSuccess, navigation]);

  const handleSubmit = async () => {
    setMatchError(null);
    if (newPassword !== confirmPassword) {
      setMatchError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
    } catch {
      // error surfaced via changePasswordError
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cambiar contraseña</Text>

        {changePasswordError && (
          <Text style={styles.errorBanner} accessibilityRole="alert">
            {changePasswordError.message}
          </Text>
        )}

        {changePasswordSuccess && (
          <Text style={styles.successBanner} accessibilityRole="alert">
            Contraseña actualizada correctamente.
          </Text>
        )}

        <Text style={styles.label}>Contraseña actual</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Contraseña actual"
          autoCapitalize="none"
          accessibilityLabel="Contraseña actual"
          editable={!isChangingPassword}
        />

        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Nueva contraseña"
          autoCapitalize="none"
          accessibilityLabel="Nueva contraseña"
          editable={!isChangingPassword}
        />

        <Text style={styles.label}>Confirmar nueva contraseña</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirmar nueva contraseña"
          autoCapitalize="none"
          accessibilityLabel="Confirmar nueva contraseña"
          editable={!isChangingPassword}
        />

        {matchError && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {matchError}
          </Text>
        )}

        {isChangingPassword ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Guardar nueva contraseña"
          >
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
          disabled={isChangingPassword}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', marginBottom: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#4A90E2', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { marginTop: 12, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#4A90E2', fontSize: 15 },
  loader: { marginTop: 16 },
  errorBanner: { backgroundColor: '#fff5f5', borderColor: '#fc8181', borderWidth: 1, borderRadius: 8, padding: 12, color: '#c53030', fontSize: 14, marginBottom: 16 },
  successBanner: { backgroundColor: '#f0fff4', borderColor: '#68d391', borderWidth: 1, borderRadius: 8, padding: 12, color: '#276749', fontSize: 14, marginBottom: 16 },
  errorText: { color: '#e53e3e', fontSize: 13, marginTop: -8, marginBottom: 12 },
});
