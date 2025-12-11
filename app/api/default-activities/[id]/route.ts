import { NextRequest, NextResponse } from "next/server";
import { defaultActivityService } from "@/lib/services/defaultActivityService";
import { getSessionFromCookies } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || !session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "ID não informado." }, { status: 400 });
  }
  const { description, color } = await req.json();

  if (!description || !color) {
    return NextResponse.json({ message: "Informe descrição e cor válida." }, { status: 400 });
  }

  try {
    const activity = await defaultActivityService.update(
      id,
      {
        description,
        color,
      },
      session.id,
    );

    return NextResponse.json(activity);
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
    await defaultActivityService.delete(id, session.id);
    return NextResponse.json({ message: "Removido" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao remover ou não autorizado" }, { status: 403 });
  }
}
