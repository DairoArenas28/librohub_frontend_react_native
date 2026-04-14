import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import { UserFormData } from '../../types/user';
import { UserRole } from '../../types/auth';

type UserFormRouteProp = RouteProp<AdminStackParamList, 'UserForm'>;
type UserFormNavProp = StackNavigationProp<AdminStackParamList>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de creación y edición de usuarios.
 * Requisitos: 10.5, 10.6, 10.9, 10.10
 */
export default function UserFormScreen(): React.JSX.Element {
  const navigation = useNavigation<UserFormNavProp>();
  const route = useRoute<UserFormRouteProp>();
  const { userId } = route.params ?? {};
  const isEditMode = Boolean(userId);

  const { users, createUser, updateUser } = useUsers();

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('reader');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  // Pre-populate form in edit mode
  useEffect(() => {
    if (isEditMode && userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setName(user.name);
        setDocument(user.document);
        setEmail(user.email);
        setPhone(user.phone);
        setRole(user.role);
      }
    }
  }, [isEditMode, userId, users]);

  const validate = (): boolean => {
    const errors: Partial<Record<string, string>> = {};

    if (!name.trim()) errors.name = 'El nombre es requerido.';
    if (!document.trim()) errors.document = 'El documento es requerido.';
    if (!email.trim()) {
      errors.email = 'El correo es requerido.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Ingresa un correo válido.';
    }
    if (!phone.trim()) errors.phone = 'El teléfono es requerido.';
    if (!isEditMode && !password.trim()) errors.password = 'La contraseña es requerida.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const data: UserFormData = {
      name: name.trim(),
      document: document.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    try {
      if (isEditMode && userId) {
        await updateUser(userId, data);
      } else {
        await createUser(data);
      }
      navigation.goBack();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Ocurrió un error. Intenta de nuevo.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        testID="user-form-screen"
      >
        <Text style={styles.title} testID="form-title">
          {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
        </Text>

        {/* Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[styles.input, fieldErrors.name ? styles.inputError : null]}
          value={name}
          onChangeText={setName}
          placeholder="Nombre completo"
          placeholderTextColor="#999"
          testID="input-name"
          accessibilityLabel="Nombre"
        />
        {fieldErrors.name ? (
          <Text style={styles.fieldError} testID="error-name">{fieldErrors.name}</Text>
        ) : null}

        {/* Documento */}
        <Text style={styles.label}>Documento</Text>
        <TextInput
          style={[styles.input, fieldErrors.document ? styles.inputError : null]}
          value={document}
          onChangeText={setDocument}
          placeholder="Número de documento"
          placeholderTextColor="#999"
          testID="input-document"
          accessibilityLabel="Documento"
        />
        {fieldErrors.document ? (
          <Text style={styles.fieldError} testID="error-document">{fieldErrors.document}</Text>
        ) : null}

        {/* Correo */}
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={[styles.input, fieldErrors.email ? styles.inputError : null]}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-email"
          accessibilityLabel="Correo"
        />
        {fieldErrors.email ? (
          <Text style={styles.fieldError} testID="error-email">{fieldErrors.email}</Text>
        ) : null}

        {/* Teléfono */}
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={[styles.input, fieldErrors.phone ? styles.inputError : null]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Número de teléfono"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          testID="input-phone"
          accessibilityLabel="Teléfono"
        />
        {fieldErrors.phone ? (
          <Text style={styles.fieldError} testID="error-phone">{fieldErrors.phone}</Text>
        ) : null}

        {/* Contraseña */}
        <Text style={styles.label}>
          Contraseña{isEditMode ? ' (dejar vacío para no cambiar)' : ''}
        </Text>
        <TextInput
          style={[styles.input, fieldErrors.password ? styles.inputError : null]}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          testID="input-password"
          accessibilityLabel="Contraseña"
        />
        {fieldErrors.password ? (
          <Text style={styles.fieldError} testID="error-password">{fieldErrors.password}</Text>
        ) : null}

        {/* Rol */}
        <Text style={styles.label}>Rol</Text>
        <View style={styles.roleContainer} testID="role-toggle">
          <TouchableOpacity
            style={[styles.roleButton, role === 'reader' && styles.roleButtonActive]}
            onPress={() => setRole('reader')}
            testID="role-reader"
            accessibilityRole="button"
            accessibilityLabel="Rol lector"
            accessibilityState={{ selected: role === 'reader' }}
          >
            <Text style={[styles.roleButtonText, role === 'reader' && styles.roleButtonTextActive]}>
              Lector
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
            onPress={() => setRole('admin')}
            testID="role-admin"
            accessibilityRole="button"
            accessibilityLabel="Rol administrador"
            accessibilityState={{ selected: role === 'admin' }}
          >
            <Text style={[styles.roleButtonText, role === 'admin' && styles.roleButtonTextActive]}>
              Administrador
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit error */}
        {submitError ? (
          <View style={styles.errorContainer} testID="submit-error">
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="submit-button"
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? 'Guardar cambios' : 'Crear usuario'}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" testID="submit-loading" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Guardar cambios' : 'Crear usuario'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  inputError: { borderColor: '#e53935' },
  fieldError: { color: '#e53935', fontSize: 12, marginBottom: 8 },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleButtonActive: { backgroundColor: '#4A90E2' },
  roleButtonText: { fontSize: 14, fontWeight: '600', color: '#4A90E2' },
  roleButtonTextActive: { color: '#fff' },
  errorContainer: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#e53935', fontSize: 14 },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
