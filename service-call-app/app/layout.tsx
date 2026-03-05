import Header from "@/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { Toaster } from "react-hot-toast";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ChatWithDatabase from "../components/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Service Call Dashboard",
  description: "Real-time service call tracking and management dashboard",
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
      </head>

      <body>
        <AuthProvider>
          <Header />
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
