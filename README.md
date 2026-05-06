# BildyApp API

Backend REST desarrollado con Node.js, Express y MongoDB para la gestión de albaranes entre clientes y proveedores.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- JWT
- Zod
- Socket.IO
- Cloudinary
- pdfkit + Sharp
- Jest + Supertest
- Docker + GitHub Actions
- Swagger/OpenAPI 3.0

## Requisitos previos

- Node.js 20+
- npm
- MongoDB (local o Atlas)
- Cuenta en Cloudinary

## Instalación

```bash
git clone https://github.com/pablofranb/BildyApp.git
cd BildyApp
npm install
cp .env.example .env
# Rellena las variables en .env
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (ej. 3000) |
| `DB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Expiración del token (ej. 2h) |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `SLACK_WEBHOOK` | URL del Incoming Webhook de Slack |
| `MAIL_USER` | Email para envío de correos |
| `MAIL_PASS` | Contraseña del correo |

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Ejecución con Docker

```bash
# Levantar app + MongoDB
docker compose up

# En segundo plano
docker compose up -d

# Parar
docker compose down
```

## Documentación Swagger

Una vez arrancado el servidor, accede a:

```
http://localhost:3000/api-docs
```

## Tests

```bash
# Ejecutar tests
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

La cobertura mínima requerida es del 70%.

## Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/user/register` | Registro |
| POST | `/api/user/login` | Login |
| GET | `/api/client` | Listar clientes |
| POST | `/api/client` | Crear cliente |
| GET | `/api/project` | Listar proyectos |
| POST | `/api/project` | Crear proyecto |
| GET | `/api/deliverynote` | Listar albaranes |
| POST | `/api/deliverynote` | Crear albarán |
| PATCH | `/api/deliverynote/:id/sign` | Firmar albarán |
| GET | `/api/deliverynote/pdf/:id` | Descargar PDF |
| GET | `/health` | Estado del servidor |

Consulta `/api-docs` para la documentación completa de todos los endpoints.
