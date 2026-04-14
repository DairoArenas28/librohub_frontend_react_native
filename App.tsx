import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppConfigProvider } from './src/context/AppConfigContext';
import RootNavigator from './src/navigation/RootNavigator';
import InactivityHandler from './src/components/InactivityHandler';

export default function App(): React.JSX.Element {
  return (
    <AppConfigProvider>
      <AuthProvider>
        <InactivityHandler>
          <RootNavigator />
          <StatusBar style="auto" />
        </InactivityHandler>
      </AuthProvider>
    </AppConfigProvider>
  );
}
