import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Raksha AI | Cultural Cybersecurity",
  description: "AI for Social Good - Bridging digital literacy gaps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-paper-100 dark:bg-abyss-900 text-ink-900 dark:text-paper-100 transition-colors duration-500">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}