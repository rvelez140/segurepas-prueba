# Assets

Coloca aquí los iconos de la aplicación:

## Iconos Requeridos

### Para Windows
- **icon.ico** - Icono en formato ICO
  - Tamaño recomendado: 256x256 píxeles
  - Puede contener múltiples resoluciones

### Para Linux
- **icon.png** - Icono en formato PNG
  - Tamaño recomendado: 512x512 píxeles
  - Fondo transparente

## Generación de Iconos

Puedes usar herramientas online como:
- https://www.icoconverter.com/ (para generar .ico)
- https://www.favicon-generator.org/ (para generar múltiples tamaños)

O herramientas de línea de comandos:
```bash
# Convertir PNG a ICO usando ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

## Logo de SecurePass

El logo debe reflejar el tema de seguridad y control de acceso.
Sugerencias:
- Usar colores profesionales (azul, verde oscuro)
- Incluir elementos de seguridad (candado, escudo, QR)
- Mantener diseño simple y reconocible
