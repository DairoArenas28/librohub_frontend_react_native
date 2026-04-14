import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as DocumentPicker from 'expo-document-picker';
import { AdminStackParamList } from '../../types';
import { useAdminBooks } from '../../hooks/useAdminBooks';
import { BookFormData, BookStatus } from '../../types/book';
import { bookService, resolveCoverUrl } from '../../services/bookService';
import { useAppConfig } from '../../context/AppConfigContext';

type BookFormRouteProp = RouteProp<AdminStackParamList, 'BookForm'>;
type BookFormNavProp = StackNavigationProp<AdminStackParamList>;

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Formulario de creación y edición de libros.
 * Requisitos: 11.5, 11.6, 11.9, 11.10
 */
export default function BookFormScreen(): React.JSX.Element {
  const navigation = useNavigation<BookFormNavProp>();
  const route = useRoute<BookFormRouteProp>();
  const { bookId } = route.params ?? {};
  const isEditMode = Boolean(bookId);

  const { books, updateBook } = useAdminBooks();
  const { config } = useAppConfig();
  const MAX_COVER_SIZE = config.maxCoverSizeMB * 1024 * 1024;
  const MAX_PDF_SIZE   = config.maxPdfSizeMB  * 1024 * 1024;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [pages, setPages] = useState('');
  const [language, setLanguage] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [categories, setCategories] = useState('');
  const [status, setStatus] = useState<BookStatus>('active');

  // Cover image
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [coverMime, setCoverMime] = useState<string>('image/jpeg');
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // PDF
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  // Pre-populate form in edit mode
  useEffect(() => {
    if (isEditMode && bookId) {
      const book = books.find((b) => b.id === bookId);
      if (book) {
        setTitle(book.title);
        setAuthor(book.author);
        setStatus(book.status);
        if (book.coverUrl) setExistingCoverUrl(book.coverUrl);
        const detail = book as unknown as Record<string, unknown>;
        if (typeof detail.year === 'number') setYear(String(detail.year));
        if (typeof detail.pages === 'number') setPages(String(detail.pages));
        if (typeof detail.language === 'string') setLanguage(detail.language);
        if (typeof detail.isbn === 'string') setIsbn(detail.isbn);
        if (typeof detail.publisher === 'string') setPublisher(detail.publisher);
        if (typeof detail.synopsis === 'string') setSynopsis(detail.synopsis);
        if (Array.isArray(detail.categories)) setCategories((detail.categories as string[]).join(', '));
      }
    }
  }, [isEditMode, bookId, books]);

  const validate = (): boolean => {
    const errors: Partial<Record<string, string>> = {};

    if (!title.trim()) errors.title = 'El título es requerido.';
    if (!author.trim()) errors.author = 'El autor es requerido.';
    if (!isEditMode && !coverUri) errors.cover = 'La portada es requerida.';
    if (!year.trim()) {
      errors.year = 'El año es requerido.';
    } else {
      const yearNum = Number(year);
      if (!Number.isInteger(yearNum) || yearNum < 1000 || yearNum > new Date().getFullYear()) {
        errors.year = 'Ingresa un año válido.';
      }
    }
    if (!pages.trim()) {
      errors.pages = 'Las páginas son requeridas.';
    } else {
      const pagesNum = Number(pages);
      if (!Number.isInteger(pagesNum) || pagesNum <= 0) {
        errors.pages = 'Las páginas deben ser un número positivo.';
      }
    }
    if (!language.trim()) errors.language = 'El idioma es requerido.';
    if (!isbn.trim()) errors.isbn = 'El ISBN es requerido.';
    if (!publisher.trim()) errors.publisher = 'La editorial es requerida.';
    if (!synopsis.trim()) errors.synopsis = 'La sinopsis es requerida.';
    if (!categories.trim()) errors.categories = 'Las categorías son requeridas.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePickCover = async () => {
    setCoverError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/png', 'image/jpeg'],
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    if (asset.size !== undefined && asset.size > MAX_COVER_SIZE) {
      setCoverError(`La imagen no puede superar los ${config.maxCoverSizeMB} MB.`);
      return;
    }
    const mime = asset.mimeType ?? (asset.name.endsWith('.png') ? 'image/png' : 'image/jpeg');
    if (mime !== 'image/png' && mime !== 'image/jpeg') {
      setCoverError('Solo se permiten imágenes PNG o JPG.');
      return;
    }
    setCoverUri(asset.uri);
    setCoverName(asset.name);
    setCoverMime(mime);
  };

  const handlePickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    const asset = result.assets[0];
    const MAX_SIZE = MAX_PDF_SIZE;
    if (asset.size !== undefined && asset.size > MAX_SIZE) {
      setPdfError(`El archivo PDF no puede superar los ${config.maxPdfSizeMB} MB`);
      return;
    }
    setPdfUri(asset.uri);
    setPdfName(asset.name);
    setPdfError(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const data: BookFormData = {
      title: title.trim(),
      author: author.trim(),
      year: Number(year),
      pages: Number(pages),
      language: language.trim(),
      isbn: isbn.trim(),
      publisher: publisher.trim(),
      synopsis: synopsis.trim(),
      categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
      status,
    };

    try {
      let resolvedBookId: string;
      if (isEditMode && bookId) {
        await updateBook(bookId, data);
        resolvedBookId = bookId;
      } else {
        const created = await bookService.createBook(data);
        resolvedBookId = created.id;
      }

      // Upload cover if selected
      if (coverUri && coverName) {
        try {
          await bookService.uploadCover(resolvedBookId, coverUri, coverName, coverMime);
        } catch {
          // Cover upload failed — book was saved, continue
        }
      }

      // Upload PDF if selected
      if (pdfUri && pdfName) {
        try {
          await bookService.uploadPdf(resolvedBookId, pdfUri, pdfName);
        } catch {
          // PDF upload failed — book was saved, continue
        }
      }

      navigation.goBack();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Ocurrió un error. Intenta de nuevo.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine cover preview source
  const coverPreviewUri = coverUri ?? (existingCoverUrl ? resolveCoverUrl(existingCoverUrl) : null);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        testID="book-form-screen"
      >
        <Text style={styles.title} testID="form-title">
          {isEditMode ? 'Editar Libro' : 'Crear Libro'}
        </Text>

        {/* Título */}
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.input, fieldErrors.title ? styles.inputError : null]}
          value={title}
          onChangeText={setTitle}
          placeholder="Título del libro"
          placeholderTextColor="#999"
          testID="input-title"
          accessibilityLabel="Título"
        />
        {fieldErrors.title ? (
          <Text style={styles.fieldError} testID="error-title">{fieldErrors.title}</Text>
        ) : null}

        {/* Autor */}
        <Text style={styles.label}>Autor</Text>
        <TextInput
          style={[styles.input, fieldErrors.author ? styles.inputError : null]}
          value={author}
          onChangeText={setAuthor}
          placeholder="Nombre del autor"
          placeholderTextColor="#999"
          testID="input-author"
          accessibilityLabel="Autor"
        />
        {fieldErrors.author ? (
          <Text style={styles.fieldError} testID="error-author">{fieldErrors.author}</Text>
        ) : null}

        {/* Año de publicación */}
        <Text style={styles.label}>Año de publicación</Text>
        <TextInput
          style={[styles.input, fieldErrors.year ? styles.inputError : null]}
          value={year}
          onChangeText={setYear}
          placeholder="Ej: 2023"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={4}
          testID="input-year"
          accessibilityLabel="Año de publicación"
        />
        {fieldErrors.year ? (
          <Text style={styles.fieldError} testID="error-year">{fieldErrors.year}</Text>
        ) : null}

        {/* Portada (archivo) */}
        <Text style={styles.label}>Portada (PNG o JPG, máx. 5 MB)</Text>
        {coverPreviewUri ? (
          <Image
            source={{ uri: coverPreviewUri }}
            style={styles.coverPreview}
            resizeMode="cover"
            testID="cover-preview"
          />
        ) : null}
        <TouchableOpacity
          style={[styles.fileButton, fieldErrors.cover ? styles.fileButtonError : null]}
          onPress={handlePickCover}
          testID="select-cover-button"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar imagen de portada"
        >
          <Text style={styles.fileButtonText}>
            {coverUri ? '📷 Cambiar portada' : '📷 Seleccionar portada'}
          </Text>
        </TouchableOpacity>
        {coverName && !coverUri ? null : coverName ? (
          <Text style={styles.fileName} testID="cover-file-name">{coverName}</Text>
        ) : null}
        {fieldErrors.cover ? (
          <Text style={styles.fieldError} testID="error-cover">{fieldErrors.cover}</Text>
        ) : null}
        {coverError ? (
          <Text style={styles.fieldError} testID="cover-error">{coverError}</Text>
        ) : null}

        {/* Páginas */}
        <Text style={styles.label}>Páginas</Text>
        <TextInput
          style={[styles.input, fieldErrors.pages ? styles.inputError : null]}
          value={pages}
          onChangeText={setPages}
          placeholder="Número de páginas"
          placeholderTextColor="#999"
          keyboardType="numeric"
          testID="input-pages"
          accessibilityLabel="Páginas"
        />
        {fieldErrors.pages ? (
          <Text style={styles.fieldError} testID="error-pages">{fieldErrors.pages}</Text>
        ) : null}

        {/* Idioma */}
        <Text style={styles.label}>Idioma</Text>
        <TextInput
          style={[styles.input, fieldErrors.language ? styles.inputError : null]}
          value={language}
          onChangeText={setLanguage}
          placeholder="Español, Inglés..."
          placeholderTextColor="#999"
          testID="input-language"
          accessibilityLabel="Idioma"
        />
        {fieldErrors.language ? (
          <Text style={styles.fieldError} testID="error-language">{fieldErrors.language}</Text>
        ) : null}

        {/* ISBN */}
        <Text style={styles.label}>ISBN</Text>
        <TextInput
          style={[styles.input, fieldErrors.isbn ? styles.inputError : null]}
          value={isbn}
          onChangeText={setIsbn}
          placeholder="ISBN"
          placeholderTextColor="#999"
          keyboardType="numeric"
          testID="input-isbn"
          accessibilityLabel="ISBN"
        />
        {fieldErrors.isbn ? (
          <Text style={styles.fieldError} testID="error-isbn">{fieldErrors.isbn}</Text>
        ) : null}

        {/* Editorial */}
        <Text style={styles.label}>Editorial</Text>
        <TextInput
          style={[styles.input, fieldErrors.publisher ? styles.inputError : null]}
          value={publisher}
          onChangeText={setPublisher}
          placeholder="Nombre de la editorial"
          placeholderTextColor="#999"
          testID="input-publisher"
          accessibilityLabel="Editorial"
        />
        {fieldErrors.publisher ? (
          <Text style={styles.fieldError} testID="error-publisher">{fieldErrors.publisher}</Text>
        ) : null}

        {/* Sinopsis */}
        <Text style={styles.label}>Sinopsis</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline, fieldErrors.synopsis ? styles.inputError : null]}
          value={synopsis}
          onChangeText={setSynopsis}
          placeholder="Descripción del libro"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          testID="input-synopsis"
          accessibilityLabel="Sinopsis"
        />
        {fieldErrors.synopsis ? (
          <Text style={styles.fieldError} testID="error-synopsis">{fieldErrors.synopsis}</Text>
        ) : null}

        {/* Categorías */}
        <Text style={styles.label}>Categorías (separadas por coma)</Text>
        <TextInput
          style={[styles.input, fieldErrors.categories ? styles.inputError : null]}
          value={categories}
          onChangeText={setCategories}
          placeholder="Ficción, Aventura, Ciencia..."
          placeholderTextColor="#999"
          testID="input-categories"
          accessibilityLabel="Categorías"
        />
        {fieldErrors.categories ? (
          <Text style={styles.fieldError} testID="error-categories">{fieldErrors.categories}</Text>
        ) : null}

        {/* Estado */}
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusContainer} testID="status-toggle">
          <TouchableOpacity
            style={[styles.statusButton, status === 'active' && styles.statusButtonActive]}
            onPress={() => setStatus('active')}
            testID="status-active"
            accessibilityRole="button"
            accessibilityLabel="Estado activo"
            accessibilityState={{ selected: status === 'active' }}
          >
            <Text style={[styles.statusButtonText, status === 'active' && styles.statusButtonTextActive]}>
              Activo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusButton, status === 'coming_soon' && styles.statusButtonActive]}
            onPress={() => setStatus('coming_soon')}
            testID="status-coming-soon"
            accessibilityRole="button"
            accessibilityLabel="Estado próximamente"
            accessibilityState={{ selected: status === 'coming_soon' }}
          >
            <Text style={[styles.statusButtonText, status === 'coming_soon' && styles.statusButtonTextActive]}>
              Próximamente
            </Text>
          </TouchableOpacity>
        </View>

        {/* PDF */}
        <TouchableOpacity
          style={styles.fileButton}
          onPress={handlePickPdf}
          testID="select-pdf-button"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar PDF"
        >
          <Text style={styles.fileButtonText}>
            {pdfName ? '📄 Cambiar PDF' : '📄 Seleccionar PDF'}
          </Text>
        </TouchableOpacity>
        {pdfName ? (
          <Text style={styles.fileName} testID="pdf-file-name">{pdfName}</Text>
        ) : null}
        {pdfError ? (
          <Text style={styles.fieldError} testID="pdf-error">{pdfError}</Text>
        ) : null}

        {/* Submit error */}
        {submitError ? (
          <View style={styles.errorContainer} testID="submit-error">
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="submit-button"
          accessibilityRole="button"
          accessibilityLabel={isEditMode ? 'Guardar cambios' : 'Crear libro'}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" testID="submit-loading" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Guardar cambios' : 'Crear libro'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#e53935' },
  fieldError: { color: '#e53935', fontSize: 12, marginBottom: 8 },
  coverPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  fileButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  fileButtonError: { borderColor: '#e53935' },
  fileButtonText: { color: '#4A90E2', fontSize: 15, fontWeight: '600' },
  fileName: { color: '#555', fontSize: 13, marginBottom: 8 },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusButtonActive: { backgroundColor: '#4A90E2' },
  statusButtonText: { fontSize: 14, fontWeight: '600', color: '#4A90E2' },
  statusButtonTextActive: { color: '#fff' },
  errorContainer: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#e53935', fontSize: 14 },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
