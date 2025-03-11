"use client";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Sign out with redirect to force Google account selection next time
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });

      // Clear any localStorage/sessionStorage data
      localStorage.clear();
      sessionStorage.clear();

      // Force clear cookies related to auth
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.replace(/^ +/, "").split("=")[0];
        if (cookieName.includes("next-auth") || cookieName.includes("google")) {
          document.cookie = `${cookieName}=;expires=${new Date().toUTCString()};path=/`;
        }
      });

      // Force redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button className="w-full">
      <DropdownMenuItem
        onClick={handleSignOut}
        className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </button>
  );
}
