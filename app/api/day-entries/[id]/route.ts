import { NextRequest, NextResponse } from "next/server";
import { dayEntryService } from "@/lib/services/dayEntryService";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = params;
  const { date, startTime, endTime, description, hours } = await req.json();

  const entry = await dayEntryService.update(id, {
    date,
    startTime,
    endTime,
    description,
    hours,
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params;
  await dayEntryService.delete(id);
  return NextResponse.json({ message: "Removido" });
}
