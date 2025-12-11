import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const updateData: any = {};

  // Se enviou dados do perfil, valida e prepara para atualização
  if (data.bolsista !== undefined) {
    const { bolsista, orientador, laboratorios, bolsa, weeklyWorkloadHours } = data;
    const parsedWeeklyHours = Number(weeklyWorkloadHours);

    if (
      !bolsista ||
      !orientador ||
      !laboratorios ||
      !Array.isArray(laboratorios) ||
      laboratorios.length === 0 ||
      !bolsa ||
      Number.isNaN(parsedWeeklyHours) ||
      parsedWeeklyHours <= 0
    ) {
      return NextResponse.json(
        { message: "Todos os campos do perfil são obrigatórios e a carga horária deve ser maior que zero." },
        { status: 400 },
      );
    }

    updateData.name = bolsista;
    updateData.orientador = orientador;
    updateData.laboratorios = laboratorios;
    updateData.bolsa = bolsa;
    updateData.weeklyWorkloadHours = parsedWeeklyHours;
  }

  // Se enviou customHolidays, atualiza (pode ser string vazia)
  if (data.customHolidays !== undefined) {
    updateData.customHolidays = data.customHolidays;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "Nenhum dado para atualizar." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.id },
    data: updateData,
  });

  return NextResponse.json(updatedUser);
}
