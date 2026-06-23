'use client';

import { Camera, User, Building2 } from 'lucide-react';
import type { UserRole } from '@/types/api';

interface ProfilePictureUploadProps {
  currentAvatar?: string | null;
  onUpload: (imageDataUrl: string) => void;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function ProfilePictureUpload({
  currentAvatar,
  onUpload,
  role = 'athlete',
  size = 'md',
  editable = true,
}: ProfilePictureUploadProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const Icon = role === 'institution' ? Building2 : User;

  return (
    <div className={`${editable ? 'group' : ''} relative inline-block`}>
      {currentAvatar ? (
        <img
          src={currentAvatar}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-[var(--fn-surface-muted)]`}
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
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera size={size === 'lg' ? 32 : size === 'md' ? 24 : 16} className="text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
