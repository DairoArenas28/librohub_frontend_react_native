import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export interface CommentInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

/**
 * Text input for writing and submitting a comment.
 * Validates that the text is not empty before calling onSubmit.
 * Requisitos: 7.8, 7.11
 */
export default function CommentInput({
  onSubmit,
  isLoading = false,
}: CommentInputProps): React.JSX.Element {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (text.trim().length === 0) {
      setError('El comentario no puede estar vacío');
      return;
    }
    setError(null);
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View testID="comment-input">
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={(val) => {
            setText(val);
            if (error) setError(null);
          }}
          placeholder="Escribe un comentario..."
          placeholderTextColor="#999"
          multiline
          editable={!isLoading}
          testID="comment-input-field"
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentario"
          testID="comment-submit-button"
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
      {error !== null && (
        <Text style={styles.errorText} testID="comment-error">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    minHeight: 44,
    maxHeight: 100,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
    minHeight: 44,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4F1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
