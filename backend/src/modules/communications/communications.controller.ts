import { Request, Response, NextFunction } from 'express';
import { CommunicationsService } from './communications.service';
import { sendSuccess } from '../../utils/apiResponse.util';

export const listConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const conversations = await CommunicationsService.listConversations(companyId);
    return sendSuccess(res, conversations, 200);
  } catch (err) {
    return next(err);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comm = await CommunicationsService.sendMessage(req.body, req.user?.userId);
    return sendSuccess(res, comm, 201);
  } catch (err) {
    return next(err);
  }
};

export const sendCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const result = await CommunicationsService.sendCampaign(req.body, companyId, req.user?.userId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    return next(err);
  }
};

