'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Legacy route — staff is managed from /gym/instructors */
export default function InviteInstructorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gym/instructors');
  }, [router]);

  return null;
}
