import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/lib/store";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Patil Constructions - Company Management System (Demo)",
  description: "Construction company management system demo: projects, billing, store, payroll, maintenance and client portal.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f172a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-800">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
