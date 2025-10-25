import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthenticationHelper {
    private ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "yourAccessTokenSecret";
    private REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "yourRefreshTokenSecret";

    public async comparePassword(
        hashedPassword: string,
        plainPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    public generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    }

    public generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    }

    public printTokens() {
        console.log("Access Token:", this.ACCESS_TOKEN_SECRET);
        console.log("Refresh Token:", this.REFRESH_TOKEN_SECRET);
    }
}