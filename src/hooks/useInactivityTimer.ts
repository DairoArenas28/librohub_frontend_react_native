import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';

interface Options {
  isAuthenticated: boolean;
  onLogout: () => void;
  /** Minutos de inactividad (0 = desactivado) */
  inactivityMinutes: number;
  /** Segundos de aviso antes del logout automático */
  warningSeconds: number;
}

export function useInactivityTimer({
  isAuthenticated,
  onLogout,
  inactivityMinutes,
  warningSeconds,
}: Options) {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertShown      = useRef(false);
  const backgroundTime  = useRef<number | null>(null);

  const timeoutMs = inactivityMinutes * 60 * 1000;
  const warningMs = warningSeconds * 1000;

  const clearTimers = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current)    clearTimeout(warningTimer.current);
    inactivityTimer.current = null;
    warningTimer.current    = null;
  }, []);

  const doLogout = useCallback(() => {
    clearTimers();
    alertShown.current = false;
    onLogout();
  }, [clearTimers, onLogout]);

  const showWarning = useCallback(() => {
    if (alertShown.current) return;
    alertShown.current = true;

    warningTimer.current = setTimeout(() => {
      alertShown.current = false;
      doLogout();
    }, warningMs);

    Alert.alert(
      'Sesión inactiva',
      '¿Deseas continuar con tu sesión?',
      [
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            if (warningTimer.current) clearTimeout(warningTimer.current);
            alertShown.current = false;
            doLogout();
          },
        },
        {
          text: 'Continuar',
          onPress: () => {
            if (warningTimer.current) clearTimeout(warningTimer.current);
            alertShown.current = false;
            resetTimer(); // eslint-disable-line @typescript-eslint/no-use-before-define
          },
        },
      ],
      { cancelable: false },
    );
  }, [doLogout, warningMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetTimer = useCallback(() => {
    if (!isAuthenticated || inactivityMinutes === 0) return;
    clearTimers();
    alertShown.current = false;
    inactivityTimer.current = setTimeout(showWarning, timeoutMs);
  }, [isAuthenticated, inactivityMinutes, clearTimers, showWarning, timeoutMs]);

  useEffect(() => {
    if (isAuthenticated && inactivityMinutes > 0) {
      resetTimer();
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [isAuthenticated, inactivityMinutes, resetTimer, clearTimers]);

  useEffect(() => {
    if (!isAuthenticated || inactivityMinutes === 0) return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundTime.current = Date.now();
      } else if (nextState === 'active') {
        if (backgroundTime.current !== null) {
          const elapsed = Date.now() - backgroundTime.current;
          backgroundTime.current = null;
          if (elapsed >= timeoutMs) {
            doLogout();
            return;
          }
        }
        resetTimer();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isAuthenticated, inactivityMinutes, timeoutMs, resetTimer, doLogout]);

  return { resetTimer };
}
