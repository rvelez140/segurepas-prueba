import { User } from '../models/User';

/**
 * Inicializa el usuario administrador por defecto
 * Credenciales: admin@solucionesrv.net / Admin12345! o admin / Admin12345!
 *
 * Este script se ejecuta al iniciar la aplicación y crea un usuario admin
 * si no existe ninguno en la base de datos.
 *
 * Soporta login con email O username.
 */
export async function initAdminUser(): Promise<void> {
  try {
    // Configuración del usuario admin por defecto
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@securepass.com';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';

    // Verificar si ya existe un usuario admin por email o username
    const existingAdmin = await User.findOne({
      $or: [
        { 'auth.email': ADMIN_EMAIL },
        { 'auth.username': ADMIN_USERNAME }
      ]
    });

    if (existingAdmin) {
      // Verificar si necesita actualización del username
      if (!existingAdmin.auth.username && ADMIN_USERNAME) {
        existingAdmin.auth.username = ADMIN_USERNAME;
        await existingAdmin.save();
        console.log('✓ Usuario administrador actualizado con username:', ADMIN_USERNAME);
      } else {
        console.log('✓ Usuario administrador ya existe');
      }
      return;
    }

    // Crear el usuario administrador con email Y username
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

    console.log('✓ Usuario administrador creado exitosamente');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('  ⚠️  IMPORTANTE: Cambie estas credenciales después del primer inicio de sesión');
  } catch (error: any) {
    console.error('✗ Error al crear usuario administrador:', error.message);
    // No lanzamos el error para que la aplicación continúe iniciando
  }
}
