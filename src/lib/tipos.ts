// Tipos que reflejan las tablas de supabase/migrations/0001_esquema.sql

export type Rol = "cliente" | "admin";
export type Modalidad = "domicilio" | "salon";
export type EstadoCita =
  | "pendiente_pago"
  | "confirmada"
  | "en_camino"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_asistio";
export type EstadoPago = "sin_pago" | "anticipo" | "pagado";

export interface Ajustes {
  id: 1;
  whatsapp: string | null;
  instrucciones_pago: string | null;
  anticipo_porcentaje: number;
  horas_cancelacion: number;
  minutos_traslado: number;
  intervalo_minutos: number;
  antelacion_minima_minutos: number;
  dias_maximos_reserva: number;
  visitas_cliente_frecuente: number;
  pagos_en_linea: boolean;
  minutos_expiracion_pago: number;
  domicilio_habilitado: boolean;
  salon_habilitado: boolean;
  salon_direccion: string | null;
  salon_ciudad: string | null;
  actualizado_en: string;
}

export interface Perfil {
  id: string;
  email: string | null;
  nombre: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  rol: Rol;
  frecuente_manual: boolean;
  acepto_datos_en: string | null;
  creado_en: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  activa: boolean;
}

export interface Direccion {
  id: string;
  cliente_id: string;
  etiqueta: string;
  direccion: string;
  barrio: string | null;
  ciudad: string;
  indicaciones: string | null;
  lat: number | null;
  lng: number | null;
  principal: boolean;
  creado_en: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  duracion_minutos: number;
  precio: number;
  imagen_url: string | null;
  modalidad: "domicilio" | "salon" | "ambos";
  activo: boolean;
  orden: number;
  creado_en: string;
}

export interface Diseno {
  id: string;
  titulo: string;
  categoria: string;
  imagen_url: string;
  activo: boolean;
  orden: number;
  creado_en: string;
}

export interface HorarioSemanal {
  id: number;
  dia_semana: number; // 0 domingo ... 6 sábado
  hora_inicio: string; // "08:00:00"
  hora_fin: string;
}

export interface ExcepcionHorario {
  id: number;
  fecha: string; // "2026-10-18"
  tipo: "disponible" | "bloqueado";
  hora_inicio: string | null;
  hora_fin: string | null;
  nota: string | null;
}

export interface Cita {
  id: string;
  cliente_id: string | null;
  cliente_nombre: string | null;
  cliente_telefono: string | null;
  servicio_id: string;
  servicio_nombre: string | null;
  inicio: string;
  fin: string;
  bloqueo_hasta: string;
  modalidad: Modalidad;
  direccion_id: string | null;
  direccion_texto: string | null;
  barrio: string | null;
  ciudad: string | null;
  indicaciones: string | null;
  lat: number | null;
  lng: number | null;
  estado: EstadoCita;
  precio: number;
  anticipo_requerido: boolean;
  monto_anticipo: number;
  monto_pagado: number;
  estado_pago: EstadoPago;
  notas_cliente: string | null;
  diseno_id: string | null;
  foto_referencia: string | null;
  expira_en: string | null;
  cancelada_en: string | null;
  motivo_cancelacion: string | null;
  creado_en: string;
}

export interface Pago {
  id: string;
  cita_id: string;
  referencia: string;
  tipo: "anticipo" | "total" | "saldo";
  proveedor: "wompi" | "manual";
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado" | "anulado" | "error";
  metodo: string | null;
  transaccion_id: string | null;
  creado_en: string;
  actualizado_en: string;
}

export const ETIQUETA_ESTADO: Record<EstadoCita, string> = {
  pendiente_pago: "Pendiente de anticipo",
  confirmada: "Confirmada",
  en_camino: "En camino",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const ETIQUETA_PAGO: Record<EstadoPago, string> = {
  sin_pago: "Sin pago",
  anticipo: "Anticipo pagado",
  pagado: "Pagado",
};
