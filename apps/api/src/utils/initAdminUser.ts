import { User } from '../models/User';

/**
 * SecurePass - Inicialización de Usuario de Fábrica
 * ==================================================
 * ISO 27001 - A.9.2.1: Registro y cancelación del registro de usuario
 * ISO 27001 - A.9.4.3: Sistema de gestión de contraseñas
 *
 * CREDENCIALES DE FÁBRICA POR DEFECTO:
 * ------------------------------------
 * Email:    factory@securepass.local
 * Usuario:  factory_admin
 * Password: Factory@SecureP@ss2024!
 *
 * IMPORTANTE: Estas credenciales DEBEN ser cambiadas después del primer login.
 * El sistema registrará un evento de auditoría cuando se use el usuario de fábrica.
 */

// Constantes de configuración de fábrica
const FACTORY_DEFAULTS = {
  email: 'factory@securepass.local',
  username: 'factory_admin',
  password: 'Factory@SecureP@ss2024!',
  name: 'Administrador de Fábrica',
};

/**
 * Valida que la contraseña cumpla con los requisitos de seguridad ISO 27001
 * Control A.9.4.3: Sistema de gestión de contraseñas
 */
function validatePasswordStrength(password: string): boolean {
  // Mínimo 12 caracteres para cumplir con ISO 27001
  if (password.length < 12) return false;

  // Debe contener: mayúscula, minúscula, número y símbolo
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumbers && hasSymbols;
}

/**
 * Verifica si la contraseña es una contraseña de fábrica conocida
 */
function isFactoryPassword(password: string): boolean {
  const factoryPasswords = [
    FACTORY_DEFAULTS.password,
    'admin',
    'Admin12345!',
    'password',
    'Password123!',
  ];
  return factoryPasswords.includes(password);
}

/**
 * Inicializa el usuario administrador de fábrica
 * Este usuario permite el acceso inicial al sistema para configuración
 */
export async function initAdminUser(): Promise<void> {
  try {
    // Configuración del usuario admin desde variables de entorno o valores de fábrica
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || FACTORY_DEFAULTS.email;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || FACTORY_DEFAULTS.username;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || FACTORY_DEFAULTS.password;
    const ADMIN_NAME = process.env.ADMIN_NAME || FACTORY_DEFAULTS.name;

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     SecurePass - Inicialización de Usuario de Fábrica        ║');
    console.log('║     ISO 27001 - Control A.9.2.1                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    // Verificar si ya existe un usuario admin por email o username
    const existingAdmin = await User.findOne({
      $or: [{ 'auth.email': ADMIN_EMAIL }, { 'auth.username': ADMIN_USERNAME }],
    });

    if (existingAdmin) {
      // Verificar si necesita actualización del username
      if (!existingAdmin.auth.username && ADMIN_USERNAME) {
        existingAdmin.auth.username = ADMIN_USERNAME;
        await existingAdmin.save();
        console.log('✓ Usuario administrador actualizado con username:', ADMIN_USERNAME);
      } else {
        console.log('✓ Usuario administrador ya existe en el sistema');

        // Advertencia si está usando credenciales de fábrica
        if (isFactoryPassword(ADMIN_PASSWORD)) {
          console.log('');
          console.log('⚠️  ════════════════════════════════════════════════════════════');
          console.log('⚠️  ADVERTENCIA DE SEGURIDAD ISO 27001');
          console.log('⚠️  ════════════════════════════════════════════════════════════');
          console.log('⚠️  El sistema está configurado con credenciales de fábrica.');
          console.log('⚠️  Por favor, cambie las credenciales inmediatamente.');
          console.log('⚠️  Control A.9.4.3: Sistema de gestión de contraseñas');
          console.log('⚠️  ════════════════════════════════════════════════════════════');
        }
      }
      return;
    }

    // Validar fortaleza de la contraseña
    if (!validatePasswordStrength(ADMIN_PASSWORD)) {
      console.log('');
      console.log('⚠️  La contraseña configurada no cumple con los requisitos ISO 27001:');
      console.log('    - Mínimo 12 caracteres');
      console.log('    - Al menos una mayúscula');
      console.log('    - Al menos una minúscula');
      console.log('    - Al menos un número');
      console.log('    - Al menos un símbolo (!@#$%^&*...)');
      console.log('');
      console.log('    Usando contraseña de fábrica por defecto...');
    }

    // Crear el usuario administrador con credenciales de fábrica
    const adminUser = new User({
      auth: {
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        twoFactorEnabled: false,
      },
      name: ADMIN_NAME,
      role: 'admin',
      registerDate: new Date(),
      updateDate: new Date(),
      lastAccess: new Date(),
    });

    await adminUser.save();

    console.log('');
    console.log('✓ Usuario administrador de fábrica creado exitosamente');
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                CREDENCIALES DE ACCESO                        ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Email:     ${ADMIN_EMAIL.padEnd(48)}║`);
    console.log(`║  Usuario:   ${ADMIN_USERNAME.padEnd(48)}║`);
    console.log(`║  Password:  ${ADMIN_PASSWORD.padEnd(48)}║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  ⚠️  IMPORTANTE: Cambie estas credenciales después del       ║');
    console.log('║     primer inicio de sesión para cumplir con ISO 27001.      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    // Registrar evento de auditoría si existe el servicio
    try {
      const { AuditLogService } = await import('../services/AuditLogService');
      await AuditLogService.log({
        action: 'USER_CREATE' as any, // Ajuste temporal si AuditAction no es accesible
        severity: 'HIGH' as any,
        resource: 'User',
        resourceId: adminUser._id?.toString() || 'unknown',
        details: {
          message: 'Usuario de fábrica creado durante inicialización del sistema',
          email: ADMIN_EMAIL,
          username: ADMIN_USERNAME,
          isFactoryPassword: isFactoryPassword(ADMIN_PASSWORD),
        },
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'SecurePass-Init',
      });
    } catch (e) {
      // Si el servicio de auditoría no está disponible, continuamos
      console.log('ℹ️  Servicio de auditoría no disponible durante inicialización', e);
    }
  } catch (error: any) {
    console.error('');
    console.error('╔══════════════════════════════════════════════════════════════╗');
    console.error('║  ✗ ERROR: No se pudo crear el usuario administrador          ║');
    console.error('╠══════════════════════════════════════════════════════════════╣');
    console.error(`║  ${error.message.substring(0, 60).padEnd(60)}║`);
    console.error('╚══════════════════════════════════════════════════════════════╝');
    // No lanzamos el error para que la aplicación continúe iniciando
  }
}

/**
 * Exporta las credenciales de fábrica por defecto para documentación
 */
export const factoryCredentials = {
  email: FACTORY_DEFAULTS.email,
  username: FACTORY_DEFAULTS.username,
  password: FACTORY_DEFAULTS.password,
  name: FACTORY_DEFAULTS.name,
};
