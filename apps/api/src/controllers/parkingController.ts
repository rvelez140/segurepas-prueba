import { Request, Response, NextFunction } from 'express';
import { ParkingService } from '../services/ParkingService';
import { ParkingType } from '../interfaces/IParking';
import { getPaginationOptions } from '../utils/pagination';

export const parkingController = {
  /**
   * Crear espacio de parqueo
   */
  async createSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { number, type, floor, section, resident, notes } = req.body;

      const space = await ParkingService.createSpace({
        number,
        type,
        floor,
        section,
        resident,
        notes,
      });

      res.status(201).json({
        message: 'Espacio de parqueo creado exitosamente',
        data: space,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'El número de espacio ya existe' });
      } else {
        next(error);
      }
    }
  },

  /**
   * Obtener todos los espacios
   */
  async getAllSpaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status } = req.query;
      const filters: any = {};

      if (type) filters.type = type;
      if (status) filters.status = status;

      const spaces = await ParkingService.getAllSpaces(filters);

      res.status(200).json(spaces);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener espacios disponibles
   */
  async getAvailableSpaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query;
      const parkingType = type ? (type as ParkingType) : undefined;

      const spaces = await ParkingService.getAvailableSpaces(parkingType);

      res.status(200).json({
        total: spaces.length,
        data: spaces,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener espacio por ID
   */
  async getSpaceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const space = await ParkingService.getSpaceById(id);

      if (!space) {
        res.status(404).json({ error: 'Espacio de parqueo no encontrado' });
        return;
      }

      res.status(200).json(space);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar espacio
   */
  async updateSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const space = await ParkingService.updateSpace(id, updates);

      if (!space) {
        res.status(404).json({ error: 'Espacio de parqueo no encontrado' });
        return;
      }

      res.status(200).json({
        message: 'Espacio actualizado exitosamente',
        data: space,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar espacio
   */
  async deleteSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ParkingService.deleteSpace(id);

      if (!deleted) {
        res.status(404).json({ error: 'Espacio de parqueo no encontrado' });
        return;
      }

      res.status(200).json({
        message: 'Espacio eliminado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Asignar espacio de parqueo
   */
  async assignSpace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { parkingSpaceId, visitId, vehiclePlate } = req.body;
      const user = (req as any).user;

      const assignment = await ParkingService.assignSpace({
        parkingSpace: parkingSpaceId,
        visit: visitId,
        vehiclePlate,
        assignedBy: user._id,
      });

      res.status(201).json({
        message: 'Espacio de parqueo asignado exitosamente',
        data: assignment,
      });
    } catch (error: any) {
      if (error.message.includes('no está disponible')) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Registrar salida de parqueadero
   */
  async recordExit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;

      const assignment = await ParkingService.recordExit(assignmentId);

      if (!assignment) {
        res.status(404).json({ error: 'Asignación no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Salida registrada exitosamente',
        data: assignment,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener historial de asignaciones
   */
  async getAssignmentHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { spaceId, visitId } = req.query;
      const paginationOptions = getPaginationOptions(req.query);
      const filters: any = {};

      if (spaceId) filters.parkingSpace = spaceId;
      if (visitId) filters.visit = visitId;

      const result = await ParkingService.getAssignmentHistory(filters, paginationOptions);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener asignaciones activas
   */
  async getActiveAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await ParkingService.getActiveAssignments();

      res.status(200).json({
        total: assignments.length,
        data: assignments,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas de parqueadero
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await ParkingService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },
};
