'use client';

import { useState } from 'react';
import { QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_V2V3_LABELS } from '@/constants/labels';
import { mockQrCheckInService } from '@/services/mock/gym-enterprise.mock';

export function QrCheckInPanel() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ReturnType<typeof mockQrCheckInService.validate> | null>(null);

  const scan = () => {
    setResult(mockQrCheckInService.validate(code.trim() || 'active'));
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--fn-border)] bg-[var(--fn-surface)] p-8">
        <QrCode size={64} className="text-[var(--fn-primary)]" />
        <p className="mt-4 text-center text-sm text-[var(--fn-text-muted)]">{MOCK_V2V3_LABELS.qrScanHint}</p>
      </div>
      <Input
        label="Código de socio (demo: 999 = moroso)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button title="Validar acceso" className="w-full" onClick={scan} />
      {result ? (
        <div
          className={`rounded-xl border p-4 text-center ${
            result.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="font-bold">{result.memberName}</p>
          <p className="mt-1 text-sm">
            {result.ok ? MOCK_V2V3_LABELS.qrMemberOk : MOCK_V2V3_LABELS.qrMemberBlocked}
          </p>
        </div>
      ) : null}
    </div>
  );
}
