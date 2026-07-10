import { redirect } from 'next/navigation';

import { liveStreamClassHref } from '@/utils/live-stream';

export default async function LiveClassRedirectPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  redirect(liveStreamClassHref(classId));
}
