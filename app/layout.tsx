import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import Script from "next/script";
import { StartupSplash } from "@/app/startup-splash";

const sourceSans3Heading = Source_Sans_3({subsets:['latin'],variable:'--font-heading'});

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KyoHub — your space, together",
  description: "Keep passwords, grocery lists, and family appointments organized in one place.",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", ibmPlexSans.variable, sourceSans3Heading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-preference" strategy="beforeInteractive">
          {`const theme = localStorage.getItem("kyohub-theme"); if (theme === "dark") { document.documentElement.classList.add("dark"); document.documentElement.style.colorScheme = "dark"; }`}
        </Script>
        {children}
        <StartupSplash />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
