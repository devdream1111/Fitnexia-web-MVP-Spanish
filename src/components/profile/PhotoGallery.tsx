'use client';

import { Plus, X } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  onAddImage: (imageDataUrl: string) => void;
  onRemoveImage: (index: number) => void;
}

export function PhotoGallery({ images, onAddImage, onRemoveImage }: PhotoGalleryProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {images.map((img, idx) => (
          <div key={idx} className="group relative">
            <img
              src={img}
              alt={`Gallery ${idx + 1}`}
              className="aspect-square w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <label className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--fn-border)] bg-[var(--fn-surface-muted)] text-[var(--fn-text-muted)] hover:border-[var(--fn-primary)] hover:text-[var(--fn-primary)]">
          <Plus size={32} />
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
}
