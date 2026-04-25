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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../types';
import { useAdminBooks } from '../../hooks/useAdminBooks';
import BookListItem from '../../components/BookListItem';
import { Book } from '../../types/book';

type BooksNavProp = StackNavigationProp<AdminStackParamList>;

/**
 * Pantalla de gestión de libros del administrador.
 * Requisitos: 11.1, 11.3, 11.4, 11.7, 11.8, 11.11
 */
export default function BooksScreen(): React.JSX.Element {
  const navigation = useNavigation<BooksNavProp>();
  const {
    filteredBooks,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    deleteBook,
    fetchBooks,
  } = useAdminBooks();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refresh data every time this screen comes into focus (e.g. after edit/create)
  useFocusEffect(
    React.useCallback(() => {
      fetchBooks();
    }, [fetchBooks]),
  );

  const handleUpdate = (bookId: string) => {
    navigation.navigate('BookForm', { bookId });
  };

  const handleDeletePress = (bookId: string) => {
    Alert.alert(
      'Eliminar libro',
      '¿Estás seguro de que deseas eliminar este libro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(bookId),
        },
      ],
    );
  };

  const confirmDelete = async (bookId: string) => {
    setDeletingId(bookId);
    try {
      await deleteBook(bookId);
    } catch {
      // error is already set in useAdminBooks hook and displayed below
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = ({ item }: { item: Book }) => (
    <View>
      <BookListItem
        book={item}
        onUpdate={handleUpdate}
        onDelete={handleDeletePress}
      />
      {item.hasPdf && (
        <Text testID={`pdf-indicator-${item.id}`}>📄</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']} testID="books-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Libros</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('BookForm', {})}
          testID="add-book-button"
          accessibilityRole="button"
          accessibilityLabel="Agregar libro"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título o autor..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        testID="search-input"
        accessibilityLabel="Buscar libros"
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer} testID="books-error">
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#4A90E2"
          style={styles.loader}
          testID="books-loading"
        />
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          testID="books-list"
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron libros.</Text>
          }
        />
      )}

      {/* Per-item delete loading overlay */}
      {deletingId !== null && (
        <View style={styles.overlay} testID="delete-loading">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
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
