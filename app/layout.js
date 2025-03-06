import "./globals.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SocketProvider } from "@/context/socket";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FlashMaster",
  description: "Tu app de flashcards inteligente",
};

// Configuración del viewport según la nueva API
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <div className="relative flex h-full">
            <div className="flex-1 flex flex-col min-h-screen ">
              <main className="flex-1 relative">
                <div className="no-flicker">
                  <SocketProvider>{children}</SocketProvider>
                </div>
              </main>
            </div>
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
