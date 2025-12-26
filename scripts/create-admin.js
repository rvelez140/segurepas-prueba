#!/usr/bin/env node

/**
 * Script para crear usuario administrador
 * Ejecutar desde el contenedor API: docker exec securepass-api node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuración de MongoDB desde variables de entorno
const MONGO_USER = process.env.MONGO_ROOT_USER || 'admin';
const MONGO_PASSWORD = process.env.MONGO_ROOT_PASSWORD;
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_DB = process.env.MONGO_DB || 'securepass';

const mongoUri = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

console.log('🔄 Conectando a MongoDB...');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✓ Conectado a MongoDB');

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // Eliminar usuario admin si existe
  await usersCollection.deleteOne({ email: "admin@securepass.com" });
  await usersCollection.deleteOne({ "auth.email": "admin@securepass.com" });

  console.log('🔄 Creando usuario administrador...');

  // Crear usuario con la estructura correcta
  const newUser = {
    auth: {
      email: "admin@securepass.com",
      password: "$2b$10$FPkn/EIg2q/.JDhcF6HE/Ol5l78MHtj9MH/bnBuq5wGYFL5/jsQay"
    },
    name: "Administrador",
    role: "admin",
    registerDate: new Date(),
    updateDate: new Date(),
    lastAccess: new Date()
  };

  const result = await usersCollection.insertOne(newUser);

  console.log('✓ Usuario administrador creado exitosamente!');
  console.log('');
  console.log('════════════════════════════════════');
  console.log('  Credenciales de acceso:');
  console.log('════════════════════════════════════');
  console.log('  Email:    admin@securepass.com');
  console.log('  Password: admin123');
  console.log('════════════════════════════════════');
  console.log('');

  // Verificar el usuario creado
  const user = await usersCollection.findOne(
    { "auth.email": "admin@securepass.com" },
    { projection: { "auth.password": 0 } }
  );
  console.log('Usuario creado:', JSON.stringify(user, null, 2));

  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
