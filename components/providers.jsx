"use client";

import { ThemeProvider } from "next-themes";
import SessionProvider from "@/app/providers/SessionProvider";
import { SocketProvider } from "@/context/socket";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <SessionProvider>
        <SocketProvider>{children}</SocketProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
