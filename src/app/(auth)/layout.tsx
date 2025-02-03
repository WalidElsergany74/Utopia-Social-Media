import React from "react";
import "../globals.css";
import Header from "@/components/header/Header";
import NextAuthSessionProvider from "@/providers/NextAuthProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";
import { Metadata } from "next";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
  });
  
  export const metadata: Metadata = {
    title: {
      template: "%s | Utopia",
      default: "Utopia",
    },
    description:
      "Join Utopia, the modern social media platform where you can connect with friends, share moments, and explore content. Powered by Next.js.",
    keywords: [
      "Utopia",
      "Social Media",
      "Connect",
      "Share",
      "Explore",
      "Next.js",
    ],
  };



export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={poppins.className}>
          <NextAuthSessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
            >
              <Header />
              {children}
            </ThemeProvider>
            <Toaster />
          </NextAuthSessionProvider>
        </body>
      </html>
    </>
  );
}
