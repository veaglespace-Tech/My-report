import { AppProviders } from "@/components/providers/AppProviders";
import { RootChrome } from "@/components/layout/RootChrome";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import "./globals.css";

export const metadata = {
  title: "MyReport",
  description: "Premium SaaS reporting platform with SuperAdmin and Admin dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>
          <RootChrome>{children}</RootChrome>
          <FloatingChatbot />
        </AppProviders>
      </body>
    </html>
  );
}
