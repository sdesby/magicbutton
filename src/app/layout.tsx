import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const fredoka = Fredoka({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magic Button - Shake up your day!",
  description: "Break out of boredom with a single tap.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fredoka.className}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-PE8JNVPVWL"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PE8JNVPVWL');
        `}
      </Script>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
