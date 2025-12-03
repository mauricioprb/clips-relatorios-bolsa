import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";

export async function GET() {
  const activities = await defaultActivityService.list();
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const { description, hours, priority } = await req.json();
  if (!description || hours === undefined || priority === undefined) {
    return NextResponse.json(
      { message: "Informe descrição, horas e prioridade." },
      { status: 400 }
    );
  }

  const parsedHours = Number(hours);
  const parsedPriority = Number(priority);

  const activity = await defaultActivityService.create({
    description,
    hours: parsedHours,
    priority: parsedPriority,
  });

  return NextResponse.json(activity);
}
