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
  isUploadingAvatar: boolean;
  uploadAvatar: (fileUri: string) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const { userId, role } = useAuthContext();

  const [profileData, setProfileData] = useState<Omit<ProfileData, 'userId' | 'role'>>({
    name: null, document: null, email: null, phone: null, avatarUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileError, setProfileError] = useState<ServiceError | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<ServiceError | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [avatarRefresh, setAvatarRefresh] = useState(0);

  const loadProfile = useCallback(() => {
    if (!userId) return;
    setIsLoading(true);
    setProfileError(null);
    userService.getMe()
      .then(async (user) => {
        const avatarUrl = user.hasAvatar
          ? await userService.getAvatarBase64(user.id)
          : null;
        console.log('[useProfile] hasAvatar:', user.hasAvatar, 'avatarUrl length:', avatarUrl?.length);
        setProfileData({
          name: user.name,
          document: user.document,
          email: user.email,
          phone: user.phone,
          avatarUrl,
        });
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setProfileError(parseError(err));
        setIsLoading(false);
      });
  }, [userId, avatarRefresh]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
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
  }, []);

  const uploadAvatar = useCallback(async (fileUri: string) => {
    setIsUploadingAvatar(true);
    try {
      await userService.uploadAvatar(fileUri);
      setAvatarRefresh((n) => n + 1); // fuerza recarga del perfil
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

  return {
    userId, role, ...profileData,
    isLoading, profileError,
    isChangingPassword, changePasswordError, changePasswordSuccess, changePassword,
    isUploadingAvatar, uploadAvatar,
  };
}
