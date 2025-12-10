import { Company } from '../models/Company';
import { ICompany } from '../interfaces/ICompany';
import { Types } from 'mongoose';
import { CloudinaryService } from './CloudinaryService';

export class CompanyService {
  /**
   * Crear una nueva empresa
   */
  static async createCompany(companyData: Partial<ICompany>): Promise<ICompany> {
    // Validar que el subdominio no exista
    const existingCompany = await Company.findOne({
      subdomain: companyData.subdomain,
    });

    if (existingCompany) {
      throw new Error('El subdominio ya está en uso');
    }

    // Validar email del contacto
    if (!companyData.contact?.email) {
      throw new Error('El email de contacto es requerido');
    }

    const company = new Company(companyData);
    return await company.save();
  }

  /**
   * Buscar empresa por ID
   */
  static async findById(id: string | Types.ObjectId): Promise<ICompany | null> {
    return await Company.findById(id).exec();
  }

  /**
   * Buscar empresa por subdominio
   */
  static async findBySubdomain(subdomain: string): Promise<ICompany | null> {
    return await Company.findOne({ subdomain: subdomain.toLowerCase() }).exec();
  }

  /**
   * Obtener todas las empresas
   */
  static async getAllCompanies(filter: { isActive?: boolean } = {}): Promise<ICompany[]> {
    const query: any = {};

    if (filter.isActive !== undefined) {
      query['subscription.isActive'] = filter.isActive;
    }

    return await Company.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Actualizar empresa
   */
  static async updateCompany(
    id: string | Types.ObjectId,
    updateData: Partial<ICompany>
  ): Promise<ICompany | null> {
    // Si se está actualizando el subdominio, verificar que no exista
    if (updateData.subdomain) {
      const existingCompany = await Company.findOne({
        subdomain: updateData.subdomain,
        _id: { $ne: id },
      });

      if (existingCompany) {
        throw new Error('El subdominio ya está en uso');
      }
    }

    return await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * Eliminar empresa (soft delete - desactivar)
   */
  static async deleteCompany(id: string | Types.ObjectId): Promise<ICompany | null> {
    return await Company.findByIdAndUpdate(
      id,
      { $set: { 'subscription.isActive': false } },
      { new: true }
    ).exec();
  }

  /**
   * Eliminar empresa permanentemente
   */
  static async hardDeleteCompany(id: string | Types.ObjectId): Promise<boolean> {
    const result = await Company.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Actualizar logo de la empresa
   */
  static async updateLogo(
    id: string | Types.ObjectId,
    logoFile: Express.Multer.File
  ): Promise<ICompany | null> {
    // Subir logo a Cloudinary
    const logoUrl = await CloudinaryService.uploadImage(logoFile, 'company-logos');

    // Actualizar empresa con nueva URL del logo
    return await Company.findByIdAndUpdate(id, { $set: { logo: logoUrl } }, { new: true }).exec();
  }

  /**
   * Eliminar logo de la empresa
   */
  static async deleteLogo(id: string | Types.ObjectId): Promise<ICompany | null> {
    const company = await Company.findById(id);

    if (!company || !company.logo) {
      throw new Error('La empresa no tiene logo');
    }

    // Eliminar de Cloudinary si es necesario
    // await CloudinaryService.deleteImage(company.logo);

    return await Company.findByIdAndUpdate(id, { $unset: { logo: '' } }, { new: true }).exec();
  }

  /**
   * Verificar límites de la empresa
   */
  static async checkLimits(
    companyId: string | Types.ObjectId,
    type: 'users' | 'residents'
  ): Promise<{ withinLimit: boolean; current: number; max: number }> {
    const company = await Company.findById(companyId);

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // Aquí deberías contar los usuarios/residentes actuales
    // Por ahora retornamos un placeholder
    const current = 0; // TODO: Implementar conteo real
    const max =
      type === 'users' ? company.subscription.maxUsers : company.subscription.maxResidents;

    return {
      withinLimit: current < max,
      current,
      max,
    };
  }

  /**
   * Actualizar plan de suscripción
   */
  static async updateSubscription(
    id: string | Types.ObjectId,
    subscriptionData: Partial<ICompany['subscription']>
  ): Promise<ICompany | null> {
    return await Company.findByIdAndUpdate(
      id,
      { $set: { subscription: subscriptionData } },
      { new: true, runValidators: true }
    ).exec();
  }
}
