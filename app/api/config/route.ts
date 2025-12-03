import { NextRequest, NextResponse } from "next/server";
import { configService } from "@/lib/services/configService";

export async function GET() {
  const config = await configService.getConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const { bolsista, orientador, laboratorio, bolsa } = data;

  if (!bolsista || !orientador || !laboratorio || !bolsa) {
    return NextResponse.json(
      { message: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  const payload = { bolsista, orientador, laboratorio, bolsa };
  const saved = await configService.saveConfig(payload);

  return NextResponse.json(saved);
}
