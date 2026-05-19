# Control de asistencia para eventos

Aplicacion full-stack para registrar asistencia por numero de empleado, cargar invitados desde Excel, personalizar la pantalla principal con temas visuales, consultar metricas en tiempo real y ejecutar sorteos animados.

## Funciones incluidas

- Pantalla principal limpia, pensada para pantalla completa.
- Registro por numero de empleado con Enter o boton.
- Prevencion de doble registro por evento.
- Acceso oculto a configuracion con `Ctrl + Q`.
- Engrane discreto en la esquina inferior derecha, coloreado con la tematica activa.
- Login admin con contrasena dinamica: `admin` + fecha `AAAAMMDD` en zona `America/Tijuana`.
- Carga de asistentes desde Excel con columnas: `Numero de empleado`, `Nombre`, `Region`, `Plaza`, `Tienda`.
- Template descargable desde el panel.
- Dashboard en tiempo real con presentes, faltantes, avance y graficos.
- Editor visual con temas de deportes, San Valentin, Navidad, Pascua y Halloween.
- Paletas, imagen de fondo, animaciones, iconos, layouts e intensidad visual.
- Exportacion Excel de presentes, faltantes y ganadores de sorteos.
- Modulo de sorteos en pantalla completa.
- Opcion admin para sortear entre solo presentes o todos los cargados.

## Arquitectura sugerida

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Base de datos: MongoDB Atlas.
- Despliegue: Railway conectado al repositorio de GitHub.

Esta arquitectura mantiene el frontend rapido y el backend simple de operar. MongoDB permite guardar historial por evento, asistentes, registros y sorteos sin cambiar mucho el modelo conforme crezca el proyecto.

## Estructura

```txt
client/   Interfaz React
server/   API Express, modelos MongoDB y exportacion Excel
railway.json
```

## Desarrollo local

1. Instala Node.js 20 o superior.
2. Copia variables:

```bash
cp server/.env.example server/.env
```

3. Configura `MONGODB_URI` y `JWT_SECRET` en `server/.env`.
4. Instala dependencias:

```bash
npm install
```

5. Ejecuta frontend y backend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:8080`

## Subir a GitHub

Repositorio creado:

```bash
git init
git remote add origin https://github.com/BenjaminRuizT/Control-Asistencia-Eventos.git
git add .
git commit -m "Crear aplicacion de control de asistencia"
git branch -M main
git push -u origin main
```

## Despliegue en Railway

1. Crea un proyecto en Railway.
2. Conecta el repositorio `BenjaminRuizT/Control-Asistencia-Eventos`.
3. Agrega estas variables:

```txt
MONGODB_URI=mongodb+srv://...
JWT_SECRET=un-secreto-largo-y-privado
ADMIN_USER=admin
ADMIN_PREFIX=admin
ADMIN_TIMEZONE=America/Tijuana
NODE_ENV=production
```

4. Railway usara `railway.json`:

```txt
Build: npm install && npm run build
Start: npm start
```

5. Abre la URL publica de Railway.

## MongoDB Atlas

1. Crea un cluster gratuito.
2. Crea un usuario de base de datos.
3. Permite acceso desde Railway. Para empezar puedes usar `0.0.0.0/0`; en produccion conviene restringirlo.
4. Copia el connection string en `MONGODB_URI`.

## Uso administrativo

Para entrar al panel:

- Teclas: `Ctrl + Q`
- Boton discreto: engrane inferior derecho
- Usuario: `admin`
- Contrasena: `admin` + fecha en zona `America/Tijuana`

Ejemplo para 17 de mayo de 2026:

```txt
admin20260517
```

## Template Excel

Desde configuracion usa `Descargar template`. La hoja debe contener:

```txt
Numero de empleado | Nombre | Region | Plaza | Tienda
```

El numero de empleado es unico dentro del evento activo.

## Siguientes mejoras recomendadas

- Crear usuarios administradores reales con roles y auditoria.
- Agregar modo offline con sincronizacion cuando vuelva internet.
- Agregar pantalla de historial de eventos anteriores.
- Proteger exportaciones con expiracion de token mas corta en eventos publicos.
- Agregar importacion de imagenes a almacenamiento externo si las fotos de fondo seran pesadas.
