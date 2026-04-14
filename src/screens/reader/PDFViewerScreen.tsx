import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReaderStackParamList } from '../../types';
import { bookService } from '../../services/bookService';

const TOKEN_KEY = 'auth_token';

type Props = NativeStackScreenProps<ReaderStackParamList, 'PDFViewer'>;

export default function PDFViewerScreen({ route, navigation }: Props) {
  const { bookId } = route.params;

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    loadPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  async function loadPdf() {
    try {
      setLoading(true);
      setError(false);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const url = bookService.getPdfUrl(bookId);
      const cacheDir = FileSystem.cacheDirectory ?? 'file:///tmp/';
      const localUri = `${cacheDir}book_${bookId}_${retryKey}.pdf`;

      const result = await FileSystem.downloadAsync(url, localUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (result.status !== 200) {
        throw new Error(`HTTP ${result.status}`);
      }

      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setPdfBase64(base64);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRetryKey((k) => k + 1);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator testID="pdf-loading" size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando PDF...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text testID="pdf-error-message" style={styles.errorText}>
          No se pudo cargar el PDF. Verifica tu conexión e intenta de nuevo
        </Text>
        <TouchableOpacity testID="pdf-retry-button" style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="pdf-close-button" style={styles.closeButtonFlat} onPress={() => navigation.goBack()}>
          <Text style={styles.closeTextDark}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // PDF.js renders the PDF from a base64 data URI using pure JavaScript
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #404040; }
    #viewer { width: 100%; }
    canvas { display: block; margin: 8px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.5); }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const base64 = '${pdfBase64}';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    pdfjsLib.getDocument({ data: bytes }).promise.then(function(pdf) {
      const viewer = document.getElementById('viewer');
      const width = window.innerWidth - 16;
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(function(page) {
          const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          viewer.appendChild(canvas);
          page.render({ canvasContext: canvas.getContext('2d'), viewport });
        });
      }
    }).catch(function(err) {
      document.body.innerHTML = '<p style="color:red;padding:20px">Error al renderizar: ' + err.message + '</p>';
    });
  </script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="pdf-close-button"
        style={styles.closeButtonTop}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        mixedContentMode="always"
        onError={() => setError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#404040',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    fontSize: 15,
    color: '#c00',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeButtonFlat: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeTextDark: {
    color: '#6200ee',
    fontWeight: '600',
  },
  closeButtonTop: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
