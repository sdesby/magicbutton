'use client';

import { useLanguage } from '../../../hooks/useLanguage';
import Link from 'next/link';

export default function ConfirmationPage() {
  const { translations: t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="w-full max-w-md text-center">
        <h1 className="title mb-4">{t.auth.success.signUpSuccess}</h1>
        <p className="text-white text-lg mb-8">
          {t.auth.success.checkEmail}
        </p>
        <Link 
          href="/"
          className="bg-gradient-to-r from-[var(--candy-purple)] to-[var(--candy-blue)] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-base inline-block"
        >
          {t.contact.backButton}
        </Link>
      </div>
    </div>
  );
}
