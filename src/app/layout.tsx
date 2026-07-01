import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuildTrack Pro – Civil Project Management Suite",
  description: "Professional civil project management platform for tracking construction schedules, BOQ, PERT, Gantt, and analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0e1a] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
