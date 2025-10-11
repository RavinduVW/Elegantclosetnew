import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import Header from "./components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elegant Closet",
    template: "%s | Elegant Closet",
  },
  description:
    "Discover the artistry of batik at Flegant Closet - Where Fashion Meets Tradition!",
  keywords: ["elegant closet", "clothing", "fashion"],
  authors: [{ name: "ElegantCloset" }],
  creator: "ElegantCloset",
  publisher: "ElegantCloset",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    title: "ElegantCloset",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head />
      <body className={poppins.className}>
        <Header />
        {children}
        <WhatsAppButton />
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          toastOptions={{
            style: {
              fontFamily: "'Poppins', sans-serif",
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
