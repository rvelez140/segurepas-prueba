#!/bin/bash

#######################################
# Script para corregir usuario admin
# Ejecutar desde el directorio del proyecto
#######################################

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Corrigiendo usuario admin${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: Archivo .env no encontrado${NC}"
    echo "Ejecuta este script desde el directorio del proyecto (/opt/securepass)"
    exit 1
fi

# Obtener la contraseña de MongoDB del archivo .env
MONGO_PASSWORD=$(grep MONGO_ROOT_PASSWORD .env | cut -d= -f2)

if [ -z "$MONGO_PASSWORD" ]; then
    echo -e "${RED}Error: No se encontró MONGO_ROOT_PASSWORD en .env${NC}"
    exit 1
fi

echo -e "${YELLOW}Conectando a MongoDB...${NC}"

# Ejecutar el script de MongoDB
docker exec -i securepass-mongodb mongosh -u admin -p "$MONGO_PASSWORD" securepass <<'EOF'
// Eliminar usuario admin si existe
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
print("\n✓ Usuario admin creado correctamente");
print("\nCredenciales de acceso:");
print("  Email: admin@securepass.com");
print("  Password: secret");
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Usuario admin corregido${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Ahora puedes iniciar sesión con:${NC}"
echo -e "  Email: ${GREEN}admin@securepass.com${NC}"
echo -e "  Password: ${GREEN}secret${NC}"
echo ""
