import { prisma } from '../../config/db';
import { comparePassword, hashPassword } from '../../utils/password.util';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils/jwt.util';
import { AppError } from '../../middlewares/errorHandler';

export class AuthService {
  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials or account is deactivated', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials or account is deactivated', 401, 'INVALID_CREDENTIALS');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save hashed refresh token in DB for rotation security
    const hashedRefresh = await hashPassword(refreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        company: user.company,
      },
    };
  }

  static async refresh(rawRefreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive || !user.refreshToken) {
      throw new AppError('User not found or session revoked', 401, 'SESSION_REVOKED');
    }

    // Verify token against stored hash
    const isTokenValid = await comparePassword(rawRefreshToken, user.refreshToken);
    if (!isTokenValid) {
      // Possible replay attack detected! Wipe token from DB
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      throw new AppError('Token reuse detected. Please log in again', 401, 'TOKEN_REUSE_DETECTED');
    }

    // Generate rotated tokens
    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    // Rotate stored hash
    const newHashed = await hashPassword(newRefreshToken);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newHashed },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('User account not found or inactive', 404, 'USER_NOT_FOUND');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken, ...userSafe } = user;
    return userSafe;
  }
}

