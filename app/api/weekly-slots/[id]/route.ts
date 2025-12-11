import { NextRequest, NextResponse } from "next/server";
import { weeklySlotService } from "@/lib/services/weeklySlotService";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { weekday, startTime, endTime, description, startDate, endDate } = await req.json();
  const weekdayNumber = Number(weekday);

  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }

  const updated = await weeklySlotService.update(id, {
    weekday: weekdayNumber,
    startTime,
    endTime,
    description,
    startDate,
    endDate,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }

  await weeklySlotService.delete(id);
  return NextResponse.json({ message: "Removido" });
}
