import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

// Configurar Roboto (fonte oficial INSARAG)
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "INSARAG | Online Training,
  description: "INSARAG Coordination and Management System 3.0 Online Training Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="min-h-screen bg-white font-roboto antialiased">
        {children}
      </body>
    </html>
  );
}
