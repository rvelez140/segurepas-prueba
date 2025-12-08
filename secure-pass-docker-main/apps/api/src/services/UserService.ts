import { User } from '../models/User';
import { IUser, GuardShift, Resident, Guard } from '../interfaces/IUser';
import { Types } from 'mongoose';
import { flattenObject } from '../types/express.types';

export class UserService {
  static async createUser(userData: IUser): Promise<IUser> {
    if (userData.role === 'residente' && (!userData.apartment || !userData.tel)) {
      throw new Error('Apartamento y teléfono son requeridos para residentes');
    }

    if (userData.role === 'guardia' && !userData.shift) {
      throw new Error('Turno es requerido para guardias');
    }

    const user = new User(userData);
    return await user.save();
  }

  static async createUserWithGoogle(userData: IUser): Promise<IUser> {
    // Para usuarios de Google, no requerimos apartamento y teléfono inicialmente
    // Se pueden agregar después
    const user = new User(userData);
    return await user.save();
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ 'auth.email': email }).select('+auth.password').exec();
  }

  static async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return await User.findById(id).exec();
  }

  static async getUsersByRole(role: 'residente' | 'guardia' | 'admin'): Promise<IUser[]> {
    return await User.find({ role }).select('-auth.password').exec();
  }

  static async getAllUsers(): Promise<IUser[]> {
    return await User.find().select('-auth.password').sort({ registerDate: -1 }).exec();
  }

  static async updateUser(
    id: string | Types.ObjectId,
    updateData: Partial<
      Omit<IUser, '_id' | 'comparePassword'> & {
        auth?: { email?: string; password?: string };
      }
    >
  ): Promise<IUser | null> {
    // Verificación para residente
    if (
      updateData.role === 'residente' ||
      (updateData.role === undefined && (updateData as Resident).apartment !== undefined)
    ) {
      if (!(updateData as Resident).apartment || !(updateData as Resident).tel) {
        throw new Error('Apartamento y teléfono son requeridos para residentes');
      }
    }

    // Verificación para guardia
    if (
      updateData.role === 'guardia' ||
      (updateData.role === undefined && (updateData as Guard).shift !== undefined)
    ) {
      if (!(updateData as Guard).shift) {
        throw new Error('Turno es requerido para guardias');
      }
    }

    const flattenedUpdate = flattenObject({
      ...updateData,
      updateDate: new Date(),
    });

    return await User.findByIdAndUpdate(id, { $set: flattenedUpdate }, { new: true }).exec();
  }

  static async deleteUser(id: string | Types.ObjectId): Promise<IUser | null> {
    const user = await User.findById(id).exec();
    await User.findByIdAndDelete(id).exec();
    return user;
  }

  static async comparePasswords(
    userId: string | Types.ObjectId,
    candidatePassword: string
  ): Promise<boolean> {
    const user = await User.findById(userId).select('+auth.password').exec();
    if (!user) throw new Error('Usuario no encontrado');
    return await user.comparePassword(candidatePassword);
  }

  static async updatePassword(userId: string | Types.ObjectId, newPassword: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: {
        'auth.password': newPassword,
        updateDate: new Date(),
      },
    }).exec();
  }
}
