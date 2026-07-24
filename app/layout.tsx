import "./globals.css";
import Nav from "./components/Nav";
import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
