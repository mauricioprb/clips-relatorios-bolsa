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
      { message: "Todos os campos são obrigatórios e a carga horária deve ser maior que zero." },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: bolsista,
      orientador,
      laboratorios,
      bolsa,
      weeklyWorkloadHours: parsedWeeklyHours,
    },
  });

  return NextResponse.json(updatedUser);
}
