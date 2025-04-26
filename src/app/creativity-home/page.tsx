'use client';

import { useLanguage } from '../../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

export default function CreativityHome() {
  const { translations: t } = useLanguage();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const renderDescription = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="text-white text-lg text-center leading-relaxed">
        {line}
      </p>
    ));
  };

  // If user is already logged in, redirect to dashboard
  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  // If still loading or user is authenticated, show minimal content
  // (this will be briefly visible before redirect happens)
  if (isLoading || user) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="animate-pulse">
        <p className="text-white">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <h1 className="title">{t.creativity.title}</h1>
        <h2 className="text-[var(--candy-yellow)] text-xl text-center">
          {t.creativity.subtitle}
        </h2>
        
        <div className="space-y-4">
          {renderDescription(t.creativity.description)}
        </div>

        <div className="w-full">
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out text-lg w-full"
          >
            {t.creativity.getStarted}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-white">
              {t.creativity.alreadyMember}{' '}
              <Link href="/auth/login" className="text-[var(--candy-yellow)] hover:underline">
                {t.navLinks.signIn}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-white/70">
          <Link href="/about" className="hover:text-white transition-colors">
            {t.navLinks.about}
          </Link>
        </div>
      </div>
    </div>
  );
}
