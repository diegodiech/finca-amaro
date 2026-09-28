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

Se abre en `http://localhost:5173` y ya apunta a `http://localhost:4000/api` (configurado en `frontend/.env`).

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

- Autenticación (por ahora la API es abierta, pensada para correr solo en tu máquina).
- Subida real de fotos (`fotosController` guarda una URL; falta decidir si van a un disco local, S3, o similar).
- Un formulario para registrar partos desde la UI (el endpoint `POST /api/partos` ya existe y crea la cría automáticamente con su genética calculada, pero todavía no tiene pantalla).
