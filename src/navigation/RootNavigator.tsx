import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import ReaderNavigator from './ReaderNavigator';
import AdminNavigator from './AdminNavigator';
import { resolveNavigator } from './resolveNavigator';

// Re-export for consumers that import from RootNavigator
export { resolveNavigator } from './resolveNavigator';

export default function RootNavigator(): React.JSX.Element {
  const { role, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const navigator = resolveNavigator(role);

  return (
    <NavigationContainer>
      {navigator === 'reader' && <ReaderNavigator />}
      {navigator === 'admin' && <AdminNavigator />}
      {navigator === 'auth' && <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
