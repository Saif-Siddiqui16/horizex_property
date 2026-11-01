import { Router } from 'express';
import {
  listConversations,
  sendMessage,
  sendCampaign,
} from './communications.controller';
import { validateRequest } from '../../middlewares/validate.middleware';
import { sendMessageSchema, sendCampaignSchema } from './communications.schema';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorizeRoles } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/conversations',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER'),
  listConversations
);

router.post(
  '/send',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER'),
  validateRequest(sendMessageSchema),
  sendMessage
);

router.post(
  '/campaigns',
  authorizeRoles('SUPER_ADMIN', 'COMPANY_ADMIN', 'PROPERTY_MANAGER'),
  validateRequest(sendCampaignSchema),
  sendCampaign
);

export default router;

