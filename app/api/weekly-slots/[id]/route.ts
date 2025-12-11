import { NextRequest, NextResponse } from "next/server";
import { weeklySlotService } from "@/lib/services/weeklySlotService";
import { getSessionFromCookies } from "@/lib/auth";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { weekday, startTime, endTime, description, startDate, endDate } = await req.json();
  const weekdayNumber = Number(weekday);

  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }

  try {
    const updated = await weeklySlotService.update(
      id,
      {
        weekday: weekdayNumber,
        startTime,
        endTime,
        description,
        startDate,
        endDate,
      },
      session.id,
    );

    return NextResponse.json(updated);
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
    await weeklySlotService.delete(id, session.id);
    return NextResponse.json({ message: "Removido" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao remover ou não autorizado" }, { status: 403 });
  }
}
