-- =====================================================================
-- Datos iniciales (ejecutar después de 0001_esquema.sql)
-- Precios de referencia en Bogotá, domicilio incluido. Ana María los
-- puede cambiar desde su panel en cualquier momento.
-- =====================================================================

-- Administradoras: Ana María y su papá (para pruebas)
insert into public.correos_admin (email) values
  ('atroncosoranada@gmail.com'),
  ('edwin770819@gmail.com')
on conflict do nothing;

-- Cobertura inicial
insert into public.ciudades (nombre, activa) values ('Bogotá', true)
on conflict do nothing;

-- Horario: lunes (1) a sábado (6), 8:00 a. m. a 5:00 p. m.
insert into public.horario_semanal (dia_semana, hora_inicio, hora_fin)
select d, '08:00', '17:00' from generate_series(1, 6) d;

-- Servicios sugeridos
insert into public.servicios (nombre, descripcion, categoria, duracion_minutos, precio, orden) values
  ('Manicure tradicional',
   'Limado, cutícula, hidratación y esmalte tradicional del color que elijas.',
   'Manos', 45, 35000, 1),
  ('Manicure semipermanente',
   'Esmaltado en gel con secado en lámpara. Brillo impecable hasta por 3 semanas.',
   'Manos', 60, 55000, 2),
  ('Rubber base / Kapping',
   'Nivelación y refuerzo de la uña natural con base rubber. Ideal para uñas frágiles.',
   'Manos', 75, 75000, 3),
  ('Uñas en polygel',
   'Extensión o refuerzo en polygel con forma a tu gusto y acabado semipermanente.',
   'Manos', 90, 110000, 4),
  ('Pedicure tradicional',
   'Limpieza, limado, cutícula, exfoliación suave y esmalte tradicional.',
   'Pies', 60, 40000, 5),
  ('Pedicure semipermanente',
   'Pedicure completo con esmaltado en gel de larga duración.',
   'Pies', 75, 60000, 6),
  ('Combo mani + pedi tradicional',
   'Manicure y pedicure tradicional en una sola visita.',
   'Combos', 90, 70000, 7),
  ('Combo mani + pedi semipermanente',
   'Manos y pies en semipermanente. El favorito para lucir perfecta por semanas.',
   'Combos', 90, 105000, 8),
  ('Spa de manos',
   'Exfoliación, mascarilla, masaje relajante e hidratación profunda con parafina.',
   'Spa', 45, 45000, 9),
  ('Spa de pies',
   'Baño relajante, exfoliación, remoción de callosidad, mascarilla y masaje.',
   'Spa', 60, 55000, 10),
  ('Nail art (diseño adicional)',
   'Diseño personalizado: francés, encapsulados, piedras, mano alzada o el que soñaste.',
   'Diseño', 45, 25000, 11),
  ('Retiro de semipermanente o polygel',
   'Retiro cuidadoso sin dañar la uña natural, con hidratación final.',
   'Manos', 45, 20000, 12);
