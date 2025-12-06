import { NextRequest, NextResponse } from "next/server";
import { monthService } from "@/lib/services/monthService";

export async function POST(req: NextRequest) {
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
    const result = await monthService.fillBlanks(year, month);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao preencher dias" },
      { status: 400 },
    );
  }
}
