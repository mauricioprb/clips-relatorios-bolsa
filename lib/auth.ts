import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "ciclaro_session";

type SessionPayload = JWTPayload & {
  username?: string;
};

const getSecretKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado. Defina a variável de ambiente para habilitar autenticação."
    );
  }
  return new TextEncoder().encode(secret);
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSessionToken(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
  return token;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch (err) {
    console.error("Erro ao validar sessão", err);
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function getSessionFromHeaders(): Promise<SessionPayload | null> {
  const cookieHeader = headers().get("cookie");
  if (!cookieHeader) return null;
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];
  return verifySessionToken(token);
}
