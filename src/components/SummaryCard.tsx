import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export interface SummaryCardProps {
  title: string;
  activeCount: number;
  inactiveCount: number;
  isLoading: boolean;
  onPress: () => void;
}

/**
 * Tarjeta de resumen para el dashboard del administrador.
 * Muestra conteos activos/inactivos con estado de carga.
 * Requisitos: 9.2, 9.3, 9.7
 */
export default function SummaryCard({
  title,
  activeCount,
  inactiveCount,
  isLoading,
  onPress,
}: SummaryCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      testID="summary-card"
    >
      <Text style={styles.title} testID="summary-card-title">
        {title}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#4A90E2" testID="summary-card-loading" />
      ) : (
        <View style={styles.countsRow}>
          <View style={styles.countItem}>
            <Text style={styles.countValue} testID="summary-card-active">
              {activeCount}
            </Text>
            <Text style={styles.countLabel}>Activos</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.countItem}>
            <Text style={styles.countValue} testID="summary-card-inactive">
              {inactiveCount}
            </Text>
            <Text style={styles.countLabel}>Inactivos</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  countsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  countItem: { alignItems: 'center', flex: 1 },
  countValue: { fontSize: 24, fontWeight: '700', color: '#4A90E2' },
  countLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  separator: { width: 1, height: 40, backgroundColor: '#e0e0e0' },
});
