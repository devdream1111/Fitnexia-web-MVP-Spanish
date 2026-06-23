'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

import { DEFAULT_COUNTRY_CODE, resolveCountryCode } from '@/constants/countries';
import { DEFAULT_CURRENCY } from '@/constants/fitnexia';
import type { Certification, UserRole, WeeklySchedule } from '@/types/api';
import { ApiClientError } from '@/services/api-client';
import {
  apiForgotPassword,
  apiGetMe,
  apiGetNotificationPreferences,
  apiGoogleOAuth,
  apiLogin,
  apiLogout,
  apiRegister,
  apiUpdateAthleteProfile,
  apiUpdateInstructor,
  apiSetAvailableNow,
  apiUpdateInstitution,
  apiUpdateNotificationPreferences,
  apiUpdateUserEmail,
  type RegisterBody,
} from '@/services/api';
import { clearTokens, getRefreshToken, setTokens } from '@/services/api-client';
import { mapMeToAuthUser } from '@/utils/auth-mapper';
import { resolveUploadableImageUrl, resolveUploadableImageUrls } from '@/utils/media';
import { defaultWeeklySchedule } from '@/utils/schedule';

export interface NotificationPreferences {
  bookingConfirmed: boolean;
  classReminders: boolean;
  paymentUpdates: boolean;
  creditsExpiring: boolean;
  membershipReminders: boolean;
  memberDelinquencyAlerts: boolean;
  marketing: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface InstructorProfileData {
  displayName: string;
  bio: string;
  disciplines: string[];
  certifications: Certification[];
  availableNow: boolean;
  weeklySchedule: WeeklySchedule;
  hourlyRate: string;
  verified: boolean;
}

export interface InstructorInvite {
  id: string;
  email: string;
  sentAt: string;
  status: 'pending' | 'accepted';
}

export interface InstitutionProfileData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  verified: boolean;
  gallery: string[];
  instructorIds: string[];
  pendingInvites: InstructorInvite[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUri?: string | null;
  favoriteSports: string[];
  notificationPreferences: NotificationPreferences;
  paymentMethods: PaymentMethod[];
  instructorId?: string;
  instructorProfile?: InstructorProfileData;
  institutionId?: string;
  institutionProfile?: InstitutionProfileData;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  bookingConfirmed: true,
  classReminders: true,
  paymentUpdates: true,
  creditsExpiring: true,
  membershipReminders: true,
  memberDelinquencyAlerts: true,
  marketing: false,
};

const STORAGE_KEYS = {
  USER: 'fitnexia_user',
  HAS_SEEN_ONBOARDING: 'fitnexia_has_seen_onboarding',
};

export function defaultInstructorProfile(
  firstName: string,
  lastName: string,
  disciplines: string[] = [],
): InstructorProfileData {
  return {
    displayName: `${firstName} ${lastName}`.trim(),
    bio: '',
    disciplines,
    certifications: [],
    availableNow: false,
    weeklySchedule: defaultWeeklySchedule(),
    hourlyRate: '',
    verified: false,
  };
}

export function defaultInstitutionProfile(name: string): InstitutionProfileData {
  return {
    name,
    description: '',
    address: '',
    city: '',
    country: DEFAULT_COUNTRY_CODE,
    verified: false,
    gallery: [],
    instructorIds: [],
    pendingInvites: [],
  };
}

export type RegisterParams = {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUri?: string | null;
  favoriteSports?: string[];
  disciplines?: string[];
  institutionName?: string;
  acceptTerms?: boolean;
};

export type UpdateProfileParams = Partial<
  Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'avatarUri' | 'favoriteSports'>
> & {
  notificationPreferences?: Partial<NotificationPreferences>;
  paymentMethods?: PaymentMethod[];
  instructorProfile?: Partial<InstructorProfileData>;
  institutionProfile?: Partial<InstitutionProfileData>;
};

interface AuthContextValue {
  user: AuthUser | null;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  completeOnboarding: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (params: RegisterParams) => Promise<void>;
  googleSignIn: (params: {
    idToken: string;
    role?: UserRole;
    institutionName?: string;
  }) => Promise<AuthUser>;
  updateProfile: (updates: UpdateProfileParams) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadNotificationPrefs(): Promise<NotificationPreferences> {
  try {
    return await apiGetNotificationPreferences();
  } catch {
    return { ...DEFAULT_NOTIFICATIONS };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const refreshUser = useCallback(async () => {
    const me = await apiGetMe();
    const mapped = mapMeToAuthUser(me);
    const prefs = await loadNotificationPrefs();
    setUser({ ...mapped, notificationPreferences: prefs });
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const storedOnboarding = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      if (storedOnboarding) setHasSeenOnboarding(true);

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        clearTokens();
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, [refreshUser]);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const auth = await apiLogin(email.trim(), password);
      setTokens(auth.accessToken, auth.refreshToken);

      const me = await apiGetMe();
      const mapped = mapMeToAuthUser(me);
      const prefs = await loadNotificationPrefs();
      const nextUser = { ...mapped, notificationPreferences: prefs };
      setUser(nextUser);
      return nextUser;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setIsAuthenticating(true);
    try {
    const photoUrl = params.avatarUri
      ? await resolveUploadableImageUrl(params.avatarUri)
      : undefined;

    const body: RegisterBody = {
      email: params.email.trim(),
      password: params.password,
      role: params.role,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim() || 'User',
      favoriteSports: params.favoriteSports,
      disciplines: params.disciplines,
      institutionName: params.institutionName,
      photoUrl,
      acceptTerms: params.acceptTerms ?? true,
    };

    const auth = await apiRegister(body);
    setTokens(auth.accessToken, auth.refreshToken);

    const me = await apiGetMe();
    const mapped = mapMeToAuthUser(me);
    const prefs = await loadNotificationPrefs();
    setUser({ ...mapped, notificationPreferences: prefs });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const googleSignIn = useCallback(
    async (params: {
      idToken: string;
      role?: UserRole;
      institutionName?: string;
    }) => {
      setIsAuthenticating(true);
      try {
      const auth = await apiGoogleOAuth({
        idToken: params.idToken,
        role: params.role,
        institutionName: params.institutionName,
      });
      setTokens(auth.accessToken, auth.refreshToken);

      const me = await apiGetMe();
      const mapped = mapMeToAuthUser(me);
      const prefs = await loadNotificationPrefs();
      const nextUser = { ...mapped, notificationPreferences: prefs };
      setUser(nextUser);
      return nextUser;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async (updates: UpdateProfileParams) => {
      if (!user) return;

      if (updates.email && updates.email !== user.email) {
        await apiUpdateUserEmail(updates.email);
      }

      if (updates.notificationPreferences) {
        const prefs = await apiUpdateNotificationPreferences(updates.notificationPreferences);
        setUser((prev) => (prev ? { ...prev, notificationPreferences: prefs } : prev));
      }

      if (user.role === 'athlete') {
        const hasProfileFields =
          updates.firstName !== undefined ||
          updates.lastName !== undefined ||
          updates.avatarUri !== undefined ||
          updates.favoriteSports !== undefined;

        if (hasProfileFields) {
          const photoUrl =
            updates.avatarUri !== undefined
              ? await resolveUploadableImageUrl(updates.avatarUri)
              : undefined;

          const profile = await apiUpdateAthleteProfile({
            firstName: updates.firstName,
            lastName: updates.lastName,
            ...(photoUrl !== undefined ? { photoUrl } : {}),
            favoriteSports: updates.favoriteSports,
          });
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  avatarUri: profile.photoUrl ?? null,
                  favoriteSports: profile.favoriteSports ?? [],
                  email: updates.email ?? prev.email,
                }
              : prev,
          );
        } else if (updates.email) {
          setUser((prev) => (prev ? { ...prev, email: updates.email! } : prev));
        }
        return;
      }

      if (user.role === 'instructor' && (updates.instructorProfile || updates.avatarUri !== undefined)) {
        const ip = updates.instructorProfile;
        const body: Record<string, unknown> = {};
        if (ip?.displayName !== undefined) body.displayName = ip.displayName;
        if (ip?.bio !== undefined) body.bio = ip.bio;
        if (ip?.disciplines !== undefined) body.disciplines = ip.disciplines;
        if (ip?.certifications !== undefined) body.certifications = ip.certifications;
        if (ip?.hourlyRate !== undefined && ip.hourlyRate !== '') {
          body.hourlyRate = {
            amount: Math.round(parseFloat(ip.hourlyRate) * 100),
            currency: DEFAULT_CURRENCY,
          };
        }
        if (updates.avatarUri !== undefined) {
          const photoUrl = await resolveUploadableImageUrl(updates.avatarUri);
          if (photoUrl) body.photoUrl = photoUrl;
        }

        if (Object.keys(body).length > 0) {
          await apiUpdateInstructor(body);
        }

        if (ip?.availableNow !== undefined) {
          await apiSetAvailableNow(ip.availableNow);
        }

        await refreshUser();
        return;
      }

      if (
        user.role === 'institution' &&
        (updates.institutionProfile || updates.avatarUri !== undefined)
      ) {
        const ip = updates.institutionProfile;
        const body: Record<string, unknown> = {};
        if (ip?.name !== undefined) body.name = ip.name;
        if (ip?.description !== undefined) body.description = ip.description;
        if (ip?.gallery !== undefined) {
          body.gallery = await resolveUploadableImageUrls(ip.gallery);
        }
        if (updates.avatarUri !== undefined) {
          const logoUrl = await resolveUploadableImageUrl(updates.avatarUri);
          if (logoUrl) body.logoUrl = logoUrl;
        }
        if (ip && (ip.address !== undefined || ip.city !== undefined || ip.country !== undefined)) {
          const countryCode = resolveCountryCode(ip.country ?? user.institutionProfile?.country);
          if (countryCode) {
            body.location = {
              address: ip.address ?? user.institutionProfile?.address ?? '',
              city: ip.city ?? user.institutionProfile?.city ?? '',
              country: countryCode,
            };
          }
        }
        if (Object.keys(body).length > 0) {
          await apiUpdateInstitution(body);
          await refreshUser();
        }
      }
    },
    [user, refreshUser],
  );

  const changePassword = useCallback(async (_currentPassword: string, newPassword: string) => {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    throw new Error('Password change is not available yet');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch {
        // ignore logout errors
      }
    }

    clearTokens();
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      hasSeenOnboarding,
      isLoading,
      isAuthenticating,
      completeOnboarding,
      login,
      register,
      googleSignIn,
      updateProfile,
      changePassword,
      logout,
      refreshUser,
    }),
    [
      user,
      hasSeenOnboarding,
      isLoading,
      isAuthenticating,
      completeOnboarding,
      login,
      register,
      googleSignIn,
      updateProfile,
      changePassword,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { DEFAULT_NOTIFICATIONS };

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    const errors = err.details?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const messages = errors
        .map((item) => {
          if (item && typeof item === 'object' && 'message' in item) {
            return String((item as { message?: string }).message ?? '');
          }
          return '';
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join('. ');
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
