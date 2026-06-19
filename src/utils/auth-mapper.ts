import type { AthleteProfile, Institution, Instructor, WeeklySchedule } from '@/types/api';
import { ADMIN_STATIC_EMAIL } from '@/constants/admin-auth';
import {
  type AuthUser,
  DEFAULT_ADMIN_NOTIFICATIONS,
  DEFAULT_NOTIFICATIONS,
  defaultInstructorProfile,
  defaultInstitutionProfile,
} from '@/contexts/auth-context';
import { defaultWeeklySchedule } from '@/utils/schedule';
import type { MeResponse } from '@/services/api';
import { resolveCountryCode } from '@/constants/countries';

export function mapMeToAuthUser(data: MeResponse): AuthUser {
  const { user, profile } = data;

  const base: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: '',
    lastName: '',
    favoriteSports: [],
    notificationPreferences: { ...DEFAULT_NOTIFICATIONS },
    paymentMethods: [],
  };

  if (user.role === 'athlete' && profile) {
    const p = profile as AthleteProfile;
    return {
      ...base,
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUri: p.photoUrl ?? null,
      favoriteSports: p.favoriteSports ?? [],
    };
  }

  if (user.role === 'instructor' && profile) {
    const p = profile as Instructor;
    const nameParts = p.displayName.trim().split(/\s+/);
    return {
      ...base,
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' '),
      avatarUri: p.photoUrl ?? null,
      instructorId: p.id,
      instructorProfile: {
        displayName: p.displayName,
        bio: p.bio ?? '',
        disciplines: p.disciplines ?? [],
        certifications: p.certifications ?? [],
        availableNow: p.availableNow,
        weeklySchedule:
          (p as Instructor & { weeklySchedule?: WeeklySchedule }).weeklySchedule ??
          defaultWeeklySchedule(),
        hourlyRate: p.hourlyRate ? String(p.hourlyRate.amount / 100) : '',
        verified: p.verified,
      },
    };
  }

  if (user.role === 'institution' && profile) {
    const p = profile as Institution;
    return {
      ...base,
      firstName: p.name,
      lastName: '',
      avatarUri: p.logoUrl ?? null,
      institutionId: p.id,
      institutionProfile: {
        name: p.name,
        description: p.description ?? '',
        address: p.location?.address ?? '',
        city: p.location?.city ?? '',
        country: resolveCountryCode(p.location?.country),
        verified: p.verified,
        gallery: p.gallery ?? [],
        instructorIds: (p.instructors ?? []).map((i) => i.id),
        pendingInvites: [],
      },
    };
  }

  return base;
}

export function createMockAdminUser(email: string = ADMIN_STATIC_EMAIL): AuthUser {
  return {
    id: 'admin-1',
    email,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Fitnexia',
    favoriteSports: [],
    notificationPreferences: { ...DEFAULT_NOTIFICATIONS },
    adminNotificationPreferences: { ...DEFAULT_ADMIN_NOTIFICATIONS },
    paymentMethods: [],
  };
}
