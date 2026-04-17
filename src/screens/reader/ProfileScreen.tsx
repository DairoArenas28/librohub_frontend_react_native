import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReaderStackParamList } from '../../types';
import { useProfile } from '../../hooks/useProfile';
import { useAuthContext } from '../../context/AuthContext';

type ProfileNavProp = StackNavigationProp<ReaderStackParamList, 'ReaderTabs'>;

export default function ProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<ProfileNavProp>();
  const { name, document, phone, email, avatarUrl, isLoading, profileError, uploadAvatar, isUploadingAvatar } = useProfile();
  const { logout } = useAuthContext();

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await uploadAvatar(result.assets[0].uri);
      } catch {
        Alert.alert('Error', 'No se pudo actualizar la foto de perfil.');
      }
    }
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#4A90E2" /></View>;
  }

  if (profileError) {
    return <View style={styles.centered}><Text style={styles.errorText}>{profileError.message}</Text></View>;
  }

  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : '?';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={isUploadingAvatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={styles.avatarBadge}>
          {isUploadingAvatar
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.avatarBadgeText}>✏️</Text>
          }
        </View>
      </TouchableOpacity>

      <Text style={styles.name}>{name ?? '—'}</Text>

      <View style={styles.infoCard}>
        <InfoRow label="Documento" value={document} />
        <InfoRow label="Teléfono" value={phone} />
        <InfoRow label="Correo" value={email} />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  avatarContainer: { marginTop: 24, marginBottom: 16, position: 'relative' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#fff', fontSize: 32, fontWeight: '700' },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  avatarBadgeText: { fontSize: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 24 },
  infoCard: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 32, gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#1a1a1a', flexShrink: 1, textAlign: 'right' },
  button: { backgroundColor: '#4A90E2', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#e53e3e' },
  logoutButtonText: { color: '#e53e3e', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#e53e3e', fontSize: 15, textAlign: 'center' },
});
