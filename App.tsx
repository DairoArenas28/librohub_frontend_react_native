import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AppConfigProvider } from './src/context/AppConfigContext';
import RootNavigator from './src/navigation/RootNavigator';
import InactivityHandler from './src/components/InactivityHandler';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppConfigProvider>
        <AuthProvider>
          <InactivityHandler>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <RootNavigator />
          </InactivityHandler>
        </AuthProvider>
      </AppConfigProvider>
    </SafeAreaProvider>
  );
}
