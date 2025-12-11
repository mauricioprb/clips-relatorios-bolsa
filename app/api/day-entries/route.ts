import { NextRequest, NextResponse } from "next/server";
import { dayEntryService } from "@/lib/services/dayEntryService";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("ano");
  const monthParam = searchParams.get("mes");

  let entries;
  if (yearParam && monthParam) {
    const year = Number(yearParam);
    const month = Number(monthParam);
    entries = await dayEntryService.listByMonth(year, month, session.id);
  } else if (yearParam) {
    const year = Number(yearParam);
    entries = await dayEntryService.listByYear(year, session.id);
  } else {
    entries = await dayEntryService.listAll(session.id);
  }

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { date, startTime, endTime, description, hours, color } = await req.json();

  if (!date || !description) {
    return NextResponse.json({ message: "Data e descrição são obrigatórias." }, { status: 400 });
  }

  const entry = await dayEntryService.create(
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
}
