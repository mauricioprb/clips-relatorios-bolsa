export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Calendar } from "@/components/calendar/calendar";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";
import { PageHeader } from "@/components/page-header";

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
        <PageHeader
          kicker="Mês"
          title="Atividades do mês"
          description={`Consulte, edite e preencha automaticamente os dias de ${month.toString().padStart(2, "0")}/${year}.`}
        />
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <Calendar year={year} month={month} />
      </Suspense>
    </div>
  );
}
