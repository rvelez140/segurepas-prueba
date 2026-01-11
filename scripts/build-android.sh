#!/bin/bash

#===============================================================================
# SecurePass Mobile - Script de Compilacion Android
#===============================================================================
# Compila la aplicacion Android de forma LOCAL y GRATUITA
# No requiere cuenta de Expo ni EAS Build
#
# Requisitos:
# - Node.js 20+
# - Android Studio instalado
# - ANDROID_HOME configurado
#
# Uso: ./scripts/build-android.sh [debug|release]
#===============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorio del proyecto
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$PROJECT_ROOT/apps/mobile"

# Tipo de build (debug o release)
BUILD_TYPE="${1:-release}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SecurePass - Compilacion Android Local               ║${NC}"
echo -e "${BLUE}║                    100% GRATUITO                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar Android Studio / SDK
echo -e "${YELLOW}[1/6] Verificando Android SDK...${NC}"
if [ -z "$ANDROID_HOME" ]; then
    # Intentar detectar automaticamente
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "/usr/local/android-sdk" ]; then
        export ANDROID_HOME="/usr/local/android-sdk"
    else
        echo -e "${RED}Error: ANDROID_HOME no configurado${NC}"
        echo "Instala Android Studio desde: https://developer.android.com/studio"
        echo "Luego configura: export ANDROID_HOME=\$HOME/Android/Sdk"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Android SDK encontrado: $ANDROID_HOME${NC}"

# Verificar Java
echo -e "${YELLOW}[2/6] Verificando Java...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java no instalado${NC}"
    echo "Android Studio incluye Java, asegurate de que este en el PATH"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✓ Java encontrado: $JAVA_VERSION${NC}"

# Ir al directorio mobile
cd "$MOBILE_DIR"

# Instalar dependencias
echo -e "${YELLOW}[3/6] Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Generar proyecto nativo si no existe
echo -e "${YELLOW}[4/6] Generando proyecto Android nativo...${NC}"
if [ ! -d "android" ]; then
    npx expo prebuild --platform android --clean
    echo -e "${GREEN}✓ Proyecto Android generado${NC}"
else
    echo -e "${GREEN}✓ Proyecto Android ya existe${NC}"
fi

# Compilar APK
echo -e "${YELLOW}[5/6] Compilando APK ($BUILD_TYPE)...${NC}"
cd android

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
else
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
fi

cd ..

# Verificar que el APK se genero
echo -e "${YELLOW}[6/6] Verificando APK generado...${NC}"
if [ -f "android/$APK_PATH" ]; then
    APK_SIZE=$(du -h "android/$APK_PATH" | cut -f1)
    APK_FULL_PATH="$MOBILE_DIR/android/$APK_PATH"

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              APK GENERADO EXITOSAMENTE                       ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Tipo:     ${NC}$BUILD_TYPE"
    echo -e "${BLUE}Tamano:   ${NC}$APK_SIZE"
    echo -e "${BLUE}Ubicacion:${NC}"
    echo "$APK_FULL_PATH"
    echo ""

    # Copiar a carpeta de releases
    mkdir -p "$PROJECT_ROOT/releases/android"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    RELEASE_NAME="SecurePass-$BUILD_TYPE-$TIMESTAMP.apk"
    cp "android/$APK_PATH" "$PROJECT_ROOT/releases/android/$RELEASE_NAME"

    echo -e "${GREEN}✓ APK copiado a: releases/android/$RELEASE_NAME${NC}"
    echo ""
    echo -e "${YELLOW}Para instalar en tu dispositivo:${NC}"
    echo "  adb install $APK_FULL_PATH"
    echo ""
    echo -e "${YELLOW}O transfiere el archivo APK a tu telefono e instalalo manualmente.${NC}"
else
    echo -e "${RED}Error: No se pudo generar el APK${NC}"
    exit 1
fi
