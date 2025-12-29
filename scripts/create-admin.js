#!/usr/bin/env node

/**
 * Script para crear un usuario administrador en SecurePass
 *
 * Uso:
 *   Dentro del contenedor:
 *     node scripts/create-admin.js
 *
 *   O con variables de entorno personalizadas:
 *     ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password123 node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuración por defecto
const DEFAULT_ADMIN_EMAIL = 'admin@solucionesrv.net';
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'Admin12345!';
const DEFAULT_ADMIN_NAME = 'Administrador';

// Leer configuración desde variables de entorno
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;

// MongoDB URI desde variable de entorno o usar localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/securepass';

// Esquema de Usuario (versión simplificada del modelo)
const userSchema = new mongoose.Schema(
  {
    auth: {
      email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
      },
      username: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    registerDate: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['residente', 'guardia', 'admin'],
      required: true,
    },
    lastAccess: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB\n');

    // Verificar si ya existe un admin con ese email o username
    console.log(`🔍 Verificando si existe usuario con email: ${ADMIN_EMAIL} o username: ${ADMIN_USERNAME}`);
    const existingUser = await User.findOne({
      $or: [
        { 'auth.email': ADMIN_EMAIL },
        { 'auth.username': ADMIN_USERNAME }
      ]
    });

    if (existingUser) {
      console.log('\n⚠️  Ya existe un usuario con ese email');
      console.log(`   Nombre: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Registrado: ${existingUser.registerDate}`);

      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('\n¿Desea actualizar la contraseña de este usuario? (si/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'si' || answer.toLowerCase() === 's' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Hash de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Actualizar usuario
        existingUser.auth.password = hashedPassword;
        existingUser.auth.email = ADMIN_EMAIL;
        existingUser.auth.username = ADMIN_USERNAME;
        existingUser.updateDate = new Date();
        existingUser.role = 'admin';
        existingUser.lastAccess = new Date();
        await existingUser.save();

        console.log('\n✅ Usuario actualizado exitosamente!');
        console.log('\n📋 Credenciales:');
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Username: ${ADMIN_USERNAME}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');
      } else {
        console.log('\n❌ Operación cancelada');
      }
    } else {
      console.log('✅ Email disponible\n');

      // Hash de la contraseña
      console.log('🔐 Hasheando contraseña...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      console.log('✅ Contraseña hasheada\n');

      // Crear nuevo admin
      console.log('👤 Creando usuario administrador...');
      const admin = new User({
        auth: {
          email: ADMIN_EMAIL,
          username: ADMIN_USERNAME,
          password: hashedPassword,
        },
        name: ADMIN_NAME,
        role: 'admin',
        registerDate: new Date(),
        updateDate: new Date(),
        lastAccess: new Date(),
      });

      await admin.save();
      console.log('✅ Usuario administrador creado exitosamente!\n');

      console.log('📋 Credenciales de acceso:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro');
      console.log('⚠️  Se recomienda cambiar la contraseña después del primer login\n');
    }

  } catch (error) {
    console.error('\n❌ Error al crear administrador:', error.message);
    if (error.code === 11000) {
      console.error('   El email ya está registrado en la base de datos');
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la función
createAdmin();
