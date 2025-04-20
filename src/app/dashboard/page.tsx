'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchUserChallenges, markChallengeCompleted, initializeUserProgressIfNeeded } from '../../utils/creativityChallenges';
import { LocalizedCreativityChallenge } from '../../types/database';

export default function Dashboard() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const { translations: t, languageCode } = useLanguage();
  const [challenges, setChallenges] = useState<LocalizedCreativityChallenge[]>([]);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && languageCode) {
      (async () => {
        const domainPreference = user.user_metadata?.domain_preference;
        const level = user.user_metadata?.level || 'Beginner';
        if (domainPreference && typeof domainPreference === 'string') {
          await ensureProgressInitialized(user.id, domainPreference, level);
        }
        await loadChallenges(level, languageCode);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, languageCode]);

  // Helper to ensure progress is initialized if missing
  const ensureProgressInitialized = async (userId: string, domainPreference: string, level: string) => {
    const ok = await initializeUserProgressIfNeeded(userId, domainPreference, level);
    if (!ok) {
      console.warn('[Dashboard] Failed to initialize user progress for', userId, domainPreference, level);
    } else {
      console.log('[Dashboard] User progress initialized for', userId, domainPreference, level);
    }
  };

  const loadChallenges = async (level?: string, langCode?: string) => {
    if (!user) return;
    setIsLoadingChallenges(true);
    setError(null);
    try {
      const domainPreferences = user.user_metadata?.domain_preference || [];
      const userLevel = level || user.user_metadata?.level || 'Beginner';
      const lang = langCode || languageCode;
      let userChallenges = await fetchUserChallenges(
        user.id,
        domainPreferences,
        lang,
        userLevel
      );
      // Fallback: if no progress, try initializing and reload once
      if (userChallenges.length === 0 && domainPreferences.length > 0) {
        await ensureProgressInitialized(user.id, domainPreferences[0], userLevel);
        userChallenges = await fetchUserChallenges(
          user.id,
          domainPreferences,
          lang,
          userLevel
        );
      }
      setChallenges(userChallenges);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while loading challenges');
      }
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  // Find the first incomplete challenge (today's challenge)
  const todayChallenge = challenges.find(c => !c.completed) || (challenges.length > 0 ? challenges[challenges.length - 1] : undefined);
  const todayIndex = challenges.findIndex(c => !c.completed);

  const handleMarkCompleted = async (challengeId: string) => {
    if (!user) return;
    setConfetti(true);
    try {
      const userLevel = user.user_metadata?.level || 'Beginner';
      const success = await markChallengeCompleted(user.id, challengeId, userLevel);
      if (success) {
        setChallenges(prev => prev.map(ch => ch.id === challengeId ? { ...ch, completed: true, completionDate: new Date().toISOString() } : ch));
      }
    } finally {
      setTimeout(() => setConfetti(false), 1800);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading || isLoadingChallenges) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
        <div className="animate-pulse">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  // Greeting
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || '';

  // Progress tracker dots
  const renderProgress = () => {
    // Only show the first 14 challenges (days)
    const maxDays = 14;
    const progressChallenges = challenges.slice(0, maxDays);
    return (
      <div className="flex justify-center gap-2 mt-8 mb-4">
        {progressChallenges.map((ch, idx) => {
          if (ch.completed) {
            return <span key={ch.id} className="w-5 h-5 rounded-full bg-[var(--candy-green)] border-2 border-[var(--candy-green)] flex items-center justify-center">✅</span>;
          }
          if (idx === todayIndex) {
            return <span key={ch.id} className="w-5 h-5 rounded-full bg-[var(--candy-yellow)] border-2 border-[var(--candy-yellow)] flex items-center justify-center animate-bounce">🎯</span>;
          }
          return <span key={ch.id} className="w-5 h-5 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xs text-white/60">
            <svg width="14" height="14">
              <g>
                <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
                <text x="7" y="12" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.5">🔒</text>
              </g>
            </svg>
          </span>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[var(--dark-bg)] px-2 py-4">
      {/* Profile button */}
      <div className="w-full flex justify-end max-w-3xl mx-auto">
        <button onClick={handleSignOut} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 text-sm mt-2 mr-2">{t.dashboard.signOut}</button>
      </div>
      {/* Greeting */}
      <div className="w-full max-w-3xl mx-auto mt-2 mb-2">
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center mb-1">
          {t.dashboard.hello.replace('{name}', firstName)}
        </h2>
        <p className="text-[var(--candy-yellow)] text-lg text-center mb-0">{t.dashboard.ready}</p>
      </div>
      {/* Error message */}
      {error && (
        <div className="w-full max-w-md mx-auto my-2 p-3 rounded bg-red-100 text-red-700 text-center text-sm border border-red-300">
          {error}
        </div>
      )}
      {/* Challenge Card */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto mt-0">
        {confetti && (
          <div className="absolute z-50 top-24 left-0 right-0 flex justify-center pointer-events-none">
            {/* Simple confetti animation */}
            <span className="text-5xl animate-bounce">🎉</span>
          </div>
        )}
        {todayChallenge ? (
          <div className="relative w-full bg-gradient-to-br from-[var(--candy-purple)] to-[var(--candy-pink)] rounded-3xl shadow-lg p-6 flex flex-col items-center mb-4">
            {/* Always display the correct Day number from todayChallenge */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--candy-yellow)] rounded-full px-4 py-1 text-[var(--dark-bg)] font-semibold shadow">{`${t.dashboard.challenges.day} ${todayChallenge.day}`}</div>
            <h3 className="text-white text-2xl font-bold mt-6 mb-2 text-center">{todayChallenge.title}</h3>
            <div className="text-white/90 text-lg mb-2 text-center whitespace-pre-line">{todayChallenge.description}</div>
            {/*<div className="text-[var(--candy-yellow)] font-semibold mb-4 text-center">{todayChallenge.category} – {todayChallenge.level}</div>*/}
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => handleMarkCompleted(todayChallenge.id)}
                disabled={todayChallenge.completed}
                className={`flex-1 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-200 ease-in-out border border-white ${todayChallenge.completed ? 'bg-[var(--candy-green)] text-white/80 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--candy-pink)] to-[var(--candy-purple)] text-white hover:scale-105'}`}
              >
                {todayChallenge.completed ? t.dashboard.done : t.dashboard.markDone}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white/5 rounded-3xl shadow-lg p-6 flex flex-col items-center mb-4">
            <h3 className="text-white text-xl font-semibold text-center mb-2">{t.dashboard.challenges.noChallenge}</h3>
            <p className="text-white/80 text-center">{t.dashboard.challenges.noChallengeText}</p>
          </div>
        )}
        {/* Progress tracker */}
        {renderProgress()}
      </div>
      {/* Footer */}
      <div className="w-full max-w-3xl mx-auto text-center mt-4 mb-2">
        <p className="text-white/60 text-sm">{t.dashboard.footer}</p>
      </div>
    </div>
  );
}
