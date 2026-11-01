import { Router } from 'express';
import { login, refresh, logout, getMe } from './auth.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';
import { authLimiter } from '../../middlewares/rateLimiter';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Public auth endpoints
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', authLimiter, refresh);

// Protected auth endpoints
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;

