
import "./globals.css";
import {Inter} from 'next/font/google';
import {cookies} from 'next/headers';

import { SESSION_COOKIE_NAME } from "./constants";
import { Metadata } from "next";
import Header from "@/components/Header";

const inter = Inter({subsets: ['latin']});

export const metatdata: Metadata ={
  title: "Service Call App",
  description: "A simple service call app",
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = cookies().get(SESSION_COOKIE_NAME)?.value || null;

  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/png"
          sizes="32x32"
        />
      </head>

      <body>
        <Header session={session} />
        <main>{children}</main>
      </body>

    </html>
  );
}
