import { NextRequest, NextResponse } from "next/server";
import { dayEntryService } from "@/lib/services/dayEntryService";
import { getSessionFromCookies } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  const { date, startTime, endTime, description, hours, color } = await req.json();

  try {
    const entry = await dayEntryService.update(
      id,
      {
        date,
        startTime,
        endTime,
        description,
        hours,
        color,
      },
      session.id,
    );

    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar ou não autorizado" }, { status: 403 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  try {
    await dayEntryService.delete(id, session.id);
    return NextResponse.json({ message: "Removido" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao remover ou não autorizado" }, { status: 403 });
  }
}
