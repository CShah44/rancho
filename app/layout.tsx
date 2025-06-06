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
});

export const dmSans = DM_Sans({
  variable: "--font-secondary",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-main",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rancho AI",
  description: "Your AI assistant for anything you need",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} ${dmSans.variable} ${inter.className} antialiased pointer-events-auto`}
      >
        <main>
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
