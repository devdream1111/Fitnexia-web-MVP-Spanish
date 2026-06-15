'use client';

import { Plus, X } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  onAddImage?: (imageDataUrl: string) => void;
  onRemoveImage?: (index: number) => void;
  editable?: boolean;
  /** Smaller gallery footprint (e.g. gym profile) */
  compact?: boolean;
}

export function PhotoGallery({
  images,
  onAddImage,
  onRemoveImage,
  editable = true,
  compact = false,
}: PhotoGalleryProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? 'max-w-sm md:max-w-md' : ''}`}>
      <div
        className={
          compact
            ? 'grid grid-cols-3 gap-2'
            : 'grid grid-cols-2 gap-4 md:grid-cols-4'
        }
      >
        {images.map((img, idx) => (
          <div key={idx} className={`${editable ? 'group' : ''} relative`}>
            <img
              src={img}
              alt={`Gallery ${idx + 1}`}
              className={`aspect-square w-full object-cover ${compact ? 'rounded-lg' : 'rounded-xl'}`}
            />
            {editable && onRemoveImage && (
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className={`absolute right-1 top-1 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 ${
                  compact ? 'h-6 w-6' : 'right-2 top-2 h-8 w-8'
                }`}
              >
                <X size={compact ? 12 : 16} />
              </button>
            )}
          </div>
        ))}
        {editable && onAddImage && (
          <label
            className={`flex aspect-square w-full cursor-pointer items-center justify-center border-2 border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] hover:border-[var(--fn-primary)] hover:text-[var(--fn-primary)] ${
              compact ? 'rounded-lg' : 'rounded-xl'
            }`}
          >
            <Plus size={compact ? 22 : 32} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}
