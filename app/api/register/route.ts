import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      orientador,
      laboratorio,
      bolsa,
      weeklyWorkloadHours,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email já cadastrado." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        orientador,
        laboratorio,
        bolsa,
        weeklyWorkloadHours: Number(weeklyWorkloadHours) || 20,
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar usuário." },
      { status: 500 }
    );
  }
}
