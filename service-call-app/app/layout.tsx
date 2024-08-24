import NavBar from "@/components/NavBar";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

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
      <UserProvider>
      <body>
        <NavBar />

        <main>{children}</main>
      </body>
      </UserProvider>
    </html>
  );
}
