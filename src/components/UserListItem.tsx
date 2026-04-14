import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../types/user';

export interface UserListItemProps {
  user: User;
  onUpdate: (userId: string) => void;
  onDelete: (userId: string) => void;
}

/**
 * Muestra la información de un usuario con botones Actualizar y Eliminar.
 * Requisitos: 10.2, 10.4
 */
export default function UserListItem({ user, onUpdate, onDelete }: UserListItemProps): React.JSX.Element {
  return (
    <View style={styles.container} testID="user-list-item">
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.detail}>Doc: {user.document}</Text>
        <Text style={styles.detail}>Tel: {user.phone}</Text>
        <Text style={styles.detail}>{user.email}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => onUpdate(user.id)}
          testID="user-update-button"
          accessibilityRole="button"
          accessibilityLabel="Actualizar usuario"
        >
          <Text style={styles.buttonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(user.id)}
          testID="user-delete-button"
          accessibilityRole="button"
          accessibilityLabel="Eliminar usuario"
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, marginVertical: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 2 },
  detail: { fontSize: 13, color: '#555', marginTop: 1 },
  actions: { gap: 8 },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  updateButton: { backgroundColor: '#4A90E2' },
  deleteButton: { backgroundColor: '#E25454' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
