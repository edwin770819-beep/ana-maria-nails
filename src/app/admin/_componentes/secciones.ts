import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Images,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export const SECCIONES = [
  { href: "/admin", texto: "Agenda", icono: CalendarDays },
  { href: "/admin/citas/nueva", texto: "Nueva cita", icono: CalendarPlus },
  { href: "/admin/disponibilidad", texto: "Disponibilidad", icono: Clock },
  { href: "/admin/servicios", texto: "Servicios", icono: Sparkles },
  { href: "/admin/galeria", texto: "Galería", icono: Images },
  { href: "/admin/clientas", texto: "Clientas", icono: Users },
  { href: "/admin/ingresos", texto: "Ingresos", icono: TrendingUp },
  { href: "/admin/ajustes", texto: "Ajustes", icono: Settings },
];
