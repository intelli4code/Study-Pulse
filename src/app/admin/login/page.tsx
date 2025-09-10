'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer used. Admin access is now role-based.
// A user with the admin email will see the link in their sidebar.
// This component simply redirects to the main login page.
export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}
