'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

import type { Certification, UserRole, WeeklySchedule } from '@/types/api';
import { defaultWeeklySchedule } from '@/utils/schedule';

export interface NotificationPreferences {
  bookingConfirmed: boolean;
  classReminders: boolean;
  paymentUpdates: boolean;
  creditsExpiring: boolean;
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
  marketing: false,
};

const STORAGE_KEYS = {
  USER: 'fitnexia_user',
  HAS_SEEN_ONBOARDING: 'fitnexia_has_seen_onboarding',
};

export function defaultInstructorProfile(firstName: string, lastName: string, disciplines: string[] = []): InstructorProfileData {
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
    country: '',
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
  completeOnboarding: () => void;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  updateProfile: (updates: UpdateProfileParams) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type UserSeed = Omit<AuthUser, 'favoriteSports' | 'notificationPreferences' | 'paymentMethods'> & {
  favoriteSports?: string[];
  notificationPreferences?: NotificationPreferences;
  paymentMethods?: PaymentMethod[];
};

function createUser(partial: UserSeed): AuthUser {
  return {
    favoriteSports: partial.favoriteSports ?? [],
    notificationPreferences: partial.notificationPreferences ?? { ...DEFAULT_NOTIFICATIONS },
    paymentMethods: partial.paymentMethods ?? [],
    ...partial,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedOnboarding = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedOnboarding) {
      setHasSeenOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // Persist onboarding state
  useEffect(() => {
    if (hasSeenOnboarding) {
      localStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
    }
  }, [hasSeenOnboarding]);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  const login = useCallback(async (email: string, _password: string, role: UserRole = 'athlete') => {
    const base = {
      email,
      role,
      firstName: 'Demo',
      lastName: 'Usuario',
      favoriteSports: role === 'athlete' ? ['Yoga', 'Tenis'] : [],
    };

    if (role === 'instructor') {
      setUser(
        createUser({
          ...base,
          id: 'inst-1',
          instructorId: 'inst-1',
          instructorProfile: {
            ...defaultInstructorProfile('Demo', 'Usuario', ['Tenis', 'Padel']),
            bio: 'Entrenador de tenis certificado por PTR con más de 10 años de experiencia.',
            availableNow: true,
            weeklySchedule: defaultWeeklySchedule(),
            hourlyRate: '50',
            verified: true,
            certifications: [
              { name: 'Certificado PTR', issuer: 'PTR', year: 2018 },
              { name: 'Psicología del Deporte', issuer: 'ITF', year: 2020 },
            ],
          },
        }),
      );
      return;
    }

    if (role === 'institution') {
      setUser(
        createUser({
          ...base,
          id: 'gym-1',
          institutionId: 'gym-1',
          institutionProfile: {
            ...defaultInstitutionProfile('FitHub Centro'),
            description: 'Estudio de fitness premium en el centro de la ciudad.',
            address: 'Calle Principal 123',
            city: 'Buenos Aires',
            country: 'AR',
            verified: true,
            instructorIds: ['inst-1', 'inst-2', 'inst-3'],
          },
        }),
      );
      return;
    }

    setUser(createUser({ ...base, id: 'mock-user' }));
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const base: UserSeed = {
      id: 'mock-user-new',
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      avatarUri: params.avatarUri ?? null,
      favoriteSports: params.favoriteSports ?? [],
    };

    if (params.role === 'instructor') {
      setUser(
        createUser({
          ...base,
          instructorId: `inst-${Date.now()}`,
          instructorProfile: defaultInstructorProfile(
            params.firstName,
            params.lastName,
            params.disciplines ?? [],
          ),
        }),
      );
      return;
    }

    if (params.role === 'institution') {
      const gymName =
        params.institutionName?.trim() || `${params.firstName} ${params.lastName}`.trim();
      setUser(
        createUser({
          ...base,
          institutionId: `gym-${Date.now()}`,
          institutionProfile: defaultInstitutionProfile(gymName),
        }),
      );
      return;
    }

    setUser(createUser(base));
  }, []);

  const updateProfile = useCallback((updates: UpdateProfileParams) => {
    setUser((prev) => {
      if (!prev) return prev;
      return createUser({
        ...prev,
        ...updates,
        notificationPreferences: updates.notificationPreferences
          ? { ...prev.notificationPreferences, ...updates.notificationPreferences }
          : prev.notificationPreferences,
        paymentMethods: updates.paymentMethods ?? prev.paymentMethods,
        instructorProfile: updates.instructorProfile
          ? prev.instructorProfile
            ? { ...prev.instructorProfile, ...updates.instructorProfile }
            : prev.role === 'instructor'
              ? {
                  ...defaultInstructorProfile(prev.firstName, prev.lastName),
                  ...updates.instructorProfile,
                }
              : undefined
          : prev.instructorProfile,
        institutionProfile: updates.institutionProfile
          ? prev.institutionProfile
            ? { ...prev.institutionProfile, ...updates.institutionProfile }
            : prev.role === 'institution'
              ? {
                  ...defaultInstitutionProfile(`${prev.firstName} ${prev.lastName}`.trim() || 'Gym'),
                  ...updates.institutionProfile,
                }
              : undefined
          : prev.institutionProfile,
      });
    });
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    // Mock password change - in a real app, you'd verify the current password and update it
    await new Promise(resolve => setTimeout(resolve, 500));
    // For this mock, we just "succeed" if newPassword is at least 6 characters
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const value = useMemo(
    () => ({
      user,
      hasSeenOnboarding,
      isLoading,
      completeOnboarding,
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }),
    [user, hasSeenOnboarding, isLoading, completeOnboarding, login, register, updateProfile, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { DEFAULT_NOTIFICATIONS };
