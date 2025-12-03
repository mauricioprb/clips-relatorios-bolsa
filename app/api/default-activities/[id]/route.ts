import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = params;
  const { description, hours, priority } = await req.json();

  const activity = await defaultActivityService.update(id, {
    description,
    hours: Number(hours),
    priority: Number(priority),
  });

  return NextResponse.json(activity);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params;
  await defaultActivityService.delete(id);
  return NextResponse.json({ message: "Removido" });
}
