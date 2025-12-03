export const dynamic = "force-dynamic";

import { WeeklySlotsManager } from "@/components/weekly-slots-manager";
import { prisma } from "@/lib/prisma";

export default async function GradeSemanalPage() {
  const slots = await prisma.weeklySlot.findMany({
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });

  const serialized = slots.map((slot) => ({
    id: slot.id,
    weekday: slot.weekday,
    startTime: slot.startTime,
    endTime: slot.endTime,
    description: slot.description,
  }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Grade semanal
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Horários recorrentes
        </h1>
        <p className="text-slate-600">
          Cadastre aulas, laboratório e outros compromissos fixos por dia da
          semana.
        </p>
      </div>
      <WeeklySlotsManager initialSlots={serialized} />
    </div>
  );
}
