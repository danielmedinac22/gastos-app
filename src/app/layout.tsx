import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/mobile-nav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GastosApp",
  description: "Control de gastos y tarjetas de crédito",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body">
        <header className="fixed top-0 left-0 right-0 z-50 glass-header">
          <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-6">
            <span className="font-headline font-extrabold text-primary text-lg tracking-tight">
              GastosApp
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              settings
            </span>
          </div>
        </header>
        <main className="flex-1 pt-18 pb-28 px-6 max-w-lg mx-auto w-full">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
