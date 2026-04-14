import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import UserListItem from '../../components/UserListItem';
import { User } from '../../types/user';

type UsersNavProp = StackNavigationProp<AdminStackParamList>;

/**
 * Pantalla de gestión de usuarios del administrador.
 * Requisitos: 10.1, 10.3, 10.4, 10.7, 10.8, 10.11
 */
export default function UsersScreen(): React.JSX.Element {
  const navigation = useNavigation<UsersNavProp>();
  const {
    filteredUsers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    deleteUser,
    fetchUsers,
  } = useUsers();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refresh data every time this screen comes into focus (e.g. after edit/create)
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
    }, [fetchUsers]),
  );

  const handleUpdate = (userId: string) => {
    navigation.navigate('UserForm', { userId });
  };

  const handleDeletePress = (userId: string) => {
    Alert.alert(
      'Eliminar usuario',
      '¿Estás seguro de que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(userId),
        },
      ],
    );
  };

  const confirmDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      await deleteUser(userId);
    } catch {
      // error is already set in useUsers hook and displayed below
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <UserListItem
      user={item}
      onUpdate={handleUpdate}
      onDelete={handleDeletePress}
    />
  );

  return (
    <View style={styles.container} testID="users-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UserForm', {})}
          testID="add-user-button"
          accessibilityRole="button"
          accessibilityLabel="Agregar usuario"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, documento o correo..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        testID="search-input"
        accessibilityLabel="Buscar usuarios"
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer} testID="users-error">
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#4A90E2"
          style={styles.loader}
          testID="users-loading"
        />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          testID="users-list"
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
          }
        />
      )}

      {/* Per-item delete loading overlay */}
      {deletingId !== null && (
        <View style={styles.overlay} testID="delete-loading">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#333' },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#333',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#fdecea',
    borderRadius: 8,
  },
  errorText: { color: '#e53935', fontSize: 14 },
  loader: { marginTop: 32 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 32, fontSize: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
