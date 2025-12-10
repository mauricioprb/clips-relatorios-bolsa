import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email e senha são obrigatórios." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && (await verifyPassword(password, user.password))) {
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    });
    const res = NextResponse.json({ message: "Autenticado" });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  }

  return NextResponse.json({ message: "Credenciais inválidas" }, { status: 401 });
}
