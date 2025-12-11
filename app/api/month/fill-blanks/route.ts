import { NextRequest, NextResponse } from "next/server";
import { monthService } from "@/lib/services/monthService";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { ano, mes } = await req.json();
  const year = Number(ano);
  const month = Number(mes);

  if (!year || !month) {
    return NextResponse.json(
      { message: "Informe ano e mês no corpo da requisição." },
      { status: 400 },
    );
  }

  try {
    const result = await monthService.fillBlanks(year, month, session.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao preencher dias" },
      { status: 400 },
    );
  }
}
