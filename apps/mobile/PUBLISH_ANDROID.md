# SecurePass - Guia de Publicacion en Google Play Store

## Requisitos Previos

1. **Cuenta de Google Play Console** - $25 USD (pago unico)
   - Registrate en: https://play.google.com/console

2. **APK o AAB firmado** (ver `android-signing.md`)

3. **Assets graficos** para la tienda

---

## Paso 1: Preparar Assets Graficos

Necesitaras los siguientes archivos:

### Icono de la App
- **Tamano**: 512x512 px
- **Formato**: PNG (32-bit, con alfa)
- **Archivo**: `assets/play-store/icon-512.png`

### Imagen Destacada (Feature Graphic)
- **Tamano**: 1024x500 px
- **Formato**: PNG o JPEG
- **Archivo**: `assets/play-store/feature-graphic.png`

### Capturas de Pantalla (minimo 2)

**Para telefono:**
- Tamano minimo: 320px
- Tamano maximo: 3840px
- Relacion de aspecto: entre 16:9 y 9:16
- Formato: PNG o JPEG

**Recomendado:**
- 1080x1920 px (Full HD vertical)
- Al menos 4-8 capturas

### Video Promocional (Opcional)
- URL de YouTube
- Duracion: 30 segundos a 2 minutos

---

## Paso 2: Crear la App en Play Console

1. Ir a https://play.google.com/console
2. Click en "Crear aplicacion"
3. Completar:
   - **Nombre de la app**: SecurePass
   - **Idioma predeterminado**: Espanol
   - **Tipo de aplicacion**: App
   - **Gratis o de pago**: Segun tu modelo

---

## Paso 3: Configurar la Ficha de Play Store

### Detalles de la App

**Nombre corto** (30 caracteres max):
```
SecurePass - Control de Acceso
```

**Descripcion breve** (80 caracteres max):
```
Sistema de control de acceso y gestion de visitantes para residencias
```

**Descripcion completa** (4000 caracteres max):
```
SecurePass es la solucion integral para el control de acceso en conjuntos residenciales, edificios y urbanizaciones.

CARACTERISTICAS PRINCIPALES:

🔐 Control de Visitantes
- Registro rapido de visitantes con foto
- Generacion de codigos QR unicos
- Autorizacion en tiempo real por residentes
- Historial completo de visitas

📱 Para Residentes
- Autoriza visitantes desde tu celular
- Recibe notificaciones instantaneas
- Consulta historial de visitas
- Gestiona visitantes recurrentes

👮 Para Guardias
- Escaneo rapido de QR
- Registro de entrada/salida
- Verificacion de identidad
- Alertas de seguridad

🚗 Gestion de Parqueaderos
- Control de espacios disponibles
- Asignacion automatica
- Registro de vehiculos

SEGURIDAD:
- Encriptacion de datos
- Autenticacion segura
- Cumplimiento ISO 27001
- Respaldos automaticos

Descarga SecurePass y moderniza la seguridad de tu residencia.
```

### Categoria
- **Categoria**: Herramientas o Productividad
- **Etiquetas**: seguridad, control de acceso, visitantes, residencial

---

## Paso 4: Subir el APK/AAB

1. Ir a "Produccion" > "Crear nueva version"
2. Subir el archivo AAB (preferido) o APK
3. Agregar notas de la version:

```
Version 1.0.0

- Lanzamiento inicial
- Registro y autorizacion de visitantes
- Escaneo de codigos QR
- Notificaciones en tiempo real
- Historial de visitas
- Gestion de parqueaderos
```

---

## Paso 5: Clasificacion de Contenido

1. Ir a "Politica" > "Clasificacion del contenido"
2. Completar el cuestionario IARC
3. Para SecurePass, respuestas tipicas:
   - Violencia: No
   - Contenido sexual: No
   - Lenguaje: No
   - Sustancias controladas: No
   - Contenido generado por usuarios: No (o Si si hay chat)

Resultado esperado: **PEGI 3 / Everyone**

---

## Paso 6: Configuracion de Privacidad

### Politica de Privacidad
Debes tener una URL con tu politica de privacidad:
- Ejemplo: `https://securepass.com/privacy`

### Declaracion de Datos
Declara que datos recopila tu app:
- Nombre y email (para registro)
- Fotos (de visitantes)
- Ubicacion (opcional)
- Identificadores del dispositivo

---

## Paso 7: Precio y Distribucion

1. Seleccionar paises de distribucion
2. Elegir modelo:
   - Gratis con compras in-app
   - Gratis con suscripcion
   - Pago unico
   - Gratis completo

---

## Paso 8: Enviar para Revision

1. Completar todos los pasos anteriores
2. Click en "Enviar para revision"
3. Esperar 1-7 dias habiles

---

## Checklist Pre-Publicacion

```
[ ] APK/AAB firmado con keystore de produccion
[ ] Icono 512x512
[ ] Feature graphic 1024x500
[ ] Minimo 2 capturas de pantalla
[ ] Descripcion corta y larga
[ ] Clasificacion de contenido completada
[ ] Politica de privacidad publicada
[ ] Declaracion de datos completada
[ ] Paises seleccionados
[ ] Precio configurado
```

---

## Actualizaciones Futuras

Para actualizar la app:

1. Incrementar `versionCode` y `version` en `app.config.ts`
2. Compilar nuevo AAB/APK
3. Ir a Play Console > Produccion > Crear nueva version
4. Subir el nuevo archivo
5. Agregar notas de la version
6. Enviar para revision

---

## Tiempo de Revision

- **Primera publicacion**: 1-7 dias
- **Actualizaciones**: Usualmente menos de 24 horas
- **Si hay problemas**: Google te notificara por email

---

## Soporte

Si tienes problemas con la publicacion:
- Centro de ayuda: https://support.google.com/googleplay/android-developer
- Politicas: https://play.google.com/about/developer-content-policy
