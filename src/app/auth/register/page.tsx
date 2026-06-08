'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { ALERT_LABELS, AUTH_LABELS, BUTTON_LABELS, GENERAL_LABELS, ROLE_TITLES } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.5 24.5C47.5 22.9 47.3 21.3 47 19.8H24V29H38.3C37.8 31.6 36.4 33.9 34.2 35.6L42 41.6C45.3 38.6 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
    <path d="M24 48C30.4 48 35.8 45.9 40 42.4L32.2 36.4C29.9 38.1 27.1 39.1 24 39.1C18.2 39.1 13.2 35.9 11.1 31.2L3.3 37.5C7.4 45.3 15.1 48 24 48Z" fill="#34A853"/>
    <path d="M11.1 31.2C9.9 28.8 9.2 26.1 9.2 23.2C9.2 20.3 9.9 17.6 11.1 15.2L3.3 8.9C0.5 14.4 0 20.5 0 23.2C0 25.9 0.5 32 3.3 37.5L11.1 31.2Z" fill="#FBBC05"/>
    <path d="M24 8.8C27.3 8.8 30.3 10 32.7 12.3L39.8 5.2C35.7 1.5 30.3 0 24 0C15.1 0 7.4 2.7 3.3 8.9L11.1 15.2C13.2 10.5 18.2 7.3 24 7.3C24 7.3 24 8.8 24 8.8Z" fill="#EA4335"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const googleSignIn = useFeature('googleSignIn');
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('athlete');
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (role === 'institution') {
      if (!institutionName.trim() || !email.trim() || !password.trim()) {
        alert(ALERT_LABELS.fillAllFields);
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        alert(ALERT_LABELS.fillAllFields);
        return;
      }
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        role,
        firstName: role === 'institution' ? institutionName.trim() : firstName.trim(),
        lastName: role === 'institution' ? '' : lastName.trim(),
        avatarUri: null,
        favoriteSports: [],
        disciplines: [],
        institutionName: role === 'institution' ? institutionName.trim() : undefined,
      });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'athlete', label: ROLE_TITLES.athlete },
    { value: 'instructor', label: ROLE_TITLES.instructor },
    { value: 'institution', label: ROLE_TITLES.institution },
  ];

  return (
    <div className="mx-auto flex flex-col px-6 py-12 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center animate-bounce-in">
          <h1 className="text-3xl font-extrabold md:text-4xl">{AUTH_LABELS.createAccount}</h1>
          <p className="mt-3 text-lg text-[var(--fn-text-muted)]">{AUTH_LABELS.completeProfile}</p>
        </div>

        <div className="mt-10 space-y-4 animate-slide-up stagger-1">
          {role === 'institution' ? (
            <Input
              label={AUTH_LABELS.gymSchoolName}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder={AUTH_LABELS.gymSchoolPlaceholder}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label={AUTH_LABELS.firstName} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label={AUTH_LABELS.lastName} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          )}
          <Input label={AUTH_LABELS.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label={AUTH_LABELS.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select
            label={AUTH_LABELS.chooseProfile}
            value={role}
            onChange={(val) => setRole(val as Exclude<UserRole, 'admin'>)}
            options={roleOptions}
          />
          <Button
            title={BUTTON_LABELS.createAccount}
            loading={loading}
            className="w-full hover:animate-pulse-glow"
            onClick={submit}
          />
        </div>

        {googleSignIn ? (
          <div className="mt-6 animate-slide-up stagger-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                {/* <div className="w-full border-t border-[var(--fn-border)]" /> */}
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-[var(--fn-text-muted)]">{GENERAL_LABELS.orContinueWith}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={() => alert('Registro con Google — conecta cuando el backend esté listo.')}
            >
              <GoogleIcon />
              {GENERAL_LABELS.google}
            </Button>
          </div>
        ) : null}

        <p className="mt-10 text-center text-base animate-slide-up stagger-4">
          {GENERAL_LABELS.alreadyHaveAccount}{' '}
          <Link href="/auth/login" className="font-semibold text-[var(--fn-primary)]">
            {BUTTON_LABELS.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
