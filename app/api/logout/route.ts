import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Sessão encerrada" });
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions,
    expires: new Date(0),
  });
  return res;
}
