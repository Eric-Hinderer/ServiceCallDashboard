import Header from "@/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

import { Inter } from "next/font/google";
import ChatWithDatabase from "../components/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
          <ChatWithDatabase>{children}</ChatWithDatabase>
        </AuthProvider>
      </body>
    </html>
  );
}
