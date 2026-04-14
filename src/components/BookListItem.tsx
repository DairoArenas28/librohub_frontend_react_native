import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types/book';
import { resolveCoverUrl } from '../services/bookService';

export interface BookListItemProps {
  book: Book;
  onUpdate: (bookId: string) => void;
  onDelete: (bookId: string) => void;
}

const PLACEHOLDER_COVER = 'https://via.placeholder.com/60x90?text=Sin+Portada';

export default function BookListItem({ book, onUpdate, onDelete }: BookListItemProps): React.JSX.Element {
  const resolved = resolveCoverUrl(book.coverUrl);
  const coverUri = resolved ?? PLACEHOLDER_COVER;

  return (
    <View style={styles.container} testID="book-list-item">
      <Image
        source={{ uri: coverUri }}
        style={styles.cover}
        resizeMode="cover"
        testID="book-cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2} testID="book-title">
          {book.title}
        </Text>
        <Text style={styles.detail} testID="book-author">{book.author}</Text>
        <Text style={styles.detail} testID="book-category">{book.category}</Text>
        <Text style={styles.detail} testID="book-year">{book.year}</Text>
        <View style={[styles.statusBadge, book.status === 'active' ? styles.statusActive : styles.statusComingSoon]}>
          <Text style={styles.statusText}>
            {book.status === 'active' ? '✓ Activo' : '⏳ Próximamente'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => onUpdate(book.id)}
          testID="book-update-button"
          accessibilityRole="button"
          accessibilityLabel="Actualizar libro"
        >
          <Text style={styles.buttonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(book.id)}
          testID="book-delete-button"
          accessibilityRole="button"
          accessibilityLabel="Eliminar libro"
        >
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 6, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  cover: { width: 60, height: 90, borderRadius: 4, backgroundColor: '#e0e0e0', marginRight: 12 },
  info: { flex: 1, marginRight: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 4 },
  detail: { fontSize: 13, color: '#555', marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusActive: { backgroundColor: '#e6f4ea' },
  statusComingSoon: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { gap: 8 },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  updateButton: { backgroundColor: '#4A90E2' },
  deleteButton: { backgroundColor: '#E25454' },
  buttonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
