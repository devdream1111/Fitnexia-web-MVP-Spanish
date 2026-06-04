'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { RoleCard } from '@/components/role-card';
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
  const [role, setRole] = useState<UserRole>('athlete');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [institutionName, setInstitutionName] = useState('');
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
    <div className="mx-auto min-h-screen max-w-md px-6 py-12">
      <button
        type="button"
        onClick={() => (step === 1 ? router.back() : setStep(1))}
        className="text-sm text-[var(--fn-text-muted)]">
        ← Back
      </button>
      <h1 className="mt-4 text-3xl font-extrabold">
        {step === 1 ? AUTH_LABELS.chooseProfile : AUTH_LABELS.createAccount}
      </h1>
      <p className="mt-2 text-[var(--fn-text-muted)]">
        {step === 1 ? AUTH_LABELS.howWillYouUse : AUTH_LABELS.completeProfile}
      </p>

      {step === 1 ? (
        <div className="mt-8">
          <RoleCard role="athlete" selected={role === 'athlete'} onPress={() => setRole('athlete')} />
          <RoleCard role="instructor" selected={role === 'instructor'} onPress={() => setRole('instructor')} />
          <RoleCard role="institution" selected={role === 'institution'} onPress={() => setRole('institution')} />
          <Button title={BUTTON_LABELS.continue} onClick={() => setStep(2)} />
        </div>
      ) : (
        <div className="mt-8">
          {role === 'institution' ? (
            <Input
              label={AUTH_LABELS.gymSchoolName}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder={AUTH_LABELS.gymSchoolPlaceholder}
            />
          ) : null}
          <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label={AUTH_LABELS.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {role === 'athlete' ? (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Favorite sports</p>
              <div className="flex flex-wrap gap-1">
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
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Disciplines</p>
              <div className="flex flex-wrap gap-1">
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
      )}

      <p className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-[var(--fn-primary)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
