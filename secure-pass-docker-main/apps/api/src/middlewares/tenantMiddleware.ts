import { Response, NextFunction } from 'express';
import { CompanyService } from '../services/CompanyService';
import { AuthenticatedRequest } from '../types/auth.types';
import { Types } from 'mongoose';

/**
 * Middleware para cargar la empresa del usuario autenticado
 * Debe ejecutarse después del authMiddleware
 */
export const tenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // El usuario debe estar autenticado (authMiddleware ejecutado previamente)
    if (!req.user) {
      res.status(401).json({ error: 'Autenticación requerida' });
      return;
    }

    // Obtener el companyId del usuario
    const companyId = req.user.company;

    if (!companyId) {
      res.status(400).json({ error: 'Usuario no tiene empresa asignada' });
      return;
    }

    // Cargar la empresa
    const company = await CompanyService.findById(companyId);

    if (!company) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    // Verificar que la empresa esté activa
    if (!company.subscription.isActive) {
      res.status(403).json({ error: 'La empresa no está activa' });
      return;
    }

    // Agregar la empresa y companyId al request para usarlos en los controladores
    req.company = company;
    req.companyId = new Types.ObjectId(companyId);

    next();
  } catch (error) {
    console.error('Error en tenantMiddleware:', error);
    res.status(500).json({ error: 'Error al cargar la empresa' });
  }
};

/**
 * Middleware para cargar empresa por subdominio (desde headers o query)
 * Útil para login y endpoints públicos
 */
export const tenantBySubdomainMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener subdominio desde header, query o body
    const subdomain =
      (req.headers['x-company-subdomain'] as string) ||
      (req.query.subdomain as string) ||
      req.body.subdomain;

    if (!subdomain) {
      res.status(400).json({ error: 'Subdominio es requerido' });
      return;
    }

    // Buscar empresa por subdominio
    const company = await CompanyService.findBySubdomain(subdomain);

    if (!company) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    // Verificar que la empresa esté activa
    if (!company.subscription.isActive) {
      res.status(403).json({ error: 'La empresa no está activa' });
      return;
    }

    // Agregar la empresa al request
    req.company = company;
    req.companyId = company._id;

    next();
  } catch (error) {
    console.error('Error en tenantBySubdomainMiddleware:', error);
    res.status(500).json({ error: 'Error al cargar la empresa' });
  }
};

/**
 * Middleware opcional de tenant (no falla si no hay empresa)
 * Útil para super-admin que puede acceder a múltiples empresas
 */
export const optionalTenantMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user && req.user.company) {
      const company = await CompanyService.findById(req.user.company);
      if (company) {
        req.company = company;
        req.companyId = new Types.ObjectId(req.user.company);
      }
    }
    next();
  } catch (error) {
    console.error('Error en optionalTenantMiddleware:', error);
    next(); // Continuar sin empresa
  }
};
