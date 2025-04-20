'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import RegisterForm from '../../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const domainPreference = searchParams.get('domain') || undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <RegisterForm domainPreference={domainPreference} />
    </div>
  );
}
