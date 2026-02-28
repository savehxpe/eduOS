import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const getSecret = () => new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-change-me"
);

export interface JWTPayload {
    userId: string;
    role: "admin" | "teacher" | "student" | "parent";
    email: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

export function extractToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }
    return authHeader;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
