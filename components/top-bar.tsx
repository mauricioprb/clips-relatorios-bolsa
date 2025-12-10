"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/painel", label: "Painel" },
  { href: "/configuracoes", label: "Configurações" },
  { href: "/grade-semanal", label: "Grade semanal" },
  { href: "/atividades-padrao", label: "Atividades padrão" },
  { href: "/mes", label: "Preencher mês" },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/painel" className="text-lg font-semibold text-blue-800">
          BagUnça
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 transition ${
                isActive(link.href)
                  ? "bg-blue-100 text-blue-800"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? "Saindo..." : "Sair"}
          </button>
        </nav>
      </div>
    </header>
  );
}
