# Finca Amaro

Trazabilidad genética de ganado vacuno — proyecto final. React + TypeScript en el frontend, Node.js + Express en el backend, MySQL como base de datos (con Sequelize como ORM).

## Cómo prender todo, paso a paso

### 1. Base de datos (MySQL en Docker)

Abrí Docker Desktop manualmente (desde el menú de Windows) y esperá a que el ícono de la ballena quede quieto. Después:

```bash
docker compose up -d
```

Eso levanta un MySQL 8 en `localhost:3306` con la base `finca_amaro` ya creada (usuario `fincaamaro` / clave `fincaamaro_dev`, están en `backend/.env`).

### 2. Backend

```bash
cd backend
npm install
npm run db:sync
npm run db:seed
npm run dev
```

- `db:sync` crea las tablas a partir de los modelos (`src/models/*.js`).
- `db:seed` carga el ejemplo del cuaderno de marca: el cruce de cuatro razas (Amaro 014, hija de Amaro T-05 y Amaro 003), más un puñado de animales para el tablero de corrales. Podés correrlo las veces que quieras, no duplica catálogos.
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

## Lo que falta a propósito (para la próxima sesión)

- Autenticación (por ahora la API es abierta, pensada para correr solo en tu máquina).
- Subida real de fotos (`fotosController` guarda una URL; falta decidir si van a un disco local, S3, o similar).
- Un formulario para registrar partos desde la UI (el endpoint `POST /api/partos` ya existe y crea la cría automáticamente con su genética calculada, pero todavía no tiene pantalla).
