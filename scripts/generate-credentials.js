#!/usr/bin/env node

/**
 * Script para generar credenciales seguras para SecurePass
 *
 * Uso: node scripts/generate-credentials.js
 *
 * Este script genera:
 * - JWT_SECRET (64 caracteres aleatorios)
 * - ADMIN_PASSWORD (24 caracteres alfanuméricos seguros)
 * - MONGO_ROOT_PASSWORD (32 caracteres seguros)
 */

const crypto = require('crypto');

/**
 * Genera una cadena aleatoria segura
 * @param {number} length - Longitud de la cadena
 * @param {string} charset - Conjunto de caracteres a usar
 * @returns {string} Cadena aleatoria
 */
function generateSecureString(length, charset = 'alphanumeric') {
  const charsets = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alphanumericSymbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+',
    hex: '0123456789abcdef',
  };

  const chars = charsets[charset] || charsets.alphanumeric;
  const charsLength = chars.length;
  let result = '';

  // Usar crypto.randomBytes para mayor seguridad
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % charsLength];
  }

  return result;
}

/**
 * Genera una contraseña segura con requisitos específicos
 * @param {number} length - Longitud de la contraseña
 * @returns {string} Contraseña segura
 */
function generateSecurePassword(length = 24) {
  // Asegurar que incluya al menos: mayúscula, minúscula, número y símbolo
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+';

  let password = '';

  // Agregar al menos uno de cada tipo
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];

  // Rellenar el resto
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Mezclar los caracteres
  return password.split('').sort(() => crypto.randomInt(0, 2) - 0.5).join('');
}

/**
 * Función principal
 */
function main() {
  console.log('🔐 Generador de Credenciales Seguras - SecurePass\n');
  console.log('═'.repeat(70));

  // Generar credenciales
  const jwtSecret = generateSecureString(64, 'alphanumericSymbols');
  const adminPassword = generateSecurePassword(24);
  const mongoPassword = generateSecurePassword(32);
  const apiKey = generateSecureString(48, 'hex');

  console.log('\n📋 CREDENCIALES GENERADAS:\n');

  console.log('# JWT Secret (para .env)');
  console.log(`JWT_SECRET=${jwtSecret}\n`);

  console.log('# Admin Password (para .env)');
  console.log(`ADMIN_PASSWORD=${adminPassword}\n`);

  console.log('# MongoDB Root Password (para .env)');
  console.log(`MONGO_ROOT_PASSWORD=${mongoPassword}\n`);

  console.log('# API Key genérica (opcional)');
  console.log(`API_KEY=${apiKey}\n`);

  console.log('═'.repeat(70));
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   1. Copie estas credenciales a su archivo .env');
  console.log('   2. Guarde una copia segura de estas credenciales');
  console.log('   3. NO comparta estas credenciales por medios inseguros');
  console.log('   4. Cambie las credenciales en producción regularmente\n');

  console.log('💡 TIP: Puede generar nuevas credenciales ejecutando este script de nuevo');
  console.log('   pero asegúrese de actualizar todos los sistemas que las usen.\n');
}

// Ejecutar el script
main();
