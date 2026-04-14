import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Book } from '../types/book';
import BookCard from './BookCard';

export interface CategorySectionProps {
  category: string;
  books: Book[];
  onBookPress: (bookId: string) => void;
}

/**
 * Renders a category name and a horizontal list of BookCards.
 * Requisitos: 5.3, 5.4, 5.6
 */
export default function CategorySection({
  category,
  books,
  onBookPress,
}: CategorySectionProps): React.JSX.Element {
  return (
    <View style={styles.container} testID="category-section">
      <Text style={styles.categoryName} testID="category-name">
        {category}
      </Text>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} onPress={onBookPress} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        testID="books-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginHorizontal: 16,
    color: '#111',
  },
  list: {
    paddingHorizontal: 16,
  },
});
