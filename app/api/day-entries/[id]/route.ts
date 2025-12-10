import { NextRequest, NextResponse } from "next/server";
import { dayEntryService } from "@/lib/services/dayEntryService";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  const { date, startTime, endTime, description, hours, color } = await req.json();

  const entry = await dayEntryService.update(id, {
    date,
    startTime,
    endTime,
    description,
    hours,
    color,
  });

  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  await dayEntryService.delete(id);
  return NextResponse.json({ message: "Removido" });
}
