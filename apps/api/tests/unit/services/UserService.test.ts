import { UserService } from '../../../src/services/UserService';
import { User } from '../../../src/models/User';
import { IUser } from '../../../src/interfaces/IUser';
import { Types } from 'mongoose';

// Mock del modelo User
jest.mock('../../../src/models/User');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('debería crear un usuario residente válido', async () => {
      const mockUserData: Partial<IUser> = {
        name: 'Juan Pérez',
        auth: {
          email: 'juan@example.com',
          password: 'password123',
        },
        role: 'residente',
        apartment: '101',
        tel: '1234567890',
        document: '12345678',
        vehiclePlate: 'ABC123',
      };

      const mockSavedUser = {
        _id: new Types.ObjectId(),
        ...mockUserData,
        save: jest.fn().mockResolvedValue(mockUserData),
      };

      (User as jest.MockedClass<typeof User>).mockImplementation(
        () => mockSavedUser as any
      );

      const result = await UserService.createUser(mockUserData as IUser);

      expect(User).toHaveBeenCalledWith(mockUserData);
      expect(mockSavedUser.save).toHaveBeenCalled();
    });

    it('debería lanzar error si residente no tiene apartamento', async () => {
      const mockUserData: Partial<IUser> = {
        name: 'Juan Pérez',
        auth: {
          email: 'juan@example.com',
          password: 'password123',
        },
        role: 'residente',
        tel: '1234567890',
        document: '12345678',
        vehiclePlate: 'ABC123',
      };

      await expect(UserService.createUser(mockUserData as IUser)).rejects.toThrow(
        'Apartamento y teléfono son requeridos para residentes'
      );
    });

    it('debería lanzar error si residente no tiene documento', async () => {
      const mockUserData: Partial<IUser> = {
        name: 'Juan Pérez',
        auth: {
          email: 'juan@example.com',
          password: 'password123',
        },
        role: 'residente',
        apartment: '101',
        tel: '1234567890',
        vehiclePlate: 'ABC123',
      };

      await expect(UserService.createUser(mockUserData as IUser)).rejects.toThrow(
        'Documento de identidad es requerido para residentes'
      );
    });

    it('debería crear un usuario guardia válido', async () => {
      const mockUserData: Partial<IUser> = {
        name: 'Carlos López',
        auth: {
          email: 'carlos@example.com',
          password: 'password123',
        },
        role: 'guardia',
        shift: 'mañana',
      };

      const mockSavedUser = {
        _id: new Types.ObjectId(),
        ...mockUserData,
        save: jest.fn().mockResolvedValue(mockUserData),
      };

      (User as jest.MockedClass<typeof User>).mockImplementation(
        () => mockSavedUser as any
      );

      const result = await UserService.createUser(mockUserData as IUser);

      expect(User).toHaveBeenCalledWith(mockUserData);
      expect(mockSavedUser.save).toHaveBeenCalled();
    });

    it('debería lanzar error si guardia no tiene turno', async () => {
      const mockUserData: Partial<IUser> = {
        name: 'Carlos López',
        auth: {
          email: 'carlos@example.com',
          password: 'password123',
        },
        role: 'guardia',
      };

      await expect(UserService.createUser(mockUserData as IUser)).rejects.toThrow(
        'Turno es requerido para guardias'
      );
    });
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email', async () => {
      const mockUser: Partial<IUser> = {
        _id: new Types.ObjectId(),
        name: 'Juan Pérez',
        auth: {
          email: 'juan@example.com',
          password: 'hashedPassword',
        },
        role: 'residente',
      };

      const selectMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      (User.findOne as jest.Mock) = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const result = await UserService.findByEmail('juan@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ 'auth.email': 'juan@example.com' });
      expect(selectMock).toHaveBeenCalledWith('+auth.password');
      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si el usuario no existe', async () => {
      const selectMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      (User.findOne as jest.Mock) = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const result = await UserService.findByEmail('noexiste@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('debería encontrar un usuario por ID', async () => {
      const userId = new Types.ObjectId();
      const mockUser: Partial<IUser> = {
        _id: userId,
        name: 'Juan Pérez',
        auth: {
          email: 'juan@example.com',
          password: 'hashedPassword',
        },
        role: 'residente',
      };

      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await UserService.findById(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('debería aceptar string como ID', async () => {
      const userId = '507f1f77bcf86cd799439011';

      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await UserService.findById(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUsersByRole', () => {
    it('debería obtener usuarios por rol', async () => {
      const mockUsers: Partial<IUser>[] = [
        {
          _id: new Types.ObjectId(),
          name: 'Residente 1',
          role: 'residente',
        },
        {
          _id: new Types.ObjectId(),
          name: 'Residente 2',
          role: 'residente',
        },
      ];

      const selectMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      (User.find as jest.Mock) = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const result = await UserService.getUsersByRole('residente');

      expect(User.find).toHaveBeenCalledWith({ role: 'residente' });
      expect(selectMock).toHaveBeenCalledWith('-auth.password');
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });

  describe('getAllUsers', () => {
    it('debería obtener todos los usuarios ordenados por fecha de registro', async () => {
      const mockUsers: Partial<IUser>[] = [
        {
          _id: new Types.ObjectId(),
          name: 'Usuario 1',
          role: 'residente',
          registerDate: new Date('2024-01-02'),
        },
        {
          _id: new Types.ObjectId(),
          name: 'Usuario 2',
          role: 'guardia',
          registerDate: new Date('2024-01-01'),
        },
      ];

      const sortMock = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const selectMock = jest.fn().mockReturnValue({
        sort: sortMock,
      });

      (User.find as jest.Mock) = jest.fn().mockReturnValue({
        select: selectMock,
      });

      const result = await UserService.getAllUsers();

      expect(User.find).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalledWith('-auth.password');
      expect(sortMock).toHaveBeenCalledWith({ registerDate: -1 });
      expect(result).toEqual(mockUsers);
    });
  });
});
