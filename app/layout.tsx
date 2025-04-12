import type { Metadata } from "next";
import { Inter, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-secondary",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Rancho AI",
  description: "Your AI assistant for anything you need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} ${dmSans.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
