"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  ListChecks,
  Calendar,
  LogOut,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

import { ModeToggle } from "@/components/mode-toggle";

const links = [
  { href: "/mes", label: "Mês", icon: Calendar },
  { href: "/grade-semanal", label: "Grade", icon: CalendarDays },
  { href: "/atividades-padrao", label: "Atividades", icon: ListChecks },
  { href: "/config", label: "Configurações", icon: Settings },
];

export function FloatingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        {links.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-blue-100/50 dark:bg-blue-900/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 text-sm font-medium hidden sm:inline">
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}

        <Separator orientation="vertical" className="mx-1 h-8" />

        <ModeToggle />

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loading}
                className="rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {loading ? "Saindo..." : "Sair"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </div>
  );
}
