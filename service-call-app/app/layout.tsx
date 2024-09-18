import Header from "@/components/NavBar";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";

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

      <body>
        <AuthProvider>
          <Header />
          <body>{children}</body>
        </AuthProvider>
      </body>
    </html>
  );
}
