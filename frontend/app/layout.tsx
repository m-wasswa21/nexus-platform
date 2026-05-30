import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "1st John Babirukamu Annual Memorial Lecture | Uganda Digital Society",
  description:
    "Honouring the legacy of John Birungi Babirukamu — a pioneer of digital communication in Uganda. Join us for the inaugural Annual Memorial Lecture themed 'Creating Digital Leaders Through Mentorship and Knowledge Sharing.' Saturday 30th May 2026, National ICT Hub.",
  keywords: [
    "John Babirukamu",
    "John Birungi Babirukamu",
    "Uganda Digital Society",
    "CIO Forum Uganda",
    "Annual Memorial Lecture",
    "Digital Leadership",
    "Mentorship",
    "Uganda ICT",
    "Digital Transformation Uganda",
    "CIO CxO Africa",
  ],
  icons: { icon: "/uds-logo.png" },
  openGraph: {
    type: "website",
    url: "https://jbannualmemoriallecture.org",
    title: "1st John Babirukamu Annual Memorial Lecture",
    description:
      "Creating Digital Leaders Through Mentorship and Knowledge Sharing. Saturday 30th May 2026 · National ICT Hub · Organised by Uganda Digital Society & CIO/CxO Africa.",
    siteName: "John Babirukamu Annual Memorial Lecture",
    images: [
      {
        url: "https://jbannualmemoriallecture.org/conclave.jpg",
        width: 1200,
        height: 630,
        alt: "1st John Babirukamu Annual Memorial Lecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1st John Babirukamu Annual Memorial Lecture",
    description:
      "Creating Digital Leaders Through Mentorship and Knowledge Sharing. Saturday 30th May 2026 · National ICT Hub.",
    images: ["https://jbannualmemoriallecture.org/conclave.jpg"],
  },
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
