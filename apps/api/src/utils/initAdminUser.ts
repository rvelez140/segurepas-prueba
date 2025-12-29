import { User } from '../models/User';

/**
 * Inicializa el usuario administrador por defecto
 *
 * Este script se ejecuta al iniciar la aplicación y crea un usuario admin
 * si no existe ninguno en la base de datos.
 *
 * SEGURIDAD: Se requiere configurar ADMIN_PASSWORD en .env
 * Use: node scripts/generate-credentials.js para generar credenciales seguras
 */
export async function initAdminUser(): Promise<void> {
  try {
    // Configuración del usuario admin por defecto
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@securepass.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';

    // Validar que se haya configurado una contraseña segura
    if (!ADMIN_PASSWORD) {
      throw new Error(
        '⚠️  ADMIN_PASSWORD no está configurado en .env\n' +
        '   Por seguridad, debe configurar una contraseña segura.\n' +
        '   Ejecute: node scripts/generate-credentials.js'
      );
    }

    // Advertir si se usa una contraseña débil
    if (ADMIN_PASSWORD === 'admin' || ADMIN_PASSWORD.length < 12) {
      console.warn('\n⚠️  ¡ADVERTENCIA DE SEGURIDAD! ⚠️');
      console.warn('   La contraseña de admin es DÉBIL o es la contraseña por defecto');
      console.warn('   Genere credenciales seguras con: node scripts/generate-credentials.js');
      console.warn('   Esto representa un RIESGO DE SEGURIDAD CRÍTICO en producción\n');
    }

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({
      'auth.email': ADMIN_EMAIL
    });

    if (existingAdmin) {
      console.log('✓ Usuario administrador ya existe');
      return;
    }

    // Crear el usuario administrador
    const adminUser = new User({
      auth: {
        email: ADMIN_EMAIL,
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

    console.log('✓ Usuario administrador creado exitosamente');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Contraseña: ${'*'.repeat(ADMIN_PASSWORD.length)} (oculta por seguridad)`);
    console.log('  ⚠️  IMPORTANTE: Cambie estas credenciales después del primer inicio de sesión');
    console.log('  ⚠️  Configure 2FA para mayor seguridad');
  } catch (error: any) {
    console.error('✗ Error al crear usuario administrador:', error.message);
    // No lanzamos el error para que la aplicación continúe iniciando
  }
}
