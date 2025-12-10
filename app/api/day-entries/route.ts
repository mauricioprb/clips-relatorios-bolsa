import { NextRequest, NextResponse } from "next/server";
import { dayEntryService } from "@/lib/services/dayEntryService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("ano");
  const monthParam = searchParams.get("mes");

  let entries;
  if (yearParam && monthParam) {
    const year = Number(yearParam);
    const month = Number(monthParam);
    entries = await dayEntryService.listByMonth(year, month);
  } else if (yearParam) {
    const year = Number(yearParam);
    entries = await dayEntryService.listByYear(year);
  } else {
    entries = await dayEntryService.listAll();
  }

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { date, startTime, endTime, description, hours, color } = await req.json();

  if (!date || !description) {
    return NextResponse.json({ message: "Data e descrição são obrigatórias." }, { status: 400 });
  }

  const entry = await dayEntryService.create({
    date,
    startTime,
    endTime,
    description,
    hours,
    color,
  });

  return NextResponse.json(entry);
}
