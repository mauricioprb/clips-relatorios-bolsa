import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const activities = await defaultActivityService.list(session.id);
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { description, color } = await req.json();
  if (!description || !color) {
    return NextResponse.json({ message: "Informe descrição e cor." }, { status: 400 });
  }

  const activity = await defaultActivityService.create(
    {
      description,
      color,
    },
    session.id,
  );
  return NextResponse.json(activity);
}
