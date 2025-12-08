/**
 * Script de migración para convertir datos existentes a multi-tenant
 *
 * Este script:
 * 1. Crea una empresa por defecto
 * 2. Asigna todos los usuarios existentes a esa empresa
 * 3. Asigna todas las visitas existentes a esa empresa
 *
 * IMPORTANTE: Ejecutar ANTES de activar el middleware de tenant
 *
 * Uso:
 *   npm run migrate
 *
 * O directamente:
 *   ts-node src/scripts/migrate-to-multitenant.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Visit } from '../models/Visit';
import { ICompany } from '../interfaces/ICompany';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Configuración de la empresa por defecto
const DEFAULT_COMPANY = {
  name: process.env.DEFAULT_COMPANY_NAME || 'Mi Empresa',
  subdomain: process.env.DEFAULT_COMPANY_SUBDOMAIN || 'default',
  contact: {
    email: process.env.DEFAULT_COMPANY_EMAIL || 'admin@empresa.com',
    phone: process.env.DEFAULT_COMPANY_PHONE || '+1809-000-0000',
  },
  settings: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    allowedDomains: [],
  },
  subscription: {
    plan: 'free' as const,
    maxUsers: parseInt(process.env.MAX_USERS_FREE || '10'),
    maxResidents: parseInt(process.env.MAX_RESIDENTS_FREE || '50'),
    startDate: new Date(),
    isActive: true,
  },
};

async function migrateToMultiTenant() {
  try {
    console.log('🚀 Iniciando migración a multi-tenant...\n');

    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar si ya existe una empresa
    console.log('🔍 Verificando empresas existentes...');
    const existingCompany = await Company.findOne({ subdomain: DEFAULT_COMPANY.subdomain });

    let company: ICompany;

    if (existingCompany) {
      console.log(`⚠️  Ya existe una empresa con subdominio "${DEFAULT_COMPANY.subdomain}"`);
      console.log('📝 Usando empresa existente...');
      company = existingCompany;
    } else {
      console.log('📝 Creando empresa por defecto...');
      company = await Company.create(DEFAULT_COMPANY);
      console.log(`✅ Empresa creada: ${company.name} (${company.subdomain})\n`);
    }

    // Contar usuarios sin empresa
    console.log('👥 Verificando usuarios...');
    const usersWithoutCompany = await User.countDocuments({ company: { $exists: false } });
    console.log(`   - Usuarios sin empresa: ${usersWithoutCompany}`);

    if (usersWithoutCompany > 0) {
      console.log('📝 Asignando usuarios a la empresa...');
      const updateUsersResult = await User.updateMany(
        { company: { $exists: false } },
        { $set: { company: company._id } }
      );
      console.log(`✅ ${updateUsersResult.modifiedCount} usuarios actualizados\n`);
    } else {
      console.log('✅ Todos los usuarios ya tienen empresa asignada\n');
    }

    // Contar visitas sin empresa
    console.log('📋 Verificando visitas...');
    const visitsWithoutCompany = await Visit.countDocuments({ company: { $exists: false } });
    console.log(`   - Visitas sin empresa: ${visitsWithoutCompany}`);

    if (visitsWithoutCompany > 0) {
      console.log('📝 Asignando visitas a la empresa...');
      const updateVisitsResult = await Visit.updateMany(
        { company: { $exists: false } },
        { $set: { company: company._id } }
      );
      console.log(`✅ ${updateVisitsResult.modifiedCount} visitas actualizadas\n`);
    } else {
      console.log('✅ Todas las visitas ya tienen empresa asignada\n');
    }

    // Resumen final
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log('═══════════════════════════════════════');

    const totalUsers = await User.countDocuments({ company: company._id });
    const totalVisits = await Visit.countDocuments({ company: company._id });

    console.log(`   Empresa: ${company.name}`);
    console.log(`   Subdominio: ${company.subdomain}`);
    console.log(`   Total usuarios: ${totalUsers}`);
    console.log(`   Total visitas: ${totalVisits}`);
    console.log(`   Plan: ${company.subscription.plan}`);
    console.log(`   Estado: ${company.subscription.isActive ? 'Activa' : 'Inactiva'}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Migración completada exitosamente!\n');
    console.log('💡 Próximos pasos:');
    console.log('   1. Verificar que todos los datos se migraron correctamente');
    console.log('   2. Activar el middleware de tenant en las rutas');
    console.log('   3. Reiniciar la aplicación\n');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateToMultiTenant();
}

export default migrateToMultiTenant;
