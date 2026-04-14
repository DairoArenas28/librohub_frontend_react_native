import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import { useAuthContext } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';

interface Props {
  children: React.ReactNode;
}

export default function InactivityHandler({ children }: Props): React.JSX.Element {
  const { token, logout } = useAuthContext();
  const { config } = useAppConfig();
  const isAuthenticated = Boolean(token);

  const { resetTimer } = useInactivityTimer({
    isAuthenticated,
    onLogout: logout,
    inactivityMinutes: config.inactivityTimeoutMinutes,
    warningSeconds: config.warningTimeoutSeconds,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        resetTimer();
        return false;
      },
    }),
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
