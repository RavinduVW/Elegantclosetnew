import type { Metadata } from "next";

import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import Header from "./components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";


export const metadata: Metadata = {
  title: {
    default: "Elegant Closet",
    template: "%s | Elegant Closet",
  },
  description:
    "Discover the artistry of batik at Elegant Closet - Where Fashion Meets Tradition!",
  keywords: [
    "ElegantCloset",
    "Elegant clothing",
    "silk sarees",
    "sarees",
    "silk batik",
    "srilankan clothes",
    "custom sarees",
    "batik sarees",
    "modal Silk Sarees",
    "pure silk sarees",
    "custom dresses",
    "frocks",
    "pantkits",
    "batik coats",
    "coats",
    "tube dress",
    "beadswork frocks",
    "beadworks dresses",
    "sarees with beads",
    "skirt and blouse",
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Header />
        {children}
        <Footer />
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
