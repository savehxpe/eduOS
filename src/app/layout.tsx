import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "eduOS — School Management Platform",
  description:
    "A comprehensive school administrative and academic management system for attendance tracking, gradebook management, and performance analytics.",
  keywords: "school management, education, attendance, gradebook, analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-surface-50 text-surface-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
