import { AccessList } from '../models/AccessList';
import { IAccessList, IAccessListInput, ListType, AccessStatus } from '../interfaces/IAccessList';
import { Types } from 'mongoose';
import { paginate, PaginationOptions, PaginatedResult } from '../utils/pagination';

export class AccessListService {
  /**
   * Verificar si un documento está en blacklist
   */
  static async isBlacklisted(document: string): Promise<boolean> {
    const entry = await AccessList.findOne({
      document,
      type: ListType.BLACKLIST,
      status: AccessStatus.ACTIVE,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });

    return !!entry;
  }

  /**
   * Verificar si un documento está en whitelist
   */
  static async isWhitelisted(document: string): Promise<boolean> {
    const entry = await AccessList.findOne({
      document,
      type: ListType.WHITELIST,
      status: AccessStatus.ACTIVE,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    });

    return !!entry;
  }

  /**
   * Agregar un documento a una lista
   */
  static async addToList(data: IAccessListInput): Promise<IAccessList> {
    // Verificar si ya existe
    const existing = await AccessList.findOne({
      document: data.document,
      type: data.type,
    });

    if (existing) {
      // Si existe pero está inactivo, reactivarlo
      if (existing.status === AccessStatus.INACTIVE) {
        existing.status = AccessStatus.ACTIVE;
        existing.reason = data.reason || existing.reason;
        existing.expiresAt = data.expiresAt;
        existing.notes = data.notes;
        await existing.save();
        return existing;
      }
      throw new Error(
        `El documento ya está en la ${
          data.type === ListType.BLACKLIST ? 'lista negra' : 'lista blanca'
        }`
      );
    }

    const entry = await AccessList.create(data);
    return entry.populate('addedBy', 'name auth.email role');
  }

  /**
   * Remover un documento de una lista
   */
  static async removeFromList(document: string, type: ListType): Promise<IAccessList | null> {
    const entry = await AccessList.findOneAndUpdate(
      { document, type },
      { status: AccessStatus.INACTIVE },
      { new: true }
    ).populate('addedBy', 'name auth.email role');

    return entry;
  }

  /**
   * Obtener todas las entradas de un tipo de lista
   */
  static async getList(
    type: ListType,
    includeInactive: boolean = false,
    paginationOptions?: PaginationOptions
  ): Promise<PaginatedResult<IAccessList>> {
    const queryFilter: any = { type };

    if (!includeInactive) {
      queryFilter.status = AccessStatus.ACTIVE;
    }

    const query = AccessList.find(queryFilter).populate('addedBy', 'name auth.email role');

    const countQuery = AccessList.countDocuments(queryFilter);

    return await paginate(query, countQuery, {
      ...paginationOptions,
      sortBy: paginationOptions?.sortBy || 'createdAt',
      sortOrder: paginationOptions?.sortOrder || 'desc',
    });
  }

  /**
   * Obtener detalles de una entrada específica
   */
  static async getEntry(document: string, type: ListType): Promise<IAccessList | null> {
    return await AccessList.findOne({ document, type }).populate('addedBy', 'name auth.email role');
  }

  /**
   * Actualizar una entrada
   */
  static async updateEntry(
    document: string,
    type: ListType,
    updates: Partial<IAccessListInput>
  ): Promise<IAccessList | null> {
    return await AccessList.findOneAndUpdate(
      { document, type },
      { $set: updates },
      { new: true }
    ).populate('addedBy', 'name auth.email role');
  }

  /**
   * Limpiar entradas expiradas
   */
  static async cleanExpired(): Promise<number> {
    const result = await AccessList.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: AccessStatus.ACTIVE,
      },
      {
        $set: { status: AccessStatus.INACTIVE },
      }
    );

    return result.modifiedCount;
  }

  /**
   * Estadísticas de las listas
   */
  static async getStats(): Promise<{
    blacklist: { active: number; inactive: number; total: number };
    whitelist: { active: number; inactive: number; total: number };
  }> {
    const [blacklistActive, blacklistInactive, whitelistActive, whitelistInactive] =
      await Promise.all([
        AccessList.countDocuments({
          type: ListType.BLACKLIST,
          status: AccessStatus.ACTIVE,
        }),
        AccessList.countDocuments({
          type: ListType.BLACKLIST,
          status: AccessStatus.INACTIVE,
        }),
        AccessList.countDocuments({
          type: ListType.WHITELIST,
          status: AccessStatus.ACTIVE,
        }),
        AccessList.countDocuments({
          type: ListType.WHITELIST,
          status: AccessStatus.INACTIVE,
        }),
      ]);

    return {
      blacklist: {
        active: blacklistActive,
        inactive: blacklistInactive,
        total: blacklistActive + blacklistInactive,
      },
      whitelist: {
        active: whitelistActive,
        inactive: whitelistInactive,
        total: whitelistActive + whitelistInactive,
      },
    };
  }
}
