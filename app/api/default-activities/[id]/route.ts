import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  const { description, color } = await req.json();

  if (!description || !color) {
    return NextResponse.json({ message: "Informe descrição e cor válida." }, { status: 400 });
  }

  const activity = await defaultActivityService.update(id, {
    description,
    color,
  });

  return NextResponse.json(activity);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  await defaultActivityService.delete(id);
  return NextResponse.json({ message: "Removido" });
}
