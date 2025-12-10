import { FloatingNavbar } from "@/components/floating-navbar";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <FloatingNavbar />
      <main className="mx-auto max-w-screen-2xl px-4 pb-6 pt-24">{children}</main>
    </div>
  );
}
