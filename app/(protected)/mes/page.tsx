export const dynamic = "force-dynamic";

import { MonthEntriesClient } from "@/components/MonthEntriesClient";
import { getMonthRange } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: { ano?: string; mes?: string };
};

export default async function MesPage({ searchParams }: Props) {
  const today = new Date();
  const year = Number(searchParams?.ano) || today.getFullYear();
  const month = Number(searchParams?.mes) || today.getMonth() + 1;

  const { start, end } = getMonthRange(year, month);
  const entries = await prisma.dayEntry.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const serialized = entries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString(),
    startTime: entry.startTime,
    endTime: entry.endTime,
    description: entry.description,
    hours: entry.hours,
  }));

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
      <MonthEntriesClient
        year={year}
        month={month}
        initialEntries={serialized}
      />
    </div>
  );
}
