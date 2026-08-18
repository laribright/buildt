import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Buildt — Educational Project by Code With Lari",
  description: "Built for educational purposes by youtube.com/@codewithlari.",
  authors: [
    {
      name: "Code With Lari",
      url: "https://youtube.com/@codewithlari",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-geist-sans)">
        <ThemeProvider
          defaultTheme="system"
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
