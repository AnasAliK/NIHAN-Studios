'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setNavigator } from '@/lib/navigate';

export function RouterBridge() {
  const router = useRouter();
  useEffect(() => {
    setNavigator((href) => router.push(href));
    return () => setNavigator(null);
  }, [router]);
  return null;
}
