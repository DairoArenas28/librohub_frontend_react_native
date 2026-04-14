import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from '../../types';
import SummaryCard from '../../components/SummaryCard';
import { useDashboard } from '../../hooks/useDashboard';

type AdminHomeNavProp = BottomTabNavigationProp<AdminTabParamList, 'AdminHome'>;

export default function AdminHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<AdminHomeNavProp>();
  const { stats, isLoading, error, retry, fetchStats } = useDashboard();

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [fetchStats]),
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      testID="admin-home-screen"
    >
      <Text style={styles.title} testID="admin-home-title">
        Administrador
      </Text>

      {error ? (
        <View style={styles.errorContainer} testID="admin-home-error">
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retry}
            testID="admin-home-retry"
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <SummaryCard
            title="Usuarios"
            activeCount={stats?.users.active ?? 0}
            inactiveCount={stats?.users.inactive ?? 0}
            isLoading={isLoading}
            onPress={() => navigation.navigate('Users')}
          />
          <SummaryCard
            title="Libros"
            activeCount={stats?.books.active ?? 0}
            inactiveCount={stats?.books.inactive ?? 0}
            isLoading={isLoading}
            onPress={() => navigation.navigate('Books')}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 16 },
  errorContainer: { alignItems: 'center', marginTop: 32 },
  errorText: { fontSize: 14, color: '#e53935', textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: '#4A90E2', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
