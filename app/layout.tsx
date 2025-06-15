import type { Metadata } from "next";
import { Inter, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const dmSans = DM_Sans({
  variable: "--font-secondary",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-main",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Enhanced SEO metadata
export const metadata: Metadata = {
  title: {
    default: "Rancho AI - Reimagine learning with AI. Play. Watch. Master.",
    template: "%s | Rancho AI",
  },
  description:
    "Rancho is your AI tutor who makes learning magical 🧠🎮. Dive into interactive lessons featuring AI-generated videos, games, and personalized explanations — all within one sleek interface. Say goodbye to boring textbooks. Let's make learning fun again!",
  keywords: [
    "AI assistant",
    "artificial intelligence",
    "productivity",
    "automation",
    "chat AI",
    "AI tools",
  ],
  authors: [{ name: "Chaitya Shah" }],
  creator: "Rancho AI",
  publisher: "Rancho AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://rancho-ai.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Rancho AI - Reimagine learning with AI. Play. Watch. Master.",
    description:
      "Rancho AI is your AI tutor who makes learning magical 🧠🎮. Dive into interactive lessons featuring AI-generated videos, games, and personalized explanations — all within one sleek interface. Say goodbye to boring textbooks. Let's make learning fun again!",
    siteName: "Rancho AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rancho AI - Reimagine learning with AI. Play. Watch. Master.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rancho AI - Reimagine learning with AI. Play. Watch. Master.",
    description:
      "Rancho is your AI tutor who makes learning magical 🧠🎮. Dive into interactive lessons featuring AI-generated videos, games, and personalized explanations — all within one sleek interface. Say goodbye to boring textbooks. Let's make learning fun again!",
    creator: "@rancho_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body
        className={`${spaceGrotesk.className} ${dmSans.variable} ${inter.className} antialiased pointer-events-auto`}
      >
        <main id="main-content">
          <SessionProvider>
            <SidebarProvider defaultOpen={true}>
              {session && <AppSidebar />}
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
          </SessionProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
