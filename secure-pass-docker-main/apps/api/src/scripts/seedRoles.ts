/**
 * Script para inicializar los roles y permisos del sistema
 *
 * Ejecutar con: npx ts-node src/scripts/seedRoles.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { PermissionService } from '../services/PermissionService';
import { RoleService } from '../services/RoleService';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedRolesAndPermissions() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n📝 Inicializando permisos del sistema...');
    await PermissionService.initializeSystemPermissions();
    console.log('✅ Permisos inicializados');

    console.log('\n👥 Inicializando roles del sistema...');
    await RoleService.initializeSystemRoles();
    console.log('✅ Roles inicializados');

    console.log('\n✨ ¡Sistema de roles y permisos configurado exitosamente!');
    console.log('\nRoles creados:');
    console.log('  • Administrador (admin) - Acceso completo');
    console.log('  • Técnico (tecnico) - Gestión de usuarios, visitas y reportes');
    console.log('  • Residente (residente) - Crear y gestionar sus autorizaciones');
    console.log('  • Guardia (guardia) - Validar visitas y registrar entradas/salidas');

    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al inicializar roles y permisos:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedRolesAndPermissions();
