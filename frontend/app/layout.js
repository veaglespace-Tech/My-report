import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata = {
  title: "MyReport",
  description: "Premium SaaS reporting platform with SuperAdmin and Admin dashboards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
