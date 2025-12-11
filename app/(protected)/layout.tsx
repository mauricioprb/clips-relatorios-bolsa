import { FloatingNavbar } from "@/components/floating-navbar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { AppTour } from "@/components/app-tour";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <AppTour>
        <FloatingNavbar />
        <main className="mx-auto max-w-screen-2xl px-4 pb-6 pt-24">{children}</main>
        <Toaster richColors position="bottom-right" />
      </AppTour>
    </div>
  );
}
