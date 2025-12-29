import { User } from '../models/User';

/**
 * Inicializa el usuario administrador por defecto
 * Credenciales: admin / admin
 *
 * Este script se ejecuta al iniciar la aplicación y crea un usuario admin
 * si no existe ninguno en la base de datos.
 */
export async function initAdminUser(): Promise<void> {
  try {
    // Configuración del usuario admin por defecto
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@securepass.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador';

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
    console.log(`  Contraseña: ${ADMIN_PASSWORD}`);
    console.log('  ⚠️  IMPORTANTE: Cambie estas credenciales después del primer inicio de sesión');
  } catch (error: any) {
    console.error('✗ Error al crear usuario administrador:', error.message);
    // No lanzamos el error para que la aplicación continúe iniciando
  }
}
