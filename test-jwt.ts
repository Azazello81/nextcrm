// test-jwt.ts
import { JWTService } from './src/lib/auth/jwt';

const payload = { userId: 'test123', email: 'test@example.com' };
const token = JWTService.generateAccessToken(payload);
console.log("JWT Token:", token);

const decoded = JWTService.verifyAccessToken(token);
console.log("Decoded:", decoded);