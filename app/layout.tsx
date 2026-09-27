import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoldGround Capital — Build Wealth on Solid Ground",
  description:
    "GoldGround Capital is a digital asset platform offering disciplined investment plans, transparent returns, and a referral programme for long-term partners.",
  icons: {
    icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/logo.jpg" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50 text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
