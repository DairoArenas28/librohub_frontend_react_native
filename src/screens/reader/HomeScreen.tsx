import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ReaderStackParamList } from '../../types';
import { useBooks } from '../../hooks/useBooks';
import { useBookFilter } from '../../hooks/useBookFilter';
import CategorySection from '../../components/CategorySection';
import FilterPanel from '../../components/FilterPanel';
import BookCard from '../../components/BookCard';
import { Book } from '../../types/book';

type HomeNavProp = StackNavigationProp<ReaderStackParamList, 'ReaderTabs'>;

/**
 * Home screen for the Reader.
 * Shows the book catalog grouped by category, with filter panel support.
 * Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.2, 6.3, 6.4, 6.5
 */
export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<HomeNavProp>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isSilentRefreshing, error, retry } = useBooks();
  const {
    filteredBooks,
    isLoading: filterLoading,
    error: filterError,
    noResults,
    applyFilters,
    clearFilters,
  } = useBookFilter();

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Extract unique categories and years from the full catalog — Req 6.1
  const { categories, years } = useMemo(() => {
    if (!data) return { categories: [], years: [] };
    const allBooks: Book[] = data.flatMap((c) => c.books);
    const cats = Array.from(new Set(allBooks.map((b) => b.category))).sort();
    const yrs = Array.from(new Set(allBooks.map((b) => b.year))).sort((a, b) => b - a);
    return { categories: cats, years: yrs };
  }, [data]);

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetail', { bookId });
  };

  const handleApplyFilters = (filters: { category?: string; year?: number }) => {
    setSelectedCategory(filters.category ?? null);
    setSelectedYear(filters.year ?? null);
    setHasActiveFilters(true);
    setFilterVisible(false);
    applyFilters(filters);
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedYear(null);
    setHasActiveFilters(false);
    setFilterVisible(false);
    clearFilters();
  };

  const showLoading = isLoading || filterLoading;
  const showError = !showLoading && (error || filterError);
  const activeError = error || filterError;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* Top bar — fondo negro que cubre también el status bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.logo}>LibroHub</Text>
        <View style={styles.topBarIcons}>
          {isSilentRefreshing && (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={styles.syncIndicator} />
          )}
          <TouchableOpacity style={styles.iconButton} accessibilityLabel="Buscar">
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} accessibilityLabel="Notificaciones">
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          {/* Funnel icon — Req 5.5, 6.1 */}
          <TouchableOpacity
            style={[styles.iconButton, hasActiveFilters && styles.iconButtonActive]}
            accessibilityLabel="Filtros"
            testID="filter-button"
            onPress={() => setFilterVisible((v) => !v)}
          >
            <Text style={styles.iconText}>⚗️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter panel — Req 6.1, 6.2, 6.3, 6.4, 6.5 */}
      <FilterPanel
        visible={filterVisible}
        categories={categories}
        years={years}
        selectedCategory={selectedCategory}
        selectedYear={selectedYear}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Loading state — Req 5.8 */}
      {showLoading && (
        <View style={styles.centered} testID="loading-indicator">
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}

      {/* Error state — Req 5.7 */}
      {showError && activeError && (
        <View style={styles.centered} testID="error-container">
          <Text style={styles.errorText}>{activeError.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry} testID="retry-button">
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* No results message — Req 6.4 */}
      {!showLoading && !showError && hasActiveFilters && noResults && (
        <View style={styles.centered} testID="no-results-container">
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
        </View>
      )}

      {/* Filtered results — grid 3 columnas — Req 6.2, 6.3 */}
      {!showLoading && !showError && hasActiveFilters && !noResults && (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={styles.filteredBookItem}>
              <BookCard book={item} onPress={handleBookPress} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.catalogContent}
          testID="filtered-list"
        />
      )}

      {/* Full catalog by category — Req 5.3, 5.4, 5.6 */}
      {!showLoading && !showError && !hasActiveFilters && data && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.category}
          renderItem={({ item }) => (
            <CategorySection
              category={item.category}
              books={item.books}
              onBookPress={handleBookPress}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.catalogContent}
          testID="catalog-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIndicator: {
    marginRight: 4,
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  iconText: {
    fontSize: 20,
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  catalogContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  filteredBookItem: {
    width: (Dimensions.get('window').width - 48) / 3,
    padding: 6,
    alignItems: 'center',
  },
});
