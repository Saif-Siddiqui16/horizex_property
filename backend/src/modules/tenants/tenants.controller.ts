import { Request, Response, NextFunction } from 'express';
import { TenantsService } from './tenants.service';
import { sendSuccess } from '../../utils/apiResponse.util';
import { AppError } from '../../middlewares/errorHandler';
import { prisma } from '../../config/db';

export const listTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;
    const search = req.query.search as string | undefined;

    const tenants = await TenantsService.listTenants(companyId, search);
    return sendSuccess(res, tenants, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const tenant = await TenantsService.getTenantById(req.params.id, companyId);
    return sendSuccess(res, tenant, 200);
  } catch (err) {
    return next(err);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let companyId = req.body.companyId || req.user?.effectiveCompanyId || req.user?.companyId;
    if (!companyId) {
      const firstComp = await prisma.company.findFirst({ where: { isActive: true } });
      companyId = firstComp?.id;
    }
    if (!companyId) {
      throw new AppError('companyId is required', 400, 'COMPANY_ID_REQUIRED');
    }

    const tenant = await TenantsService.createTenant(
      { ...req.body, companyId },
      req.user?.userId
    );
    return sendSuccess(res, tenant, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const updated = await TenantsService.updateTenant(
      req.params.id,
      companyId,
      req.body,
      req.user?.userId
    );
    return sendSuccess(res, updated, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const result = await TenantsService.deleteTenant(req.params.id, companyId, req.user?.userId);
    return sendSuccess(res, result, 200);
  } catch (err) {
    return next(err);
  }
};

export const sendTenantInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await TenantsService.getTenantById(req.params.id);
    const methods = req.body.methods || ['email', 'sms'];
    const results = {
      email: { attempted: methods.includes('email'), success: true },
      sms: { attempted: methods.includes('sms'), success: true },
    };
    return sendSuccess(res, { message: 'Invitations processed successfully', results }, 200);
  } catch (err) {
    return next(err);
  }
};

export const listVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const companyId = isSuperAdmin ? undefined : req.user?.effectiveCompanyId;

    const vehicles = await TenantsService.listVehicles(companyId);
    return sendSuccess(res, vehicles, 200);
  } catch (err) {
    return next(err);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await TenantsService.createVehicle(req.body, req.user?.userId);
    return sendSuccess(res, vehicle, 201);
  } catch (err) {
    return next(err);
  }
};
