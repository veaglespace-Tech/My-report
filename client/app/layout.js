import { AppProviders } from "@/components/providers/AppProviders";
import { RootChrome } from "@/components/layout/RootChrome";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import "./globals.css";

export const metadata = {
  title: "MyReport",
  description: "Premium SaaS reporting platform with SuperAdmin and Admin dashboards",
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg?v=2",
    apple: "/icon.svg?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-outfit">
        <AppProviders>
          <RootChrome>{children}</RootChrome>
          <FloatingChatbot />
        </AppProviders>
      </body>
    </html>
  );
}
