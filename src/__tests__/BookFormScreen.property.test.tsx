/**
 * Feature: pdf-book-upload-reader, Property 6: Nombre del archivo seleccionado siempre se muestra
 *
 * Para cualquier nombre de archivo arbitrario, cuando el usuario selecciona un PDF
 * en BookFormScreen, el elemento con testID="pdf-file-name" SHALL mostrar exactamente
 * ese nombre de archivo.
 *
 * Validates: Requirements 1.3
 */

import React from 'react';
import fc from 'fast-check';
import { render, fireEvent, act } from '@testing-library/react-native';

fc.configureGlobal({ numRuns: 50 });

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue('mock-token'),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../hooks/useAdminBooks', () => ({
  useAdminBooks: jest.fn(),
}));

jest.mock('../services/bookService', () => ({
  bookService: {
    createBook: jest.fn(),
    updateBook: jest.fn(),
    uploadPdf: jest.fn().mockResolvedValue({ hasPdf: true }),
    getBooks: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('expo-document-picker');

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../context/AppConfigContext', () => {
  const React = require('react');
  const DEFAULT_CONFIG = {
    inactivityTimeoutMinutes: 15,
    warningTimeoutSeconds: 60,
    maxCoverSizeMB: 5,
    maxPdfSizeMB: 50,
    allowPublicRegistration: true,
    catalogPollingSeconds: 30,
    showComingSoonBooks: true,
  };
  return {
    useAppConfig: () => ({
      config: DEFAULT_CONFIG,
      isLoading: false,
      updateConfig: jest.fn(),
      resetConfig: jest.fn(),
    }),
    AppConfigProvider: ({ children }: { children: React.ReactNode }) => children,
    DEFAULT_CONFIG,
  };
});

// ── Imports after mocks ───────────────────────────────────────────────────────

import * as DocumentPicker from 'expo-document-picker';
import { useAdminBooks } from '../hooks/useAdminBooks';
import BookFormScreen from '../screens/admin/BookFormScreen';

const mockUseAdminBooks = useAdminBooks as jest.Mock;
const mockDocumentPicker = DocumentPicker as jest.Mocked<typeof DocumentPicker>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupAdminBooksMock() {
  mockUseAdminBooks.mockReturnValue({
    books: [],
    filteredBooks: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    fetchBooks: jest.fn().mockResolvedValue(undefined),
    createBook: jest.fn().mockResolvedValue(undefined),
    updateBook: jest.fn().mockResolvedValue(undefined),
    deleteBook: jest.fn().mockResolvedValue(undefined),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Property 6: Nombre del archivo seleccionado siempre se muestra', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra exactamente el nombre del archivo seleccionado en testID="pdf-file-name"', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (fileName) => {
        setupAdminBooksMock();

        mockDocumentPicker.getDocumentAsync.mockResolvedValue({
          canceled: false,
          assets: [
            {
              uri: 'file:///mock/path/' + fileName,
              name: fileName,
              mimeType: 'application/pdf',
              size: 1024,
              lastModified: Date.now(),
            },
          ],
        });

        const { queryByTestId, getByTestId, unmount } = render(<BookFormScreen />);

        // Before picking, the file name should not be shown
        expect(queryByTestId('pdf-file-name')).toBeNull();

        // Press the select PDF button
        await act(async () => {
          fireEvent.press(getByTestId('select-pdf-button'));
        });

        // After picking, the file name should be displayed exactly
        const fileNameElement = getByTestId('pdf-file-name');
        expect(fileNameElement).not.toBeNull();
        expect(fileNameElement.props.children).toBe(fileName);

        unmount();
      }),
    );
  });
});
