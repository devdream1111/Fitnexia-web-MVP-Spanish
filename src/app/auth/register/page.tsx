'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import {
  AuthDivider,
  AuthFooterLink,
  AuthFormHeader,
  AuthFormIntro,
  AuthShell,
  AuthTermsCheckbox,
  GoogleSignInButton,
  PasswordInput,
  RoleTileSelector,
} from '@/components/auth/auth-ui';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { ALERT_LABELS, AUTH_LABELS, BUTTON_LABELS, GENERAL_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleSignInEnabled = useFeature('googleSignIn');
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('athlete');
  const [institutionName, setInstitutionName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const googleError = searchParams.get('googleError');
    if (googleError) setError(googleError);
  }, [searchParams]);

  const startGoogleRegister = () => {
    if (!acceptTerms) {
      setError(ALERT_LABELS.acceptTermsRequired);
      return;
    }
    if (role === 'institution' && !institutionName.trim()) {
      setError(ALERT_LABELS.gymNameRequired);
      return;
    }

    setGoogleLoading(true);
    const params = new URLSearchParams({ mode: 'register', role });
    if (role === 'institution') {
      params.set('institutionName', institutionName.trim());
    }
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  const submit = async () => {
    setError('');
    if (!acceptTerms) {
      setError(ALERT_LABELS.acceptTermsRequired);
      return;
    }
    if (role === 'institution') {
      if (!institutionName.trim() || !email.trim() || !password.trim()) {
        setError(ALERT_LABELS.fillAllFields);
        return;
      }
    } else if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError(ALERT_LABELS.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        role,
        firstName: role === 'institution' ? institutionName.trim() : firstName.trim(),
        lastName: role === 'institution' ? 'Admin' : lastName.trim(),
        avatarUri,
        favoriteSports: [],
        disciplines: [],
        institutionName: role === 'institution' ? institutionName.trim() : undefined,
        acceptTerms: true,
      });
      const home =
        role === 'instructor'
          ? '/instructor/dashboard'
          : role === 'institution'
            ? '/gym/dashboard'
            : '/athlete/home';
      router.replace(home);
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="register">
      <AuthFormIntro>
        <AuthFormHeader title={AUTH_LABELS.createAccount} subtitle={AUTH_LABELS.howWillYouUse} />
        <RoleTileSelector value={role} onChange={setRole} label={AUTH_LABELS.chooseProfile} />

        {googleSignInEnabled ? (
          <>
            <GoogleSignInButton
              label={`${GENERAL_LABELS.continueWith} ${GENERAL_LABELS.google}`}
              onClick={startGoogleRegister}
              loading={googleLoading}
            />
            <AuthDivider label={GENERAL_LABELS.orContinueWith} />
          </>
        ) : null}
      </AuthFormIntro>

      <div className="fn-auth-form-fields">
        <div className="fn-auth-register-photo-row">
          <ProfilePictureUpload
            currentAvatar={avatarUri}
            onUpload={setAvatarUri}
            role={role}
            size="sm"
          />
          <div className="fn-auth-register-fields">
            {role === 'institution' ? (
              <Input
                label={AUTH_LABELS.gymSchoolName}
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder={AUTH_LABELS.gymSchoolPlaceholder}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={AUTH_LABELS.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="María"
                />
                <Input
                  label={AUTH_LABELS.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="García"
                />
              </div>
            )}
          </div>
        </div>

        <Input
          label={AUTH_LABELS.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="tu@ejemplo.com"
        />
        <PasswordInput
          label={AUTH_LABELS.password}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />

        <AuthTermsCheckbox checked={acceptTerms} onChange={setAcceptTerms} />

        {error ? (
          <p className="rounded-xl border border-[var(--fn-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--fn-error)] dark:bg-red-950/30">
            {error}
          </p>
        ) : null}

        <Button
          title={BUTTON_LABELS.createAccount}
          loading={loading}
          disabled={!acceptTerms}
          className="w-full"
          size="md"
          onClick={submit}
        />
      </div>

      <div className="fn-auth-register-footer">
        <AuthFooterLink
          prompt={GENERAL_LABELS.alreadyHaveAccount}
          linkLabel={BUTTON_LABELS.signIn}
          href="/auth/login"
        />
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
