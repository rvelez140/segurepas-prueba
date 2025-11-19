import { Request, Response, NextFunction } from "express";
import { AccessListService } from "../services/AccessListService";
import { ListType } from "../interfaces/IAccessList";

export const accessListController = {
  /**
   * Agregar documento a lista negra
   */
  async addToBlacklist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document, reason, expiresAt, notes } = req.body;
      const user = (req as any).user;

      const entry = await AccessListService.addToList({
        document,
        type: ListType.BLACKLIST,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        notes,
        addedBy: user._id,
        status: "active" as any,
      });

      res.status(201).json({
        message: "Documento agregado a lista negra",
        data: entry,
      });
    } catch (error: any) {
      if (error.message.includes("ya está en la")) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Agregar documento a lista blanca
   */
  async addToWhitelist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document, reason, expiresAt, notes } = req.body;
      const user = (req as any).user;

      const entry = await AccessListService.addToList({
        document,
        type: ListType.WHITELIST,
        reason,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        notes,
        addedBy: user._id,
        status: "active" as any,
      });

      res.status(201).json({
        message: "Documento agregado a lista blanca",
        data: entry,
      });
    } catch (error: any) {
      if (error.message.includes("ya está en la")) {
        res.status(400).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Remover de lista negra
   */
  async removeFromBlacklist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document } = req.params;

      const entry = await AccessListService.removeFromList(
        document,
        ListType.BLACKLIST
      );

      if (!entry) {
        res.status(404).json({ error: "Documento no encontrado en lista negra" });
        return;
      }

      res.status(200).json({
        message: "Documento removido de lista negra",
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remover de lista blanca
   */
  async removeFromWhitelist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document } = req.params;

      const entry = await AccessListService.removeFromList(
        document,
        ListType.WHITELIST
      );

      if (!entry) {
        res.status(404).json({ error: "Documento no encontrado en lista blanca" });
        return;
      }

      res.status(200).json({
        message: "Documento removido de lista blanca",
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener lista negra
   */
  async getBlacklist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { includeInactive } = req.query;
      const list = await AccessListService.getList(
        ListType.BLACKLIST,
        includeInactive === "true"
      );

      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener lista blanca
   */
  async getWhitelist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { includeInactive } = req.query;
      const list = await AccessListService.getList(
        ListType.WHITELIST,
        includeInactive === "true"
      );

      res.status(200).json(list);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verificar si documento está en blacklist
   */
  async checkBlacklist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document } = req.params;
      const isBlacklisted = await AccessListService.isBlacklisted(document);

      res.status(200).json({
        document,
        isBlacklisted,
        message: isBlacklisted
          ? "El documento está en lista negra"
          : "El documento no está en lista negra",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verificar si documento está en whitelist
   */
  async checkWhitelist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { document } = req.params;
      const isWhitelisted = await AccessListService.isWhitelisted(document);

      res.status(200).json({
        document,
        isWhitelisted,
        message: isWhitelisted
          ? "El documento está en lista blanca"
          : "El documento no está en lista blanca",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas
   */
  async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AccessListService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Limpiar entradas expiradas
   */
  async cleanExpired(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await AccessListService.cleanExpired();
      res.status(200).json({
        message: `Se limpiaron ${count} entradas expiradas`,
        count,
      });
    } catch (error) {
      next(error);
    }
  },
};
