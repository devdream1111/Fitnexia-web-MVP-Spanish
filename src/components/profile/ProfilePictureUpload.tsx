'use client';

import { useEffect, useMemo, useState } from 'react';
import { Camera, User, Building2 } from 'lucide-react';
import type { UserRole } from '@/types/api';
import type { ImageUploadInput } from '@/utils/media';
import { normalizeImageFile, resolveAvatarDisplayUrl } from '@/utils/media';

interface ProfilePictureUploadProps {
  currentAvatar?: ImageUploadInput;
  onUpload: (value: string | File) => void;
  onError?: (message: string) => void;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function ProfilePictureUpload({
  currentAvatar,
  onUpload,
  onError,
  role = 'athlete',
  size = 'md',
  editable = true,
}: ProfilePictureUploadProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!(currentAvatar instanceof File)) {
      setFilePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(currentAvatar);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [currentAvatar]);

  useEffect(() => {
    setImageError(false);
  }, [currentAvatar, filePreviewUrl]);

  const displaySrc = useMemo(() => {
    if (currentAvatar instanceof File) return filePreviewUrl ?? undefined;
    return resolveAvatarDisplayUrl(currentAvatar);
  }, [currentAvatar, filePreviewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    e.target.value = '';
    if (!raw) return;

    try {
      const file = await normalizeImageFile(raw);
      onUpload(file);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
    }
  };

  const Icon = role === 'institution' ? Building2 : User;
  const showImage = Boolean(displaySrc) && !imageError;

  return (
    <div className={`${editable ? 'group' : ''} relative inline-block`}>
      {showImage ? (
        <img
          src={displaySrc}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-[var(--fn-surface-muted)]`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[var(--fn-primary-muted)] flex items-center justify-center border-4 border-[var(--fn-surface-muted)]`}
        >
          <Icon
            size={size === 'lg' ? 48 : size === 'md' ? 36 : 24}
            className="text-[var(--fn-primary)]"
          />
        </div>
      )}
      {editable && (
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 transition-opacity hover:bg-black/50 focus-within:bg-black/50 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
          <Camera size={size === 'lg' ? 32 : size === 'md' ? 24 : 16} className="text-white" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
