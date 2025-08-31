import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function comparePassword(
    hashedPassword: string,
    plainPassword: string
): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
}


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "yourAccessTokenSecret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "yourRefreshTokenSecret";

// Generate Access Token (short-lived)
export function generateAccessToken(payload: object): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

// Generate Refresh Token (longer-lived)
export function generateRefreshToken(payload: object): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}
