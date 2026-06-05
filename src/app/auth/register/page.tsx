'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { RoleCard } from '@/components/role-card';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { DISCIPLINES } from '@/constants/fitnexia';
import { ALERT_LABELS, AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
import type { UserRole } from '@/types/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('athlete');
  const selectRole = (newRole: Exclude<UserRole, 'admin'>) => {
    setRole(newRole);
    setStep(2);
  };
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [institutionName, setInstitutionName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      alert(ALERT_LABELS.fillAllFields);
      return;
    }
    if (role === 'institution' && !institutionName.trim()) {
      alert(ALERT_LABELS.gymNameRequired);
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        role,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUri,
        favoriteSports: role === 'athlete' ? favoriteSports : [],
        disciplines: role === 'instructor' ? disciplines : [],
        institutionName: role === 'institution' ? institutionName.trim() : undefined,
      });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <button
          type="button"
          onClick={() => (step === 1 ? router.back() : setStep(1))}
          className="text-sm text-[var(--fn-text-muted)]"
        >
          ← Back
        </button>

        {step === 1 ? (
          <div className="mt-8 text-center">
            <div className="mb-4">
              <img src="/fitnexia-logo.svg" alt="Fitnexia Logo" className="mx-auto h-14 w-auto" />
            </div>
            <h1 className="text-3xl font-extrabold md:text-4xl">{AUTH_LABELS.chooseProfile}</h1>
            <p className="mt-3 text-lg text-[var(--fn-text-muted)]">{AUTH_LABELS.howWillYouUse}</p>

            {/* Horizontal role selection */}
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <RoleCard role="athlete" selected={role === 'athlete'} onPress={() => selectRole('athlete')} />
              <RoleCard role="instructor" selected={role === 'instructor'} onPress={() => selectRole('instructor')} />
              <RoleCard role="institution" selected={role === 'institution'} onPress={() => selectRole('institution')} />
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold md:text-4xl">{AUTH_LABELS.createAccount}</h1>
              <p className="mt-3 text-lg text-[var(--fn-text-muted)]">{AUTH_LABELS.completeProfile}</p>
            </div>

            <div className="mt-10 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6 md:p-8">
              <div className="mb-6 flex justify-center">
                <ProfilePictureUpload
                  currentAvatar={avatarUri}
                  onUpload={setAvatarUri}
                  role={role}
                  size="lg"
                />
              </div>
              {role === 'institution' ? (
                <Input
                  label={AUTH_LABELS.gymSchoolName}
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder={AUTH_LABELS.gymSchoolPlaceholder}
                />
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input
                label={AUTH_LABELS.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {role === 'athlete' ? (
                <div className="mb-6">
                  <p className="mb-3 text-base font-medium">Favorite sports</p>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={favoriteSports.includes(s)}
                        onPress={() => toggle(favoriteSports, setFavoriteSports, s)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {role === 'instructor' ? (
                <div className="mb-6">
                  <p className="mb-3 text-base font-medium">Disciplines</p>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={disciplines.includes(s)}
                        onPress={() => toggle(disciplines, setDisciplines, s)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <Button title={BUTTON_LABELS.createAccount} loading={loading} onClick={submit} />
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-base">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-[var(--fn-primary)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
