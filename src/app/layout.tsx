import type { Metadata } from "next";
import { Big_Shoulders_Display, Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { MEET_FULL_NAME, MEET_TAGLINE } from "@/lib/constants";
import { SITE_URL } from "@/lib/env";
import { ThemeProvider } from "@/components/theme-provider";

// Runs before first paint: applies the saved theme (or OS preference, else
// dark) to <html> so there's no flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t;}catch(e){}})();`;

const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const editorial = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: MEET_FULL_NAME,
    template: `%s · ${MEET_FULL_NAME}`,
  },
  description: `${MEET_FULL_NAME} — ${MEET_TAGLINE}. Live medal tally, schedules, results, delegations, and announcements.`,
  openGraph: {
    title: MEET_FULL_NAME,
    description: MEET_TAGLINE,
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${editorial.variable} ${mono.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2.5 focus:font-mono-data focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-bone focus:no-underline"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
