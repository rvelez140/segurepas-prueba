// Script para corregir la estructura del usuario admin en MongoDB
// Ejecutar con: docker exec -i securepass-mongodb mongosh -u admin -p <PASSWORD> securepass < fix-admin-user.js

// Primero, eliminar el usuario admin si existe con estructura incorrecta
db.users.deleteOne({ email: "admin@securepass.com" });
db.users.deleteOne({ "auth.email": "admin@securepass.com" });

// Crear usuario admin con la estructura correcta
db.users.insertOne({
  auth: {
    email: "admin@securepass.com",
    password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
  },
  name: "Administrador",
  role: "admin",
  registerDate: new Date(),
  updateDate: new Date(),
  lastAccess: new Date()
});

// Verificar que se creó correctamente
print("\n✓ Usuario admin creado/actualizado correctamente");
print("\nCredenciales:");
print("Email: admin@securepass.com");
print("Password: secret");
print("\nVerificando usuario:");
db.users.findOne({ "auth.email": "admin@securepass.com" }, { "auth.password": 0 });
