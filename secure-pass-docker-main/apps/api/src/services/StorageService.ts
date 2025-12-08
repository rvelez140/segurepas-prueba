import { VisitService } from './VisitService';
import { CloudinaryService } from './CloudinaryService';
import { IVisit } from '../interfaces/IVisit';

export class StorageService {
  static async uploadVisitImage(document: string, imageBuffer: Buffer): Promise<IVisit[] | null> {
    const visits = await VisitService.getVisitsByDocument(document);
    if (!visits || visits.length === 0) throw new Error('Visita no encontrada');

    // Eliminar imágenes anteriores si existen
    const uniqueImageUrls = new Set(
      visits.map((v) => v.visit.visitImage).filter((url) => url !== undefined && url !== null)
    );

    await Promise.all(
      Array.from(uniqueImageUrls).map((url) =>
        url ? CloudinaryService.deleteImage(url) : Promise.resolve()
      )
    );

    // Subir nueva imagen
    const imageUrl = await CloudinaryService.uploadImage(imageBuffer, `visits/${document}/profile`);

    // Actualizar todas las visitas con el mismo documento
    const updatedVisits = await VisitService.updateVisitImagesByDocument(document, imageUrl);

    return updatedVisits;
  }

  static async uploadVehicleImage(document: string, imageBuffer: Buffer): Promise<IVisit[] | null> {
    const visits = await VisitService.getVisitsByDocument(document);
    if (!visits || visits.length === 0) throw new Error('Visita no encontrada');

    // Eliminar imágenes anteriores si existen
    const uniqueImageUrls = new Set(
      visits.map((v) => v.visit.vehicleImage).filter((url) => url !== undefined && url !== null)
    );

    await Promise.all(
      Array.from(uniqueImageUrls).map((url) =>
        url ? CloudinaryService.deleteImage(url) : Promise.resolve()
      )
    );

    // Subir nueva imagen
    const imageUrl = await CloudinaryService.uploadImage(imageBuffer, `visits/${document}/vehicle`);

    // Actualizar todas las visitas con el mismo documento
    const updatedVisits = await VisitService.updateVehicleImagesByDocument(document, imageUrl);

    return updatedVisits;
  }

  static async deleteVisitFolder(document: string): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
    details: {
      profile: { success: boolean; message: string };
      vehicle: { success: boolean; message: string };
    };
    visits: IVisit[] | null;
  }> {
    try {
      let totalDeleted = 0;

      // Eliminar folder de perfil
      const profileResult = await CloudinaryService.deleteFolder(`visits/${document}/profile`);
      if (profileResult.success) totalDeleted += profileResult.deletedCount || 0;

      // Eliminar folder de vehículo
      const vehicleResult = await CloudinaryService.deleteFolder(`visits/${document}/vehicle`);
      if (vehicleResult.success) totalDeleted += vehicleResult.deletedCount || 0;

      // Actualizar todas las visitas con el mismo documento a un url standard
      const updatedVisits = await VisitService.updateVisitImagesByDocument(
        document,
        'https://example.com/image.jpg'
      );
      await VisitService.updateVehicleImagesByDocument(document, 'https://example.com/image.jpg');

      return {
        success: profileResult.success && vehicleResult.success,
        message: `Eliminadas ${totalDeleted} imágenes de la visita ${document}`,
        deletedCount: totalDeleted,
        details: {
          profile: {
            success: profileResult.success,
            message: profileResult.message,
          },
          vehicle: {
            success: vehicleResult.success,
            message: vehicleResult.message,
          },
        },
        visits: updatedVisits,
      };
    } catch (error: any) {
      console.error(`Error eliminando visita ${document}:`, error);
      return {
        success: false,
        message: `Error al eliminar visita: ${error}`,
        deletedCount: 0,
        details: {
          profile: { success: false, message: error.message },
          vehicle: { success: false, message: error.message },
        },
        visits: null,
      };
    }
  }

  /*
  Elimina todo el contenido del folder 'visits'
   */
  static async deleteAllVisits(): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
    visits: IVisit[] | null;
  }> {
    try {
      const result = await CloudinaryService.deleteFolder('visits');

      const visits = await VisitService.updateAllImagesToDefault();

      return {
        success: result.success,
        message: result.message,
        deletedCount: result.deletedCount || 0,
        visits: visits,
      };
    } catch (error: any) {
      console.error('Error eliminando todas las visitas:', error);
      return {
        success: false,
        message: `Error al eliminar visitas: ${error.message}`,
        deletedCount: 0,
        visits: null,
      };
    }
  }
}
