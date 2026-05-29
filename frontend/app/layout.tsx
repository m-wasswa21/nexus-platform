import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus — CIO/CxO Africa Digital Leadership Forum",
  description: "Mentorship & Appreciation Platform for Africa's digital leaders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
