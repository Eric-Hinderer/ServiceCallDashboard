import NavBar from "@/components/NavBar";
import "./globals.css";



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
        <NavBar />
        <main>{children}</main>
      </body>

    </html>
  );
}
