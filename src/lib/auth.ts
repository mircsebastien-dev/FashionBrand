import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-me"
);

export type SessionPayload = {
  userId: string;
  email: string;
  role: "CLIENT" | "ADMIN";
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  const store = cookies();
  store.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "CLIENT" | "ADMIN",
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  cookies().delete("session");
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
