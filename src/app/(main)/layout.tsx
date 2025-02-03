import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/header/Header";
import NextAuthSessionProvider from "@/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Utopia",
    default: "Utopia",
  },
  description:
    "Join Utopia, the modern social media platform where you can connect with friends, share moments, and explore content. Powered by Next.js. Discover a new world of social interaction.",
  keywords: [
    "Utopia",
    "Social Media",
    "Instagram Alternative",
    "Connect",
    "Share",
    "Explore",
    "Next.js",
    "Social Networking",
    "Discover",
    "Content Sharing",
  ],
  openGraph: {
    title: "Utopia - Social Media Reimagined",
    description:
      "Join Utopia, a modern social media platform for connecting, sharing, and exploring content. A better alternative to Instagram, built with Next.js.",
    images: "https://res.cloudinary.com/dflih9gkm/image/upload/v1738608895/20c1d159-5daa-4ed4-aa79-0c99b3635cf9_ck4kc7.jpg", 
    siteName: "Utopia",
    type: "website",
  },
  robots: "index, follow", 
  viewport: "width=device-width, initial-scale=1", 
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const initialSession = await getServerSession(authOptions)

    
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={poppins.className}>
        <NextAuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="min-h-screen">
              <Header/> 
              <main className="py-8">
                <div className="container">
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6`}>
                   
                    <div
                      className="lg:col-span-3 hidden lg:block"
                    >
                      <Sidebar initialSession={initialSession} />
                    </div>
                    <div
                    className="lg:col-span-9"
                    >
                      {children}
                    </div>
                  </div>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
