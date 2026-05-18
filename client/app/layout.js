import { Outfit } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { RootChrome } from "@/components/layout/RootChrome";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "MyReport",
  description: "Premium SaaS reporting platform with SuperAdmin and Admin dashboards",
  icons: {
<<<<<<< HEAD
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
=======
    icon: "/assets/veagle-logo.webp",
    shortcut: "/assets/veagle-logo.webp",
    apple: "/assets/veagle-logo.webp",
>>>>>>> 5da68a938c8a8a26fc6f6bcfa435a177af23679c
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-outfit">
        <AppProviders>
          <RootChrome>{children}</RootChrome>
          <FloatingChatbot />
        </AppProviders>
      </body>
    </html>
  );
}
