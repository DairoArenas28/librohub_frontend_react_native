import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Image,
} from 'react-native';
import { Book } from '../types/book';
import { resolveCoverUrl } from '../services/bookService';

interface Props {
  books: Book[];
  onClose: () => void;
  onBookPress: (bookId: string) => void;
}

const PLACEHOLDER = 'https://via.placeholder.com/48x72?text=📖';

export default function NewBooksPanel({ books, onClose, onBookPress }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nuevos libros</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <Text style={styles.empty}>No hay libros nuevos por ahora.</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => { onClose(); onBookPress(item.id); }}
            >
              <Image
                source={{ uri: resolveCoverUrl(item.coverUrl) ?? PLACEHOLDER }}
                style={styles.cover}
              />
              <View style={styles.info}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NUEVO</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    maxHeight: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 16, color: '#888' },
  empty: { padding: 16, color: '#999', fontSize: 14, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cover: {
    width: 48,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  info: { flex: 1 },
  bookTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  bookAuthor: { fontSize: 12, color: '#666', marginBottom: 6 },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: { fontSize: 10, fontWeight: '700', color: '#2e7d32' },
  separator: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 72 },
});
