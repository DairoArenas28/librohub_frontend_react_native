import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ReaderStackParamList } from '../../types';
import { useBookDetail } from '../../hooks/useBookDetail';
import { useFavorites } from '../../hooks/useFavorites';
import { resolveCoverUrl } from '../../services/bookService';
import StarRating from '../../components/StarRating';
import CommentItem from '../../components/CommentItem';
import CommentInput from '../../components/CommentInput';

type Props = StackScreenProps<ReaderStackParamList, 'BookDetail'>;

/**
 * Pantalla de detalle de un libro.
 * Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11
 */
export default function BookDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { bookId } = route.params;
  const { book, isLoading, error, retry, addComment, isSubmittingComment } = useBookDetail(bookId);

  const { isFavorite, toggleFavorite } = useFavorites(
    book?.isFavorite ?? false,
    bookId,
  );

  if (isLoading) {
    return (
      <View style={styles.centered} testID="loading-indicator">
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.centered} testID="error-container">
        <Text style={styles.errorText} testID="error-message">
          {error?.message ?? 'No se pudo cargar el libro.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retry}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          testID="retry-button"
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flex} testID="book-detail-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={toggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          testID="favorite-button"
          style={styles.favoriteButton}
        >
          <Text style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        testID="book-detail-scroll"
      >
        <Image
          source={{ uri: resolveCoverUrl(book.coverUrl) ?? 'https://via.placeholder.com/400x280?text=Sin+Portada' }}
          style={styles.cover}
          resizeMode="cover"
          testID="book-cover"
        />

        <Text style={styles.title} testID="book-title">{book.title}</Text>
        <Text style={styles.author} testID="book-author">{book.author}</Text>

        <View style={styles.ratingRow}>
          <StarRating value={book.rating} readonly />
          <Text style={styles.ratingValue} testID="book-rating">
            {book.rating.toFixed(1)}
          </Text>
        </View>

        {book.hasPdf ? (
          <TouchableOpacity
            style={styles.readButton}
            accessibilityRole="button"
            accessibilityLabel="Leer"
            testID="read-button"
            onPress={() => navigation.navigate('PDFViewer', { bookId: book.id })}
          >
            <Text style={styles.readButtonText}>Leer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.disabledReadButton}
            accessibilityRole="button"
            accessibilityLabel="Sin contenido"
            testID="read-button-disabled"
            onPress={() => Alert.alert('', 'Este libro aún no tiene contenido disponible para leer')}
          >
            <Text style={styles.disabledReadButtonText}>Sin contenido</Text>
          </TouchableOpacity>
        )}

        <View style={styles.metaSection}>
          <MetaRow label="Páginas" value={String(book.pages)} testID="book-pages" />
          <MetaRow label="Idioma" value={book.language} testID="book-language" />
          <MetaRow label="ISBN" value={book.isbn} testID="book-isbn" />
          <MetaRow label="Editorial" value={book.publisher} testID="book-publisher" />
        </View>

        <View style={styles.categoriesRow} testID="book-categories">
          {book.categories.map((cat) => (
            <View key={cat} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{cat}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sinopsis</Text>
        <Text style={styles.synopsis} testID="book-synopsis">{book.synopsis}</Text>

        <Text style={styles.sectionTitle}>Comentarios</Text>
        {book.comments.length === 0 ? (
          <Text style={styles.noComments} testID="no-comments">
            Sé el primero en comentar.
          </Text>
        ) : (
          book.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}

        <View style={styles.commentInputWrapper}>
          <CommentInput onSubmit={addComment} isLoading={isSubmittingComment} />
        </View>
      </ScrollView>
    </View>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
  testID?: string;
}

function MetaRow({ label, value, testID }: MetaRowProps): React.JSX.Element {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}:</Text>
      <Text style={styles.metaValue} testID={testID}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: '#fff' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: '#333' },
  favoriteButton: { padding: 8 },
  favoriteIcon: { fontSize: 28, color: '#ccc' },
  favoriteIconActive: { color: '#E53935' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  cover: { width: '100%', height: 280, borderRadius: 12, backgroundColor: '#e0e0e0', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  author: { fontSize: 16, color: '#666', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ratingValue: { fontSize: 16, fontWeight: '600', color: '#F5A623', marginLeft: 8 },
  readButton: { backgroundColor: '#4A90E2', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  readButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledReadButton: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  disabledReadButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
  comingSoonBadge: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#ddd' },
  comingSoonText: { color: '#999', fontSize: 16, fontWeight: '600' },
  metaSection: { marginBottom: 16 },
  metaRow: { flexDirection: 'row', marginBottom: 6 },
  metaLabel: { fontSize: 14, fontWeight: '600', color: '#555', width: 90 },
  metaValue: { fontSize: 14, color: '#333', flex: 1 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 8 },
  categoryBadge: { backgroundColor: '#EBF3FD', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
  categoryText: { fontSize: 12, color: '#4A90E2', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 10, marginTop: 4 },
  synopsis: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 20 },
  noComments: { fontSize: 14, color: '#999', fontStyle: 'italic', marginBottom: 16 },
  commentInputWrapper: { marginTop: 16 },
  errorText: { fontSize: 16, color: '#E53935', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#4A90E2', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
