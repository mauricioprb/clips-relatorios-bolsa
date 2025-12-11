import { NextRequest, NextResponse } from "next/server";
import { weeklySlotService } from "@/lib/services/weeklySlotService";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const slots = await weeklySlotService.list(session.id);
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { weekday, startTime, endTime, description, startDate, endDate } = await req.json();
  const weekdayNumber = Number(weekday);

  if (
    Number.isNaN(weekdayNumber) ||
    weekdayNumber < 0 ||
    weekdayNumber > 6 ||
    !startTime ||
    !endTime ||
    !description
  ) {
    return NextResponse.json(
      { message: "Dados inválidos para criar o horário semanal." },
      { status: 400 },
    );
  }

  const slot = await weeklySlotService.create(
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

  return NextResponse.json(slot);
}
