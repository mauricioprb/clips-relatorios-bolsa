import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = await createSessionToken(username);
    const res = NextResponse.json({ message: "Autenticado" });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  }

  return NextResponse.json(
    { message: "Credenciais inválidas" },
    { status: 401 }
  );
}
