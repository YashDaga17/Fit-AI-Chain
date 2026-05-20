"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Trophy, Camera, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/theme-toggle";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const { disconnect } = useAuth();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/tracker",
      label: "Food Tracker",
      icon: Camera,
      active: pathname === "/tracker",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      active: pathname === "/leaderboard",
    },
  ];

  const handleLogout = () => {
    disconnect();
  };

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t
        border-black/5 dark:border-white/10
        bg-white/85 dark:bg-[#0f1115]/85
        backdrop-blur-xl
        shadow-lg
        pb-[env(safe-area-inset-bottom)]
        transition-colors duration-300
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-around px-2 py-3 sm:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className={`
                  flex h-auto min-w-[56px] flex-col items-center gap-1
                  rounded-2xl px-2 py-2 sm:min-w-[72px] sm:px-3
                  transition-all duration-300
                  hover:scale-105
                  ${
                    item.active
                      ? `
                        bg-gradient-to-r
                        from-orange-500
                        to-red-600
                        text-white
                        shadow-lg shadow-orange-500/30
                      `
                      : `
                        text-zinc-600
                        hover:bg-zinc-100
                        hover:text-zinc-900
                        dark:text-zinc-400
                        dark:hover:bg-white/5
                        dark:hover:text-white
                      `
                  }
                `}
              >
                <Icon className="h-5 w-5" />

                <span className="hidden text-[11px] font-medium sm:inline">
                  {item.label}
                </span>
              </Button>
            );
          })}

          <div
            className="
              flex min-w-[56px] flex-col items-center gap-1 sm:min-w-[72px]
            "
          >
            <ThemeToggle />

            <span
              className="
                hidden text-[11px] font-medium sm:inline
                text-zinc-600 dark:text-zinc-400
              "
            >
              Theme
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="
              flex h-auto min-w-[56px] flex-col items-center gap-1
              rounded-2xl px-2 py-2 sm:min-w-[72px] sm:px-3
              text-red-500
              transition-all duration-300
              hover:scale-105
              hover:bg-red-50
              hover:text-red-600
              dark:text-red-400
              dark:hover:bg-red-500/10
              dark:hover:text-red-300
            "
          >
            <LogOut className="h-5 w-5" />

            <span className="hidden text-[11px] font-medium sm:inline">
              Logout
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
