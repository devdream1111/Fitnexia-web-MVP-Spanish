'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, FileUp, ImageIcon, Shield } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { ALERT_LABELS, GENERAL_LABELS, VERIFICATION_LABELS } from '@/constants/labels';
import { getAuthErrorMessage, useAuth } from '@/contexts/auth-context';
import { useNoticeModal } from '@/contexts/notice-modal-context';
import {
  apiGetVerificationStatus,
  apiSubmitVerification,
  type VerificationDocumentField,
  type VerificationStatusResponse,
} from '@/services/api';
import { resolveVerificationStatus } from '@/utils/verification';

const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';
const CERT_ACCEPT = '.pdf,application/pdf,image/jpeg,image/png,image/webp';

const PHOTO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function isPhotoFile(file: File): boolean {
  if (PHOTO_MIMES.has(file.type) || file.type.startsWith('image/')) return true;
  const name = file.name.toLowerCase();
  return /\.(jpe?g|png|webp)$/.test(name);
}

function isPdfFile(file: File): boolean {
  if (file.type === 'application/pdf') return true;
  return file.name.toLowerCase().endsWith('.pdf');
}

function isCertificationFile(file: File): boolean {
  return isPhotoFile(file) || isPdfFile(file);
}

type DocumentFieldMode = 'photo' | 'cert';

function DocumentField({
  label,
  hint,
  file,
  accept,
  mode,
  onChange,
  onInvalid,
  className = '',
}: {
  label: string;
  hint: string;
  file: File | null;
  accept: string;
  mode: DocumentFieldMode;
  onChange: (file: File | null) => void;
  onInvalid?: (message: string) => void;
  className?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPdf = file ? isPdfFile(file) : false;

  useEffect(() => {
    if (!file || !isPhotoFile(file)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (next: File | null) => {
    if (!next) {
      onChange(null);
      return;
    }
    if (mode === 'photo' && !isPhotoFile(next)) {
      onInvalid?.(VERIFICATION_LABELS.docInvalidPhoto);
      return;
    }
    if (mode === 'cert' && !isCertificationFile(next)) {
      onInvalid?.(VERIFICATION_LABELS.docInvalidCert);
      return;
    }
    onChange(next);
  };

  return (
    <label
      className={`flex h-full min-h-[220px] cursor-pointer flex-col rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-4 transition hover:border-[var(--fn-primary-muted)] ${className}`}
    >
      <span className="mb-1 block text-sm font-semibold text-[var(--fn-text)]">{label}</span>
      <span className="mb-3 block text-xs text-[var(--fn-text-muted)]">{hint}</span>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)]/40 px-3 py-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="max-h-28 w-full rounded-lg object-contain"
          />
        ) : isPdf ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <FileText size={32} />
          </span>
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
            {mode === 'photo' ? <ImageIcon size={28} /> : <FileUp size={28} />}
          </span>
        )}
        <span className="max-w-full truncate text-center text-xs text-[var(--fn-text-secondary)]">
          {file ? file.name : 'Ningún archivo seleccionado'}
        </span>
        <span className="rounded-lg bg-[var(--fn-primary-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--fn-primary)]">
          Elegir archivo
        </span>
      </div>

      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          handleChange(next);
          e.target.value = '';
        }}
      />
    </label>
  );
}

export function VerificationFormPage({ backHref }: { backHref: string }) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showNotice } = useNoticeModal();
  const [statusData, setStatusData] = useState<VerificationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<VerificationDocumentField, File | null>>({
    dni_front: null,
    dni_back: null,
    certification: null,
  });

  const profile =
    user?.role === 'instructor' ? user.instructorProfile : user?.institutionProfile;
  const profileStatus = resolveVerificationStatus(profile);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetVerificationStatus();
      setStatusData(data);
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const effectiveStatus = statusData?.verificationStatus ?? profileStatus;
  const canSubmit = effectiveStatus === 'unverified' || effectiveStatus === 'rejected';
  const allFilesSelected =
    files.dni_front && files.dni_back && files.certification;

  const showInvalidFile = useCallback(
    (message: string) => {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message,
        variant: 'error',
      });
    },
    [showNotice],
  );

  const handleSubmit = async () => {
    if (!canSubmit || !allFilesSelected || submitting) return;
    if (!isPhotoFile(files.dni_front!) || !isPhotoFile(files.dni_back!)) {
      showInvalidFile(VERIFICATION_LABELS.docInvalidPhoto);
      return;
    }
    if (!isCertificationFile(files.certification!)) {
      showInvalidFile(VERIFICATION_LABELS.docInvalidCert);
      return;
    }
    setSubmitting(true);
    try {
      await apiSubmitVerification({
        dni_front: files.dni_front!,
        dni_back: files.dni_back!,
        certification: files.certification!,
      });
      await refreshUser();
      showNotice({
        title: VERIFICATION_LABELS.submitSuccessTitle,
        message: VERIFICATION_LABELS.submitSuccessBody,
        variant: 'success',
      });
      router.replace(backHref);
    } catch (error) {
      showNotice({
        title: ALERT_LABELS.missingInfoTitle,
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting ? <FullScreenLoader message={VERIFICATION_LABELS.submitting} /> : null}

      <div className="space-y-6">
        <PageHeader title={VERIFICATION_LABELS.pageTitle} backHref={backHref} showBack />

        <div className="rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)] p-6">
          <div className="mb-6 flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--fn-primary-muted)] text-[var(--fn-primary)]">
              <Shield size={22} />
            </span>
            <p className="text-sm leading-relaxed text-[var(--fn-text-secondary)]">
              {VERIFICATION_LABELS.pageIntro}
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--fn-text-muted)]">{GENERAL_LABELS.loading}</p>
          ) : effectiveStatus === 'verified' ? (
            <p className="text-sm font-medium text-[var(--fn-success)]">{VERIFICATION_LABELS.alreadyVerified}</p>
          ) : effectiveStatus === 'pending' ? (
            <p className="text-sm text-[var(--fn-text-secondary)]">{VERIFICATION_LABELS.pendingReadOnly}</p>
          ) : (
            <div className="space-y-4">
              {effectiveStatus === 'rejected' && statusData?.latestRequest?.rejectionReason ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm">
                  <span className="font-semibold text-[var(--fn-text)]">
                    {VERIFICATION_LABELS.rejectionReason}:{' '}
                  </span>
                  <span className="text-[var(--fn-text-secondary)]">
                    {statusData.latestRequest.rejectionReason}
                  </span>
                </div>
              ) : null}

              <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
                <DocumentField
                  label={VERIFICATION_LABELS.docDniFront}
                  hint={VERIFICATION_LABELS.docPhotoHint}
                  file={files.dni_front}
                  accept={PHOTO_ACCEPT}
                  mode="photo"
                  onChange={(file) => setFiles((prev) => ({ ...prev, dni_front: file }))}
                  onInvalid={showInvalidFile}
                />
                <DocumentField
                  label={VERIFICATION_LABELS.docDniBack}
                  hint={VERIFICATION_LABELS.docPhotoHint}
                  file={files.dni_back}
                  accept={PHOTO_ACCEPT}
                  mode="photo"
                  onChange={(file) => setFiles((prev) => ({ ...prev, dni_back: file }))}
                  onInvalid={showInvalidFile}
                />
              </div>

              <DocumentField
                label={VERIFICATION_LABELS.docCertification}
                hint={VERIFICATION_LABELS.docCertHint}
                file={files.certification}
                accept={CERT_ACCEPT}
                mode="cert"
                onChange={(file) => setFiles((prev) => ({ ...prev, certification: file }))}
                onInvalid={showInvalidFile}
              />

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  title={GENERAL_LABELS.cancel}
                  variant="outline"
                  disabled={submitting}
                  onClick={() => router.push(backHref)}
                />
                <Button
                  title={VERIFICATION_LABELS.submit}
                  disabled={!allFilesSelected || submitting}
                  onClick={handleSubmit}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
