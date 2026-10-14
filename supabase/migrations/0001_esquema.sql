-- =====================================================================
-- Ana María Nail Atelier · Esquema de base de datos (Supabase / Postgres)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- Zona horaria del negocio: America/Bogota (UTC-5, sin horario de verano)
-- =====================================================================

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Ajustes generales del negocio (una sola fila)
-- ---------------------------------------------------------------------
create table public.ajustes (
  id                         int primary key default 1 check (id = 1),
  whatsapp                   text,                      -- ej: 573001234567
  instrucciones_pago         text default 'Puedes enviar el anticipo por Nequi o transferencia y Ana María confirmará tu cita.',
  anticipo_porcentaje        int  not null default 30 check (anticipo_porcentaje between 0 and 100),
  horas_cancelacion          int  not null default 2  check (horas_cancelacion >= 0),
  minutos_traslado           int  not null default 45 check (minutos_traslado >= 0),
  intervalo_minutos          int  not null default 15 check (intervalo_minutos between 5 and 120),
  antelacion_minima_minutos  int  not null default 120 check (antelacion_minima_minutos >= 0),
  dias_maximos_reserva       int  not null default 60 check (dias_maximos_reserva between 1 and 365),
  visitas_cliente_frecuente  int  not null default 3 check (visitas_cliente_frecuente >= 1),
  pagos_en_linea             boolean not null default false, -- se activa cuando Wompi esté configurado
  minutos_expiracion_pago    int  not null default 30,
  domicilio_habilitado       boolean not null default true,
  salon_habilitado           boolean not null default false, -- para cuando abra el salón físico
  salon_direccion            text,
  salon_ciudad               text,
  actualizado_en             timestamptz not null default now()
);
insert into public.ajustes (id) values (1);

-- Correos que al registrarse quedan como administradoras
create table public.correos_admin (
  email text primary key check (email = lower(email))
);

-- ---------------------------------------------------------------------
-- Perfiles (1 a 1 con auth.users)
-- ---------------------------------------------------------------------
create table public.perfiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text,
  nombre            text,
  telefono          text,
  fecha_nacimiento  date,
  rol               text not null default 'cliente' check (rol in ('cliente', 'admin')),
  frecuente_manual  boolean not null default false,  -- Ana María puede marcarla como frecuente
  acepto_datos_en   timestamptz,                     -- Ley 1581 de 2012 (Habeas Data)
  creado_en         timestamptz not null default now()
);

-- Notas privadas de Ana María sobre cada clienta (alergias, gustos, etc.)
create table public.notas_clientas (
  cliente_id     uuid primary key references public.perfiles (id) on delete cascade,
  nota           text,
  actualizado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Cobertura y direcciones
-- ---------------------------------------------------------------------
create table public.ciudades (
  id     serial primary key,
  nombre text not null unique,
  activa boolean not null default true
);

create table public.direcciones (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null references public.perfiles (id) on delete cascade,
  etiqueta     text not null default 'Casa',           -- Casa, Oficina, Mamá...
  direccion    text not null,                          -- Calle 123 # 45-67
  barrio       text,
  ciudad       text not null,
  indicaciones text,                                   -- Torre 3, apto 502, portería...
  lat          double precision,
  lng          double precision,
  principal    boolean not null default false,
  creado_en    timestamptz not null default now()
);
create index on public.direcciones (cliente_id);

-- ---------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------
create table public.servicios (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  descripcion      text,
  categoria        text not null default 'Manos',
  duracion_minutos int  not null check (duracion_minutos between 10 and 480),
  precio           int  not null check (precio >= 0),   -- pesos colombianos, domicilio incluido
  imagen_url       text,
  modalidad        text not null default 'ambos' check (modalidad in ('domicilio', 'salon', 'ambos')),
  activo           boolean not null default true,
  orden            int not null default 0,
  creado_en        timestamptz not null default now()
);

-- Galería de diseños / portafolio
create table public.disenos (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  categoria  text not null default 'Nail art',
  imagen_url text not null,
  activo     boolean not null default true,
  orden      int not null default 0,
  creado_en  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Disponibilidad
-- ---------------------------------------------------------------------
-- dia_semana: 0 = domingo, 1 = lunes ... 6 = sábado. Se permiten varios bloques por día.
create table public.horario_semanal (
  id          serial primary key,
  dia_semana  int  not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin    time not null,
  check (hora_fin > hora_inicio)
);

-- Excepciones por fecha:
--   'disponible' = abre un espacio extra (ej. un domingo, o 6 a 8 am)
--   'bloqueado'  = cierra un rango; si hora_inicio es null, cierra el día completo
create table public.excepciones_horario (
  id          serial primary key,
  fecha       date not null,
  tipo        text not null check (tipo in ('disponible', 'bloqueado')),
  hora_inicio time,
  hora_fin    time,
  nota        text,
  check ((hora_inicio is null and hora_fin is null and tipo = 'bloqueado')
         or (hora_inicio is not null and hora_fin is not null and hora_fin > hora_inicio))
);
create index on public.excepciones_horario (fecha);

-- ---------------------------------------------------------------------
-- Citas
-- ---------------------------------------------------------------------
create table public.citas (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid references public.perfiles (id) on delete set null,
  cliente_nombre      text,      -- para citas que Ana María agenda a clientas sin cuenta
  cliente_telefono    text,
  servicio_id         uuid not null references public.servicios (id),
  servicio_nombre     text,      -- copia al momento de reservar
  inicio              timestamptz not null,
  fin                 timestamptz not null,
  bloqueo_hasta       timestamptz not null, -- fin + tiempo de traslado
  modalidad           text not null default 'domicilio' check (modalidad in ('domicilio', 'salon')),
  direccion_id        uuid references public.direcciones (id) on delete set null,
  direccion_texto     text,      -- copia de la dirección al momento de reservar
  barrio              text,
  ciudad              text,
  indicaciones        text,
  lat                 double precision,
  lng                 double precision,
  estado              text not null default 'confirmada'
                      check (estado in ('pendiente_pago', 'confirmada', 'en_camino', 'en_curso',
                                        'completada', 'cancelada', 'no_asistio')),
  precio              int not null default 0,
  anticipo_requerido  boolean not null default false,
  monto_anticipo      int not null default 0,
  monto_pagado        int not null default 0,
  estado_pago         text not null default 'sin_pago' check (estado_pago in ('sin_pago', 'anticipo', 'pagado')),
  notas_cliente       text,
  diseno_id           uuid references public.disenos (id) on delete set null,
  foto_referencia     text,      -- ruta en el bucket 'referencias'
  expira_en           timestamptz, -- si no paga el anticipo antes, se libera el cupo
  cancelada_en        timestamptz,
  motivo_cancelacion  text,
  creado_en           timestamptz not null default now(),
  check (fin > inicio),
  -- Evita a nivel de base de datos que se crucen dos citas (incluyendo el traslado)
  constraint citas_sin_cruces exclude using gist (
    tstzrange(inicio, bloqueo_hasta) with &&
  ) where (estado <> 'cancelada')
);
create index on public.citas (cliente_id);
create index on public.citas (inicio);

-- ---------------------------------------------------------------------
-- Pagos
-- ---------------------------------------------------------------------
create table public.pagos (
  id              uuid primary key default gen_random_uuid(),
  cita_id         uuid not null references public.citas (id) on delete cascade,
  referencia      text not null unique,
  tipo            text not null check (tipo in ('anticipo', 'total', 'saldo')),
  proveedor       text not null default 'wompi' check (proveedor in ('wompi', 'manual')),
  monto           int  not null check (monto > 0),
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente', 'aprobado', 'rechazado', 'anulado', 'error')),
  metodo          text,           -- CARD, PSE, NEQUI, BANCOLOMBIA_TRANSFER, efectivo...
  transaccion_id  text,
  detalle         jsonb,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);
create index on public.pagos (cita_id);

-- =====================================================================
-- Funciones auxiliares
-- =====================================================================

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

create or replace function public.es_frecuente(p_cliente uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select frecuente_manual from perfiles where id = p_cliente), false)
      or (select count(*) from citas where cliente_id = p_cliente and estado = 'completada')
         >= (select visitas_cliente_frecuente from ajustes where id = 1);
$$;

-- Perfil automático al registrarse
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, email, nombre, telefono, rol)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.phone,
    case when exists (select 1 from correos_admin where email = lower(new.email)) then 'admin' else 'cliente' end
  );
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Si se agrega un correo admin y la persona ya estaba registrada, se promueve
create or replace function public.promover_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update perfiles set rol = 'admin' where email = new.email;
  return new;
end $$;

create trigger al_agregar_correo_admin
  after insert on public.correos_admin
  for each row execute function public.promover_admin();

-- Una clienta no puede cambiarse el rol ni marcarse frecuente
create or replace function public.proteger_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not es_admin() then
    new.rol := old.rol;
    new.frecuente_manual := old.frecuente_manual;
    new.email := old.email;
  end if;
  return new;
end $$;

create trigger antes_de_actualizar_perfil
  before update on public.perfiles
  for each row execute function public.proteger_perfil();

-- Calcula fin y bloqueo (fin + traslado) de cada cita
create or replace function public.calcular_tiempos_cita()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_duracion int;
  v_traslado int;
begin
  -- Si la cita se mueve de hora o cambia de servicio, el fin se recalcula con la duración del servicio
  select duracion_minutos into v_duracion from servicios where id = new.servicio_id;
  new.fin := new.inicio + make_interval(mins => v_duracion);
  if new.servicio_nombre is null then
    select nombre into new.servicio_nombre from servicios where id = new.servicio_id;
  end if;
  select case when new.modalidad = 'domicilio' then minutos_traslado else 0 end
    into v_traslado from ajustes where id = 1;
  new.bloqueo_hasta := new.fin + make_interval(mins => v_traslado);
  return new;
end $$;

create trigger antes_de_guardar_cita
  before insert or update of inicio, fin, servicio_id, modalidad on public.citas
  for each row execute function public.calcular_tiempos_cita();

-- Libera cupos de citas cuyo anticipo en línea no se pagó a tiempo
create or replace function public.liberar_citas_vencidas()
returns void language sql security definer set search_path = public as $$
  update citas
     set estado = 'cancelada', cancelada_en = now(),
         motivo_cancelacion = 'El anticipo no se pagó a tiempo'
   where estado = 'pendiente_pago' and expira_en is not null and expira_en < now();
$$;

-- =====================================================================
-- Horarios disponibles para un servicio en una fecha (hora de Bogotá)
-- =====================================================================
create or replace function public.horarios_disponibles(p_servicio uuid, p_fecha date, p_modalidad text default 'domicilio')
returns table (inicio timestamptz)
language sql stable security definer set search_path = public as $$
  with a as (select * from ajustes where id = 1),
  s as (select duracion_minutos as dur from servicios where id = p_servicio and activo),
  traslado as (select case when p_modalidad = 'domicilio' then a.minutos_traslado else 0 end as min from a),
  ventanas as (
    select h.hora_inicio, h.hora_fin
      from horario_semanal h
     where h.dia_semana = extract(dow from p_fecha)::int
       and not exists (select 1 from excepciones_horario e
                        where e.fecha = p_fecha and e.tipo = 'bloqueado' and e.hora_inicio is null)
    union
    select e.hora_inicio, e.hora_fin
      from excepciones_horario e
     where e.fecha = p_fecha and e.tipo = 'disponible'
  ),
  candidatos as (
    select distinct gs as local_inicio, s.dur
      from ventanas v, s, a,
           generate_series(p_fecha + v.hora_inicio,
                           p_fecha + v.hora_fin - make_interval(mins => s.dur),
                           make_interval(mins => a.intervalo_minutos)) gs
  )
  select (c.local_inicio at time zone 'America/Bogota') as inicio
    from candidatos c, a, traslado t
   where (c.local_inicio at time zone 'America/Bogota') >= now() + make_interval(mins => a.antelacion_minima_minutos)
     and p_fecha <= (now() at time zone 'America/Bogota')::date + a.dias_maximos_reserva
     and not exists (
       select 1 from citas ci
        where ci.estado <> 'cancelada'
          and (ci.estado <> 'pendiente_pago' or ci.expira_en is null or ci.expira_en > now())
          and tstzrange(ci.inicio, ci.bloqueo_hasta)
              && tstzrange(c.local_inicio at time zone 'America/Bogota',
                           (c.local_inicio + make_interval(mins => c.dur + t.min)) at time zone 'America/Bogota'))
     and not exists (
       select 1 from excepciones_horario e
        where e.fecha = p_fecha and e.tipo = 'bloqueado' and e.hora_inicio is not null
          and tsrange(p_fecha + e.hora_inicio, p_fecha + e.hora_fin)
              && tsrange(c.local_inicio, c.local_inicio + make_interval(mins => c.dur)))
   order by 1;
$$;

-- =====================================================================
-- Reservar una cita (la usa la clienta desde la app)
-- =====================================================================
create or replace function public.reservar_cita(
  p_servicio        uuid,
  p_inicio          timestamptz,
  p_direccion       uuid default null,
  p_modalidad       text default 'domicilio',
  p_notas           text default null,
  p_diseno          uuid default null,
  p_foto_referencia text default null
)
returns public.citas
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_ajustes   ajustes;
  v_servicio  servicios;
  v_dir       direcciones;
  v_requiere  boolean;
  v_anticipo  int := 0;
  v_cita      citas;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para reservar';
  end if;

  select * into v_ajustes from ajustes where id = 1;
  select * into v_servicio from servicios where id = p_servicio and activo;
  if not found then
    raise exception 'Este servicio no está disponible';
  end if;

  if p_modalidad = 'domicilio' then
    if not v_ajustes.domicilio_habilitado or v_servicio.modalidad = 'salon' then
      raise exception 'Este servicio no está disponible a domicilio';
    end if;
    select * into v_dir from direcciones where id = p_direccion and cliente_id = v_uid;
    if not found then
      raise exception 'Selecciona una dirección válida';
    end if;
    if not exists (select 1 from ciudades where activa and lower(nombre) = lower(v_dir.ciudad)) then
      raise exception 'Por ahora no tenemos cobertura en %', v_dir.ciudad;
    end if;
  elsif p_modalidad = 'salon' then
    if not v_ajustes.salon_habilitado or v_servicio.modalidad = 'domicilio' then
      raise exception 'Este servicio no está disponible en el salón';
    end if;
  else
    raise exception 'Modalidad no válida';
  end if;

  perform liberar_citas_vencidas();

  if not exists (
    select 1 from horarios_disponibles(p_servicio, (p_inicio at time zone 'America/Bogota')::date, p_modalidad) h
     where h.inicio = p_inicio
  ) then
    raise exception 'Ese horario acaba de ocuparse, por favor elige otro';
  end if;

  v_requiere := v_ajustes.anticipo_porcentaje > 0 and not es_frecuente(v_uid);
  if v_requiere then
    -- redondeado a centenas de peso
    v_anticipo := (ceil(v_servicio.precio * v_ajustes.anticipo_porcentaje / 100.0 / 100) * 100)::int;
  end if;

  insert into citas (
    cliente_id, servicio_id, servicio_nombre, inicio, fin, modalidad,
    direccion_id, direccion_texto, barrio, ciudad, indicaciones, lat, lng,
    estado, precio, anticipo_requerido, monto_anticipo,
    notas_cliente, diseno_id, foto_referencia, expira_en
  ) values (
    v_uid, v_servicio.id, v_servicio.nombre, p_inicio,
    p_inicio + make_interval(mins => v_servicio.duracion_minutos), p_modalidad,
    v_dir.id,
    case when p_modalidad = 'salon' then v_ajustes.salon_direccion else v_dir.direccion end,
    v_dir.barrio,
    case when p_modalidad = 'salon' then v_ajustes.salon_ciudad else v_dir.ciudad end,
    v_dir.indicaciones, v_dir.lat, v_dir.lng,
    case when v_requiere then 'pendiente_pago' else 'confirmada' end,
    v_servicio.precio, v_requiere, v_anticipo,
    nullif(trim(p_notas), ''), p_diseno, p_foto_referencia,
    case when v_requiere and v_ajustes.pagos_en_linea
         then now() + make_interval(mins => v_ajustes.minutos_expiracion_pago) end
  )
  returning * into v_cita;

  return v_cita;
exception
  when exclusion_violation then
    raise exception 'Ese horario acaba de ocuparse, por favor elige otro';
end $$;

-- =====================================================================
-- Cancelar una cita
-- =====================================================================
create or replace function public.cancelar_cita(p_cita uuid, p_motivo text default null)
returns public.citas
language plpgsql security definer set search_path = public as $$
declare
  v_cita  citas;
  v_horas int;
begin
  select * into v_cita from citas where id = p_cita;
  if not found then
    raise exception 'Cita no encontrada';
  end if;

  if not es_admin() then
    if v_cita.cliente_id is distinct from auth.uid() then
      raise exception 'No puedes cancelar esta cita';
    end if;
    if v_cita.estado not in ('pendiente_pago', 'confirmada') then
      raise exception 'Esta cita ya no se puede cancelar';
    end if;
    select horas_cancelacion into v_horas from ajustes where id = 1;
    if v_cita.inicio - now() < make_interval(hours => v_horas) then
      raise exception 'Solo puedes cancelar hasta % horas antes. Escríbele a Ana María.', v_horas;
    end if;
  end if;

  update citas
     set estado = 'cancelada', cancelada_en = now(), motivo_cancelacion = nullif(trim(p_motivo), '')
   where id = p_cita
  returning * into v_cita;
  return v_cita;
end $$;

-- =====================================================================
-- Pagos
-- =====================================================================
-- Aplica un pago aprobado a la cita (uso interno)
create or replace function public.aplicar_pago(p_cita uuid, p_monto int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_cita citas;
begin
  update citas
     set monto_pagado = monto_pagado + p_monto,
         estado_pago  = case when monto_pagado + p_monto >= precio then 'pagado' else 'anticipo' end,
         estado       = case when estado = 'pendiente_pago' then 'confirmada' else estado end,
         expira_en    = null
   where id = p_cita
  returning * into v_cita;

  -- El pago llegó después de que el cupo se liberó por falta de anticipo:
  -- se intenta recuperar la cita; si el horario ya lo tomó otra clienta, queda marcada para devolución.
  if v_cita.estado = 'cancelada' and v_cita.motivo_cancelacion = 'El anticipo no se pagó a tiempo' then
    begin
      update citas set estado = 'confirmada', cancelada_en = null, motivo_cancelacion = null where id = p_cita;
    exception when exclusion_violation then
      update citas
         set motivo_cancelacion = 'Pago recibido después de liberar el cupo: contactar a la clienta para reprogramar o devolver'
       where id = p_cita;
    end;
  end if;
end $$;

-- Ana María registra un pago recibido por fuera (Nequi, efectivo, transferencia)
create or replace function public.registrar_pago_manual(p_cita uuid, p_monto int, p_metodo text default 'efectivo')
returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_admin() then
    raise exception 'Solo la administradora puede registrar pagos';
  end if;
  insert into pagos (cita_id, referencia, tipo, proveedor, monto, estado, metodo)
  values (p_cita, 'MAN-' || replace(gen_random_uuid()::text, '-', ''), 'saldo', 'manual', p_monto, 'aprobado', p_metodo);
  perform aplicar_pago(p_cita, p_monto);
end $$;

-- Lo llama el webhook de Wompi (solo con la llave service_role)
create or replace function public.confirmar_pago_wompi(
  p_referencia text, p_estado text, p_transaccion text, p_metodo text, p_monto int, p_detalle jsonb
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_pago pagos;
begin
  select * into v_pago from pagos where referencia = p_referencia for update;
  if not found or v_pago.estado = 'aprobado' then
    return; -- desconocido o ya procesado (Wompi puede reenviar eventos)
  end if;

  update pagos
     set estado = p_estado, transaccion_id = p_transaccion, metodo = p_metodo,
         detalle = p_detalle, actualizado_en = now()
   where id = v_pago.id;

  if p_estado = 'aprobado' then
    if p_monto <> v_pago.monto then
      update pagos set estado = 'error' where id = v_pago.id;
      raise warning 'Monto de Wompi (%) distinto al esperado (%) para %', p_monto, v_pago.monto, p_referencia;
      return;
    end if;
    perform aplicar_pago(v_pago.cita_id, v_pago.monto);
  end if;
end $$;

revoke execute on function public.aplicar_pago(uuid, int) from public, anon, authenticated;
revoke execute on function public.confirmar_pago_wompi(text, text, text, text, int, jsonb) from public, anon, authenticated;
revoke execute on function public.liberar_citas_vencidas() from public, anon;
grant execute on function public.confirmar_pago_wompi(text, text, text, text, int, jsonb) to service_role;

-- =====================================================================
-- Seguridad por filas (RLS)
-- =====================================================================
alter table public.ajustes             enable row level security;
alter table public.correos_admin       enable row level security;
alter table public.perfiles            enable row level security;
alter table public.notas_clientas      enable row level security;
alter table public.ciudades            enable row level security;
alter table public.direcciones         enable row level security;
alter table public.servicios           enable row level security;
alter table public.disenos             enable row level security;
alter table public.horario_semanal     enable row level security;
alter table public.excepciones_horario enable row level security;
alter table public.citas               enable row level security;
alter table public.pagos               enable row level security;

-- Lectura pública
create policy "ajustes: leer"   on public.ajustes   for select using (true);
create policy "ciudades: leer"  on public.ciudades  for select using (true);
create policy "horario: leer"   on public.horario_semanal for select using (true);
create policy "excepciones: leer" on public.excepciones_horario for select using (true);
create policy "servicios: leer activos" on public.servicios for select using (activo or public.es_admin());
create policy "disenos: leer activos"   on public.disenos   for select using (activo or public.es_admin());

-- Administración total para Ana María
create policy "ajustes: admin"     on public.ajustes             for update using (public.es_admin()) with check (public.es_admin());
create policy "correos: admin"     on public.correos_admin       for all using (public.es_admin()) with check (public.es_admin());
create policy "notas: admin"       on public.notas_clientas      for all using (public.es_admin()) with check (public.es_admin());
create policy "ciudades: admin"    on public.ciudades            for all using (public.es_admin()) with check (public.es_admin());
create policy "servicios: admin"   on public.servicios           for all using (public.es_admin()) with check (public.es_admin());
create policy "disenos: admin"     on public.disenos             for all using (public.es_admin()) with check (public.es_admin());
create policy "horario: admin"     on public.horario_semanal     for all using (public.es_admin()) with check (public.es_admin());
create policy "excepciones: admin" on public.excepciones_horario for all using (public.es_admin()) with check (public.es_admin());
create policy "citas: admin"       on public.citas               for all using (public.es_admin()) with check (public.es_admin());
create policy "pagos: admin"       on public.pagos               for all using (public.es_admin()) with check (public.es_admin());

-- Perfiles
create policy "perfiles: ver el propio" on public.perfiles for select using (id = auth.uid() or public.es_admin());
create policy "perfiles: editar el propio" on public.perfiles for update using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

-- Direcciones: cada clienta maneja las suyas
create policy "direcciones: propias" on public.direcciones for all
  using (cliente_id = auth.uid()) with check (cliente_id = auth.uid());
create policy "direcciones: admin ve" on public.direcciones for select using (public.es_admin());

-- Citas y pagos: la clienta solo ve los suyos (crea/cancela mediante funciones)
create policy "citas: ver propias" on public.citas for select using (cliente_id = auth.uid());
create policy "pagos: ver propios" on public.pagos for select
  using (exists (select 1 from public.citas c where c.id = cita_id and c.cliente_id = auth.uid()));

-- =====================================================================
-- Almacenamiento de fotos
-- =====================================================================
insert into storage.buckets (id, name, public) values
  ('publico', 'publico', true),          -- fotos de servicios y galería
  ('referencias', 'referencias', false)  -- fotos de referencia que suben las clientas
on conflict (id) do nothing;

create policy "publico: leer" on storage.objects for select using (bucket_id = 'publico');
create policy "publico: admin sube" on storage.objects for insert with check (bucket_id = 'publico' and public.es_admin());
create policy "publico: admin edita" on storage.objects for update using (bucket_id = 'publico' and public.es_admin());
create policy "publico: admin borra" on storage.objects for delete using (bucket_id = 'publico' and public.es_admin());

-- referencias/<id de la clienta>/archivo.jpg
create policy "referencias: subir propias" on storage.objects for insert
  with check (bucket_id = 'referencias' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "referencias: ver propias o admin" on storage.objects for select
  using (bucket_id = 'referencias' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin()));
create policy "referencias: borrar propias" on storage.objects for delete
  using (bucket_id = 'referencias' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Permisos de la API (las políticas RLS de arriba siguen decidiendo qué filas ve cada quien)
-- =====================================================================
grant usage on schema public to anon, authenticated, service_role;
grant select on public.ajustes, public.ciudades, public.servicios, public.disenos,
                public.horario_semanal, public.excepciones_horario to anon;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.horarios_disponibles(uuid, date, text) to anon, authenticated;
grant execute on function public.reservar_cita(uuid, timestamptz, uuid, text, text, uuid, text) to authenticated;
grant execute on function public.cancelar_cita(uuid, text) to authenticated;
grant execute on function public.registrar_pago_manual(uuid, int, text) to authenticated;
grant execute on function public.es_frecuente(uuid) to authenticated;
grant execute on function public.es_admin() to anon, authenticated;
