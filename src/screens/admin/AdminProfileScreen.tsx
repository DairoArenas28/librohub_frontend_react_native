import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useProfile } from '../../hooks/useProfile';
import { useAuthContext } from '../../context/AuthContext';

export default function AdminProfileScreen(): React.JSX.Element {
  const { name, document, phone, email, isLoading, profileError } = useProfile();
  const { logout } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{profileError.message}</Text>
      </View>
    );
  }

  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
    : '?';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>

      <Text style={styles.name}>{name ?? '—'}</Text>
      <Text style={styles.roleBadge}>Administrador</Text>

      <View style={styles.infoCard}>
        <InfoRow label="Documento" value={document} />
        <InfoRow label="Teléfono"  value={phone} />
        <InfoRow label="Correo"    value={email} />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
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
  centered:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  container:         { alignItems: 'center', padding: 24, paddingBottom: 40 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#2d6a4f', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  avatarInitials:    { color: '#fff', fontSize: 32, fontWeight: '700' },
  name:              { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  roleBadge:         { fontSize: 13, color: '#fff', backgroundColor: '#2d6a4f', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12, marginBottom: 24, overflow: 'hidden' },
  infoCard:          { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 32, gap: 12 },
  infoRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:         { fontSize: 14, color: '#666', fontWeight: '600' },
  infoValue:         { fontSize: 14, color: '#1a1a1a', flexShrink: 1, textAlign: 'right' },
  logoutButton:      { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#e53e3e' },
  logoutButtonText:  { color: '#e53e3e', fontSize: 16, fontWeight: '600' },
  errorText:         { color: '#e53e3e', fontSize: 15, textAlign: 'center' },
});
