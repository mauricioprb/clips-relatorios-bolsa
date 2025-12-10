import { NextRequest, NextResponse } from "next/server";
import { configService } from "@/lib/services/configService";

export async function GET() {
  const config = await configService.getConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { bolsista, orientador, laboratorio, bolsa, weeklyWorkloadHours } = data;

  const parsedWeeklyHours = Number(weeklyWorkloadHours);

  if (
    !bolsista ||
    !orientador ||
    !laboratorio ||
    !bolsa ||
    Number.isNaN(parsedWeeklyHours) ||
    parsedWeeklyHours <= 0
  ) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios e a carga horária deve ser maior que zero." },
      { status: 400 }
    );
  }

  const payload = {
    bolsista,
    orientador,
    laboratorio,
    bolsa,
    weeklyWorkloadHours: parsedWeeklyHours,
  };
  const saved = await configService.saveConfig(payload);

  return NextResponse.json(saved);
}
