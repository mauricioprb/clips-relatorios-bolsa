"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, CalendarDays, ListChecks, Calendar, LogOut, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

import { ModeToggle } from "@/components/mode-toggle";

const links = [
  { href: "/mes", label: "Mês", icon: Calendar },
  { href: "/grade-semanal", label: "Grade", icon: CalendarDays },
  { href: "/atividades-padrao", label: "Atividades", icon: ListChecks },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function FloatingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/entrar");
    } finally {
      setLoading(false);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <nav className="hidden md:flex items-center gap-1 rounded-full border border-border bg-background/80 p-2 shadow-sm backdrop-blur-md">
        <div className="pl-4 pr-2">
          <Image
            src="/logo_clips_light.svg"
            alt="Clips Logo"
            width={100}
            height={32}
            className="h-6 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logo_clips.svg"
            alt="Clips Logo"
            width={100}
            height={32}
            className="h-6 w-auto hidden dark:block"
            priority
          />
        </div>
        <Separator orientation="vertical" className="mx-1 h-8" />
        {links.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          const id = `nav-${link.href.replace("/", "")}`;

          return (
            <Link key={link.href} href={link.href} id={id}>
              <div
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-accent"
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
                className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

      <nav
        className="md:hidden mx-4 border border-border bg-background/80 shadow-lg backdrop-blur-md overflow-hidden rounded-4xl"
        style={{ width: "calc(100vw - 2rem)" }}
      >
        <div className="grid grid-cols-3 items-center p-2 px-4">
          <div className="flex items-center justify-start">
            <Image
              src="/logo_clip.svg"
              alt="Clips Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </Button>
          </div>

          <div className="flex items-center justify-end gap-1">
            <ModeToggle iconClassName="h-8 w-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loading}
              className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-8 w-8" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              <div className="flex flex-col gap-1 mt-2">
                {links.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
