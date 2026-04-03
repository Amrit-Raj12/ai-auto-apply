import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/lib/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Job Automator",
  description: "Automate your job applications with AI and Voice commands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased transition-colors duration-500 bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 min-h-screen relative`} suppressHydrationWarning={true}>
        {/* Dynamic Global Background Map */}
        <div className="fixed inset-0 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-blue-50 to-cyan-50 dark:from-[#1a153a] dark:via-[#09090b] dark:to-[#050510] -z-10 transition-colors duration-500 pointer-events-none opacity-80 dark:opacity-100" />
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/30 dark:bg-blue-600/10 blur-[120px] -z-10 pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/40 dark:bg-purple-600/10 blur-[130px] -z-10 pointer-events-none" />
        <div className="fixed inset-0 min-h-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-30 -z-10 transition-opacity duration-500 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        <ThemeProvider>
          <div className="relative flex min-h-screen w-full">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-[19rem] relative min-h-screen pt-6 pr-4 md:pr-8 pb-20 w-full overflow-x-hidden scroll-smooth">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
