export const dynamic = "force-dynamic";

import { WeeklySlotsManager } from "@/components/weekly-slots-manager";
import { prisma } from "@/lib/prisma";

export default async function GradeSemanalPage() {
  const slots = await prisma.weeklySlot.findMany({
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });

  const serialized = slots.map(
    (slot: {
      id: string;
      weekday: number;
      startTime: string;
      endTime: string;
      description: string;
      startDate: string | null;
      endDate: string | null;
    }) => ({
      id: slot.id,
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description,
      startDate: slot.startDate,
      endDate: slot.endDate,
    }),
  );

  return <WeeklySlotsManager initialSlots={serialized} />;
}
