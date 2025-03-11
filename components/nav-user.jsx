import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import SignOutButton from "@/components/signOutButton";
import { UserProfileDialog } from "@/components/user/user-profile-dialog";
import { useSession } from "next-auth/react";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const clearWorkspaces = useSidebarStore((state) => state.clearWorkspaces);

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <UserProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-purple-900/30 transition-all duration-200"
              >
                <Avatar className="h-8 w-8 rounded-lg border-2 border-zinc-200/50 dark:border-purple-500/30">
                  <AvatarImage
                    src={user.image}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-gradient-to-r dark:from-blue-600/80 dark:to-purple-600/80 text-zinc-800 dark:text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-zinc-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 dark:bg-clip-text dark:text-transparent">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-zinc-500 dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-gray-400" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-zinc-200/50 dark:border-purple-500/20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-lg dark:shadow-purple-500/10"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg border-2 border-zinc-200/50 dark:border-purple-500/30">
                    <AvatarImage
                      src={user.image}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="rounded-lg bg-zinc-200 dark:bg-gradient-to-r dark:from-blue-600/80 dark:to-purple-600/80 text-zinc-800 dark:text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-zinc-900 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 dark:bg-clip-text dark:text-transparent">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-zinc-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-purple-500/20" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsProfileOpen(true)}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70"
                >
                  <UserCircle className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Account
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70">
                  {theme === "dark" ? (
                    <Moon className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4 text-amber-500 dark:text-yellow-400" />
                  )}
                  <Label htmlFor="dark-theme" className="flex-grow">
                    {theme === "dark" ? "Dark Theme" : "Light Theme"}
                  </Label>
                  <Switch
                    id="dark-theme"
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70">
                  <Bell className="mr-2 h-4 w-4 text-pink-500 dark:text-pink-400" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-purple-500/20" />
              <SignOutButton className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70 w-full justify-start" />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
