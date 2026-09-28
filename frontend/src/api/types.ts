export type Sexo = 'M' | 'H';

export type Estado =
  | 'cria' | 'levante' | 'servicio' | 'prenada' | 'lactando'
  | 'engorde' | 'reproductor' | 'vendido' | 'muerto';

export interface Raza {
  id: number;
  nombre: string;
  origen: 'cebu' | 'taurino' | 'compuesta' | 'criolla';
  activa: boolean;
}

export interface RazaConFraccion {
  id?: number;
  nombre?: string;
  razaId?: number;
  fraccion: number;
}

export interface Potrero {
  id: number;
  nombre: string;
  capacidadHa: number | null;
  notas: string | null;
  animales?: AnimalResumen[];
}

export interface AnimalResumen {
  id: number;
  arete: string;
  nombre: string | null;
  sexo: Sexo;
  estado: Estado;
}

export interface Animal extends AnimalResumen {
  fechaNacimiento: string | null;
  madreId: number | null;
  padreId: number | null;
  potreroId: number | null;
  pesoActual: number | null;
  esExterno: boolean;
  notas: string | null;
  razas: RazaConFraccion[];
  potrero?: Potrero | null;
  madre?: AnimalResumen | null;
  padre?: AnimalResumen | null;
}

export interface NodoPedigri {
  id: number;
  arete: string;
  nombre: string | null;
  sexo: Sexo;
  esExterno: boolean;
  razas: { nombre: string; fraccion: number }[];
  madre: NodoPedigri | null;
  padre: NodoPedigri | null;
}

export interface Pesaje {
  id: number; animalId: number; fecha: string; pesoKg: number;
  tipo: 'rutina' | 'nacimiento' | 'destete' | 'otro';
  condicionCorporal: number | null; notas: string | null;
}
export interface Foto {
  id: number; animalId: number; url: string; fecha: string;
  etapa: 'nacimiento' | '15_dias' | '90_dias' | '6_meses' | '1_anio' | 'otro'; notas: string | null;
}
export interface Sanidad {
  id: number; animalId: number; tipo: 'vacuna' | 'tratamiento' | 'desparasitacion';
  producto: string; fecha: string; proximaDosis: string | null; notas: string | null;
}
export interface Parto {
  id: number; servicioId: number | null; madreId: number; criaId: number | null;
  fechaParto: string; sexoCria: Sexo | null; pesoNacerKg: number | null; observaciones: string | null;
}
export interface Movimiento {
  id: number; animalId: number; tipo: 'compra' | 'venta' | 'traslado' | 'muerte' | 'nacimiento';
  fecha: string; origenPotreroId: number | null; destinoPotreroId: number | null;
  precio: number | null; contraparte: string | null; notas: string | null;
}
export interface Servicio {
  id: number; madreId: number; padreId: number | null; semenToro: string | null;
  tipo: 'monta_natural' | 'ia'; fechaServicio: string; fechaDiagnostico: string | null;
  resultado: 'pendiente' | 'prenada' | 'vacia'; fechaProbableParto: string | null;
  madre?: AnimalResumen; padre?: AnimalResumen | null;
  parto?: { id: number; fechaParto: string; criaId: number | null } | null;
}

export interface Evento {
  id: number;
  animalId: number;
  tipo: string;
  descripcion: string;
  fecha: string;
  createdAt: string;
  Animal?: AnimalResumen;
}
