'use client';

import { useLanguage } from '../../hooks/useLanguage';
import Link from 'next/link';

export default function About() {
  const { translations: t } = useLanguage();

  const renderParagraphs = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="text-white text-lg leading-relaxed">
        {line}
      </p>
    ));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--dark-bg)]">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
      >
        ← Back
      </Link>

      <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
        <h1 className="title">{t.about.title}</h1>
        
        <div className="w-full space-y-12">
          <section>
            <h2 className="text-[var(--candy-yellow)] text-2xl font-semibold mb-6">
              {t.about.companyTitle}
            </h2>
            <div className="space-y-4">
              {renderParagraphs(t.about.companyDescription)}
            </div>
          </section>

          <section>
            <h2 className="text-[var(--candy-yellow)] text-2xl font-semibold mb-6">
              {t.about.missionTitle}
            </h2>
            <div className="space-y-4">
              {renderParagraphs(t.about.missionDescription)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}