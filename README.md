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
- Base de datos: Supabase Postgres.
- Despliegue: Railway conectado al repositorio de GitHub.

Esta arquitectura mantiene el frontend rapido y el backend simple de operar. Supabase Postgres encaja bien porque el proyecto tiene entidades relacionales: eventos, asistentes, asistencias y sorteos.

## Estructura

```txt
client/    Interfaz React
server/    API Express, Supabase y exportacion Excel
supabase/  Schema SQL para crear las tablas
railway.json
```

## Desarrollo local

1. Instala Node.js 20 o superior.
2. Copia variables:

```bash
cp server/.env.example server/.env
```

3. Configura `SUPABASE_URL`, `SUPABASE_SECRET_KEY` y `JWT_SECRET` en `server/.env`.
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
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SECRET_KEY=tu-sb-secret-key
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

## Supabase

1. Entra a tu proyecto de Supabase.
2. Ve a `SQL Editor`.
3. Crea un nuevo query.
4. Pega el contenido de [supabase/schema.sql](/C:/Users/3650428/Control-Asistencia-Eventos/supabase/schema.sql).
5. Ejecuta el query completo.
6. Ve a `Project Settings` > `API Keys`.
7. Copia `Project URL` en `SUPABASE_URL`.
8. Crea o copia una `secret key` con formato `sb_secret_...` y guardala como `SUPABASE_SECRET_KEY`.
9. Agrega esas variables en Railway.

Si tu panel aun no muestra secret keys, puedes usar la llave legacy `service_role` en la variable `SUPABASE_SERVICE_ROLE_KEY`. Cualquiera de estas llaves elevadas debe vivir solo en Railway o en `server/.env`. No la pongas en `client/.env`, GitHub, ni codigo frontend.

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
- Agregar Supabase Storage para fondos pesados en lugar de guardar imagenes como Base64.
