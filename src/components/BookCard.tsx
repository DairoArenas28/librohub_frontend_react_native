import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types/book';
import { resolveCoverUrl } from '../services/bookService';

export interface BookCardProps {
  book: Book;
  onPress: (bookId: string) => void;
}

const PLACEHOLDER_COVER = 'https://via.placeholder.com/100x150?text=Sin+Portada';

export default function BookCard({ book, onPress }: BookCardProps): React.JSX.Element {
  const resolved = resolveCoverUrl(book.coverUrl);
  const coverUri = resolved ?? PLACEHOLDER_COVER;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(book.id)}
      accessibilityRole="button"
      accessibilityLabel={book.title}
    >
      <Image
        source={{ uri: coverUri }}
        style={styles.cover}
        resizeMode="cover"
        testID="book-cover"
      />
      <Text style={styles.title} numberOfLines={2} testID="book-title">
        {book.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  title: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
    color: '#333',
  },
});
