import mongoose from 'mongoose';

/**
 * Genera un ObjectId mock válido
 */
export const mockObjectId = (id?: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Mock de usuario para tests
 */
export const mockUser = {
  _id: mockObjectId(),
  name: 'Test User',
  auth: {
    email: 'test@example.com',
    password: 'hashedpassword123',
  },
  role: 'residente' as const,
  apartment: 'A101',
  tel: '555-1234',
  createdAt: new Date(),
  save: jest.fn(),
  comparePassword: jest.fn(),
};

/**
 * Mock de visita para tests
 */
export const mockVisit = {
  _id: mockObjectId(),
  visitorName: 'Juan Pérez',
  visitorDocument: '12345678',
  residentId: mockObjectId(),
  visitReason: 'Visita social',
  vehiclePlate: 'ABC123',
  status: 'autorizada' as const,
  createdAt: new Date(),
  save: jest.fn(),
};

/**
 * Mock de dispositivo para tests
 */
export const mockDevice = {
  _id: mockObjectId(),
  userId: mockObjectId(),
  deviceName: 'Test Device',
  deviceType: 'web' as const,
  isActive: true,
  lastActive: new Date(),
  save: jest.fn(),
  deactivate: jest.fn(),
};

/**
 * Mock de sesión QR para tests
 */
export const mockQRSession = {
  _id: mockObjectId(),
  sessionId: 'test-session-id',
  qrCode: 'data:image/png;base64,test',
  status: 'pending' as const,
  expiresAt: new Date(Date.now() + 300000),
  save: jest.fn(),
  markAsScanned: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  isValid: jest.fn().mockReturnValue(true),
};

/**
 * Mock de Magic Link para tests
 */
export const mockMagicLink = {
  _id: mockObjectId(),
  userId: mockObjectId(),
  token: 'test-magic-token',
  isUsed: false,
  expiresAt: new Date(Date.now() + 900000),
  save: jest.fn(),
  markAsUsed: jest.fn(),
  isValid: jest.fn().mockReturnValue(true),
};
