export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Calendar } from "@/components/calendar/calendar";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";

type Props = {
  searchParams: Promise<{ ano?: string; mes?: string }>;
};

export default async function MesPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const today = new Date();
  const year = Number(resolvedSearchParams?.ano) || today.getFullYear();
  const month = Number(resolvedSearchParams?.mes) || today.getMonth() + 1;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Mês</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Atividades do mês
        </h1>
        <p className="text-slate-600">
          Consulte, edite e preencha automaticamente os dias de{" "}
          {month.toString().padStart(2, "0")}/{year}.
        </p>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <Calendar year={year} month={month} />
      </Suspense>
      
    </div>
  );
}
