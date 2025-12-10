import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";

export async function GET() {
  const activities = await defaultActivityService.list();
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const { description, color } = await req.json();
  if (!description || !color) {
    return NextResponse.json(
      { message: "Informe descrição e cor." },
      { status: 400 }
    );
  }

  const activity = await defaultActivityService.create({
    description,
    color,
  });
  return NextResponse.json(activity);
}
