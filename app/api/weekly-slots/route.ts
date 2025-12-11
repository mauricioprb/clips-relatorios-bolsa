import { NextRequest, NextResponse } from "next/server";
import { weeklySlotService } from "@/lib/services/weeklySlotService";

export async function GET() {
  const slots = await weeklySlotService.list();
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
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
      { status: 400 }
    );
  }

  const slot = await weeklySlotService.create({
    weekday: weekdayNumber,
    startTime,
    endTime,
    description,
    startDate,
    endDate,
  });

  return NextResponse.json(slot);
}
