import type { Metadata, Viewport } from "next";
import Header from "@/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { Toaster } from "react-hot-toast";
import PWARegister from "@/components/PWARegister";

import { Inter } from "next/font/google";
import ChatWithDatabase from "../components/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Service Call Dashboard",
  description:
    "Create, assign, and update service calls from the field. Works offline.",
  manifest: "/manifest.json",
  applicationName: "Service Call Dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Service Calls",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>

      <body>
        <AuthProvider>
          <Header />
          <Toaster position="top-right" />
          <PWARegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
