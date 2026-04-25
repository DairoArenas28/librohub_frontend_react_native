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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { ServiceError } from '../../services/errorHandler';

const banner = require('../../../assets/banner.jpg');

type NewPasswordNavProp = NativeStackNavigationProp<AuthStackParamList, 'NewPassword'>;
type NewPasswordRouteProp = RouteProp<AuthStackParamList, 'NewPassword'>;

export default function NewPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<NewPasswordNavProp>();
  const route = useRoute<NewPasswordRouteProp>();
  const { email, code } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!password.trim() || !confirmPassword.trim()) { setError('Ambos campos son obligatorios.'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      await authService.resetPassword(email, code, password);
      navigation.navigate('Login');
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
            <Text style={styles.title}>Nueva contraseña</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor="#bbb"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              testID="input-password"
            />

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#bbb"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              testID="input-confirm-password"
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              testID="btn-save"
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
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
  title: { fontSize: 26, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 24 },
  errorText: { color: '#d32f2f', marginBottom: 12, textAlign: 'center', fontSize: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', marginBottom: 14 },
  button: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
