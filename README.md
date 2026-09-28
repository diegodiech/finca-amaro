# Finca Amaro

Trazabilidad genética de ganado vacuno — proyecto final. React + TypeScript en el frontend, Node.js + Express en el backend, MySQL como base de datos (con Sequelize como ORM).

## Cómo prender todo, paso a paso

### 1. Base de datos (MySQL gratis en Aiven)

No hace falta instalar nada. Los pasos:

1. Andá a [aiven.io](https://aiven.io/free-mysql-database) y creá una cuenta (con Google, GitHub o email — no pide tarjeta).
2. En la consola, **Create service** → elegí **MySQL** → plan **Free**.
3. Elegí una región (cualquiera de AWS o GCP sirve; si no hay una en Sudamérica, la más cercana disponible está bien para desarrollo).
4. Ponele de nombre `finca-amaro` y creá el servicio. Tarda uno o dos minutos en quedar `Running`.
5. Entrá al servicio → pestaña **Overview** → ahí están **Host**, **Port**, **User** (`avnadmin`), **Password** y la base por defecto (`defaultdb`).
6. Copiá esos datos a `backend/.env` (mirá `backend/.env.example` como plantilla) y dejá `DB_SSL=true`.

Con eso la base ya existe y queda accesible desde cualquier lado — incluida esta sesión, si me pasás los datos también puedo conectarme yo y probar todo sin que abras nada en tu compu.

*¿Preferís MySQL local en vez de la nube?* `docker-compose.yml` sigue en el proyecto: abrís Docker Desktop y corrés `docker compose up -d`, con `DB_HOST=localhost`, `DB_SSL=false` y las credenciales que ya están en `backend/.env.example`.

### 2. Backend

```bash
cd backend
npm install
npm run db:sync
npm run db:seed
npm run dev
```

- `db:sync` crea las tablas a partir de los modelos (`src/models/*.js`).
- `db:seed` carga el ejemplo de la etapa 1 (línea base Nelore, con Angus entrando solo por inseminación): Amaro 014 es Nelore 3/4 + Angus 1/4, hija de Amaro T-05 y Amaro 003, más un puñado de animales para el tablero de corrales. Podés correrlo las veces que quieras: si los datos ya están, no los duplica.
- `npm run dev` levanta la API en `http://localhost:4000` con recarga automática (nodemon).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Se abre en `http://localhost:5173` y ya apunta a `http://localhost:4000/api` (configurado en `frontend/.env`). La primera vez pide la clave de acceso (`APP_PASSWORD` de `backend/.env`).

## Publicarlo en fincamaro.com

Frontend en **Cloudflare Pages**, backend en **Render**, base en **Aiven** (ya armada) y DNS en **Porkbun** (donde está comprado el dominio, sin migrar nameservers).

### 1. Subir el código a GitHub

```bash
git remote add origin https://github.com/TU-USUARIO/finca-amaro.git
git branch -M main
git push -u origin main
```

### 2. Backend en Render

1. [render.com](https://render.com) → crear cuenta (sin tarjeta) → **New** → **Web Service** → conectar el repo de GitHub.
2. **Root Directory**: `backend`. **Build Command**: `npm install`. **Start Command**: `npm start`. Plan **Free**.
3. En **Environment**, cargar todas las variables de `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL=true`, `JWT_SECRET`, `APP_PASSWORD`) más `CORS_ORIGIN=https://fincamaro.com,https://www.fincamaro.com`. Render pone `PORT` solo.
4. **Create Web Service**. Cuando termine el deploy, en **Settings → Custom Domains** agregar `api.fincamaro.com`: Render muestra el registro CNAME exacto para copiar a Porkbun.

### 3. Frontend en Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → crear cuenta (sin tarjeta) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → el mismo repo.
2. **Root directory**: `frontend`. **Build command**: `npm run build`. **Build output directory**: `dist`.
3. Antes de desplegar, en **Environment variables** agregar `VITE_API_URL=https://api.fincamaro.com/api` (Vite la incrusta en el build, así que tiene que estar *antes* del primer deploy).
4. **Save and Deploy**. Cuando termine, en **Custom domains** agregar `fincamaro.com` y `www.fincamaro.com`: Cloudflare muestra los registros exactos (un ALIAS/CNAME para la raíz y un CNAME para `www`).

### 4. DNS en Porkbun

En el panel de `fincamaro.com` → pestaña **DNS** ([guía de Porkbun](https://kb.porkbun.com/article/231-how-to-add-dns-records-on-porkbun)), agregar los tres registros que Render y Cloudflare fueron mostrando en los pasos anteriores. Van a ser, aproximadamente:

| Tipo | Host | Apunta a |
|---|---|---|
| ALIAS | `@` (raíz) | `tu-proyecto.pages.dev` |
| CNAME | `www` | `tu-proyecto.pages.dev` |
| CNAME | `api` | lo que indique Render (suele ser el hostname `.onrender.com` del servicio) |

Cloudflare y Render también pueden pedir un registro **TXT** de verificación de dominio — se agrega igual, con el valor exacto que muestre cada uno.

### 5. Confirmar que quedó bien

El SSL y el DNS pueden tardar entre varios minutos y un par de horas. Cuando `https://fincamaro.com` cargue el login y `https://api.fincamaro.com/api/salud` devuelva `{"ok":true}`, ya está en línea. Avisame y lo reviso con vos.

**Dos cosas a tener en cuenta con los planes gratis:** Render duerme el backend a los 15 minutos sin uso (la primera visita después tarda ~50s en responder), y Aiven hace lo mismo con la base tras un tiempo de inactividad — por eso `server.js` reintenta la conexión varias veces al arrancar en vez de rendirse al primer intento.

## Cómo está armado (para cuando quieras tocarlo vos)

```
backend/
  src/
    config/db.js        # conexión a MySQL vía Sequelize
    models/              # una tabla = un archivo. index.js define las relaciones (FK)
    controllers/          # la lógica de cada endpoint, sin magia oculta
    routes/index.js       # qué URL llama a qué función del controller
    utils/genetica.js     # la única cuenta matemática del sistema: mezclar razas 50/50
    db/sync.js, seed.js   # scripts sueltos, se corren con "npm run db:sync" / "db:seed"
frontend/
  src/
    api/                  # cliente axios + los tipos TypeScript que espejan al backend
    components/           # piezas reusables: el árbol genealógico, la barra de razas, etc.
    pages/                # una página por ruta: Dashboard, Animales, AnimalDetalle, Corrales
```

**La idea central del modelo de datos:** cada animal (`animales`) puede tener una `madreId` y un `padreId` que apuntan a *otro animal* de la misma tabla — así se arma el árbol genealógico sin necesitar una tabla aparte. La tabla `animal_razas` guarda, por cada animal, qué fracción de sangre tiene de cada raza (Brahman, Nelore, Guzerat, Angus, etc.). Cuando registrás una cría con madre y padre conocidos, el botón "Sugerir desde padres" llama a `GET /api/animales/sugerencia-razas` y promedia las fracciones de ambos automáticamente — es la regla genética real (50% de cada padre), no un invento del sistema.

Los toros de inseminación externos (semen comprado, el animal no vive en la finca) se cargan igual como un `Animal` con `esExterno: true` — así el árbol genealógico no se corta ahí, aunque el toro nunca haya pisado Finca Amaro.

Cada acción importante (parto, servicio, traslado, vacuna, pesaje) además de guardarse en su propia tabla, deja una fila en `eventos` — es la tabla que alimenta la Bitácora del dashboard, el "muro" de novedades.

## Proyecto por etapas

La pantalla **Líneas** (tabla `razas`, columna `activa`) define qué razas manejás en cada etapa. Etapa 1: solo Nelore. Sumar una línea más adelante (Brangus, Angus puro, criollo…) es activarla ahí: no hay que tocar código. Los formularios solo ofrecen las razas activas, y los animales ya cargados conservan su composición genética completa.

Para seleccionar con datos, los pesajes distinguen el **peso al destete (~205 días)** y guardan la **condición corporal (1-9)**, que conviene medir al final de la época seca.

## Lo que falta a propósito (para la próxima sesión)

- Subida real de fotos (`fotosController` guarda una URL; falta decidir si van a un disco local, S3, o similar).
- La clave de acceso es una sola para toda la finca (no hay usuarios separados) — alcanza para un solo administrador, no para varias personas con permisos distintos.
