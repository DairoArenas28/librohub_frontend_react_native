import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { ServiceError, parseError } from '../services/errorHandler';
import { UserRole } from '../types/auth';
import { useAuthContext } from '../context/AuthContext';

export interface ProfileData {
  userId: string | null;
  role: UserRole | null;
  name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

export interface UseProfileReturn extends ProfileData {
  isLoading: boolean;
  profileError: ServiceError | null;
  isChangingPassword: boolean;
  changePasswordError: ServiceError | null;
  changePasswordSuccess: boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

/**
 * Hook de perfil del usuario autenticado.
 * Expone datos del usuario y método changePassword.
 * Requisitos: 8.1, 8.4, 8.6
 */
export function useProfile(): UseProfileReturn {
  const { userId, role } = useAuthContext();

  const [profileData, setProfileData] = useState<Omit<ProfileData, 'userId' | 'role'>>({
    name: null,
    document: null,
    email: null,
    phone: null,
    avatarUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileError, setProfileError] = useState<ServiceError | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<ServiceError | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setIsLoading(true);
    setProfileError(null);

    userService
      .getMe()
      .then((user) => {
        if (cancelled) return;
        setProfileData({
          name: user.name,
          document: user.document,
          email: user.email,
          phone: user.phone,
          avatarUrl: null,
        });
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setProfileError(parseError(err));
        setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      setIsChangingPassword(true);
      setChangePasswordError(null);
      setChangePasswordSuccess(false);
      try {
        await authService.changePassword(currentPassword, newPassword);
        setChangePasswordSuccess(true);
      } catch (err) {
        setChangePasswordError(parseError(err));
        throw err;
      } finally {
        setIsChangingPassword(false);
      }
    },
    [],
  );

  return {
    userId,
    role,
    ...profileData,
    isLoading,
    profileError,
    isChangingPassword,
    changePasswordError,
    changePasswordSuccess,
    changePassword,
  };
}
