import type { Metadata } from "next";
import { Inter, Playfair_Display, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdsProvider } from "@/contexts/AdsContext";

import GlobalBreakingNews from "@/components/GlobalBreakingNews";
import RealtimeListener from "@/components/RealtimeListener";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp } from "antd";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: '--font-playfair',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin", "vietnamese"],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: "News Portal - Tin tức mới nhất, nhanh nhất",
  description:
    "Cổng thông tin điện tử cung cấp tin tức nóng hổi, chính xác về thế giới, kinh doanh, công nghệ và thể thao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${merriweather.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-background text-foreground transition-colors font-sans"
      >
        <AntdRegistry>
          <ThemeProvider>
            <AntdApp>
              <AuthProvider>
                <AdsProvider>
                  <RealtimeListener />
                  {children}
                </AdsProvider>
              </AuthProvider>
            </AntdApp>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
