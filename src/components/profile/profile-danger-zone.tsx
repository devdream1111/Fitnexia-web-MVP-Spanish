'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { Input } from '@/components/ui/input';
import { ModalPortal } from '@/components/ui/modal-portal';
import { ALERT_LABELS, GENERAL_LABELS, PROFILE_PAGE_LABELS } from '@/constants/labels';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

export function ProfileDangerZone({ email }: { email: string }) {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const { showNotice } = useNoticeModal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const closeConfirm = useCallback(() => {
    if (loading) return;
    setConfirmOpen(false);
    setConfirmEmail('');
  }, [loading]);

  useBodyScrollLock(confirmOpen);

  useEffect(() => {
    if (!confirmOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConfirm();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [confirmOpen, closeConfirm]);

  const emailMatches = confirmEmail.trim().toLowerCase() === email.trim().toLowerCase();

  const handleDelete = async () => {
    if (!emailMatches) return;
    setLoading(true);
    try {
      await deleteAccount();
      showNotice({
        title: PROFILE_PAGE_LABELS.deleteAccountTitle,
        message: PROFILE_PAGE_LABELS.deleteAccountSuccess,
        variant: 'success',
      });
      router.replace('/');
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  return (
    <>
      {loading ? <FullScreenLoader message={PROFILE_PAGE_LABELS.deleteAccountTitle} /> : null}

      <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[var(--fn-text)]">{PROFILE_PAGE_LABELS.deleteAccountTitle}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--fn-text-muted)]">
              {PROFILE_PAGE_LABELS.deleteAccountWarning}
            </p>
            <Button
              title={PROFILE_PAGE_LABELS.deleteAccountButton}
              variant="danger"
              size="sm"
              className="mt-4"
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </section>

      {confirmOpen ? (
        <ModalPortal>
          <div className="fn-modal-overlay flex items-end justify-center sm:items-center sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-[var(--fn-text)]/40 backdrop-blur-[2px]"
              onClick={closeConfirm}
              aria-label="Cerrar"
              disabled={loading}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className="fn-modal-panel relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--fn-border)] bg-[var(--fn-bg)] p-6 shadow-2xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="delete-account-title" className="text-lg font-bold text-[var(--fn-text)]">
                {PROFILE_PAGE_LABELS.deleteAccountTitle}
              </h3>
              <p className="mt-2 text-sm text-[var(--fn-text-muted)]">
                {PROFILE_PAGE_LABELS.deleteAccountWarning}
              </p>
              <div className="mt-4">
                <Input
                  label={PROFILE_PAGE_LABELS.deleteAccountConfirmPrompt}
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={email}
                  autoComplete="off"
                />
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  title={GENERAL_LABELS.cancel}
                  variant="outline"
                  onClick={closeConfirm}
                  disabled={loading}
                />
                <Button
                  title={PROFILE_PAGE_LABELS.deleteAccountButton}
                  variant="danger"
                  disabled={!emailMatches || loading}
                  onClick={handleDelete}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </>
  );
}
