import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export interface JWTPayload {
    userId: string;
    role: "admin" | "teacher" | "student" | "parent";
    email: string;
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export function extractToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    // Support both "Bearer <token>" and cookie-based
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
