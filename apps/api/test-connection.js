require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';

console.log('🔍 Probando conexión a MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

const mongooseOptions = {
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('');
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log('✓ Se ha realizado la conexión con MongoDB');
    const isAtlas = MONGODB_URI.includes('mongodb+srv://');
    const isExternal = MONGODB_URI.includes('asolutions.digital');
    console.log(
      `✓ Tipo de conexión: ${isExternal ? 'MongoDB Externo (asolutions.digital)' : isAtlas ? 'MongoDB Atlas (Externa)' : 'MongoDB Local'}`
    );
    console.log(`✓ Base de datos: ${mongoose.connection.db.databaseName}`);
    console.log(`✓ Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'No conectado'}`);
    console.log('');
    process.exit(0);
  })
  .catch((err) => {
    console.log('');
    console.log('❌ ERROR AL CONECTAR A MONGODB');
    console.error('✗ Error:', err.message);
    console.error('');
    console.log('📋 Soluciones posibles:');
    console.log('  1. Verifica que el servidor MongoDB esté ejecutándose');
    console.log('  2. Verifica que la URI esté correctamente configurada en .env');
    console.log('  3. Verifica que el usuario y contraseña sean correctos');
    console.log('  4. Verifica que la IP esté en la lista blanca (si es MongoDB Atlas)');
    console.log('');
    process.exit(1);
  });
