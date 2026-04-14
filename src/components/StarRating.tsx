import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export interface StarRatingProps {
  value: number; // 1–5
  readonly?: boolean;
  onChange?: (value: number) => void;
}

/**
 * Displays a 1–5 star rating.
 * In readonly mode: shows filled/empty stars based on value.
 * In editable mode: allows tapping stars to change value.
 * Requisitos: 7.2
 */
export default function StarRating({
  value,
  readonly = false,
  onChange,
}: StarRatingProps): React.JSX.Element {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container} testID="star-rating">
      {stars.map((star) => {
        const filled = star <= value;
        if (readonly) {
          return (
            <Text
              key={star}
              style={[styles.star, filled ? styles.filled : styles.empty]}
              testID={`star-${star}`}
            >
              {filled ? '★' : '☆'}
            </Text>
          );
        }
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange?.(star)}
            accessibilityRole="button"
            accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
            testID={`star-${star}`}
          >
            <Text style={[styles.star, filled ? styles.filled : styles.empty]}>
              {filled ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  filled: {
    color: '#F5A623',
  },
  empty: {
    color: '#C0C0C0',
  },
});
