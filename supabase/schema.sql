-- ══════════════════════════════════════════════════════════════════
-- NEWFIX — Schema completo de base de datos
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ══════════════════════════════════════════════════════════════════

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ── TABLA: clientes ────────────────────────────────────────────────
create table public.clientes (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz default now() not null,
  nombre              text not null,
  rubro               text not null,
  plan                text not null check (plan in ('basico','pro','premium')),
  telefono            text,
  email               text,
  cuit                text,
  facturacion_estimada numeric(12,2) default 0,
  estado_syh          text default 'ok' check (estado_syh in ('ok','warn','risk')),
  vence_syh           date,
  art                 text default 'Vigente',
  habilitacion        text default 'Vigente',
  iso_estado          text default 'No iniciado',
  notas               text,
  activo              boolean default true,
  user_id             uuid references auth.users(id) on delete set null
);

-- ── TABLA: trabajos ────────────────────────────────────────────────
create table public.trabajos (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now() not null,
  cliente_id    uuid not null references public.clientes(id) on delete cascade,
  titulo        text not null,
  cliente_final text,
  descripcion   text,
  etapa         text not null default 'llamado'
                check (etapa in ('llamado','visita','presupuesto','trabajo','factura','cobro')),
  estado        text not null default 'activo'
                check (estado in ('activo','completado','cancelado')),
  monto         numeric(12,2),
  fecha_visita  date,
  fecha_inicio  date,
  fecha_fin     date,
  notas         text
);

-- ── TABLA: facturas ────────────────────────────────────────────────
create table public.facturas (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now() not null,
  cliente_id        uuid not null references public.clientes(id) on delete cascade,
  numero            text not null,
  monto             numeric(12,2) not null,
  fecha_emision     date not null default current_date,
  fecha_vencimiento date,
  estado            text not null default 'pendiente'
                    check (estado in ('borrador','pendiente','cobrada','atrasada')),
  concepto          text,
  metodo_pago       text default 'transferencia'
);

-- ── TABLA: tareas ──────────────────────────────────────────────────
create table public.tareas (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz default now() not null,
  cliente_id   uuid references public.clientes(id) on delete set null,
  texto        text not null,
  categoria    text default 'admin'
               check (categoria in ('syh','factura','cobro','trabajo','admin')),
  prioridad    text default 'media'
               check (prioridad in ('alta','media','baja')),
  fecha_limite date,
  completada   boolean default false,
  notas        text
);

-- ── TABLA: compliance ──────────────────────────────────────────────
create table public.compliance (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz default now() not null,
  cliente_id        uuid not null references public.clientes(id) on delete cascade,
  tipo              text not null
                    check (tipo in ('syh','art','habilitacion','iso','afip')),
  descripcion       text,
  fecha_vencimiento date,
  estado            text default 'vigente'
                    check (estado in ('vigente','por_vencer','vencido','renovado')),
  notas             text
);

-- ── TABLA: client_users (link entre auth.users y clientes) ─────────
create table public.client_users (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now() not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  role       text not null default 'client' check (role in ('operator','client')),
  unique(user_id, cliente_id)
);

-- ══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════

alter table public.clientes   enable row level security;
alter table public.trabajos   enable row level security;
alter table public.facturas   enable row level security;
alter table public.tareas     enable row level security;
alter table public.compliance enable row level security;
alter table public.client_users enable row level security;

-- Función helper para saber si el usuario es operador
create or replace function public.is_operator()
returns boolean as $$
  select exists (
    select 1 from public.client_users
    where user_id = auth.uid() and role = 'operator'
  );
$$ language sql security definer;

-- Función helper para obtener el cliente_id del usuario actual
create or replace function public.my_cliente_id()
returns uuid as $$
  select cliente_id from public.client_users
  where user_id = auth.uid() and role = 'client'
  limit 1;
$$ language sql security definer;

-- ── POLICIES: clientes ─────────────────────────────────────────────
create policy "Operadores ven todos los clientes"
  on public.clientes for select
  using (public.is_operator());

create policy "Clientes ven solo su registro"
  on public.clientes for select
  using (id = public.my_cliente_id());

create policy "Solo operadores insertan clientes"
  on public.clientes for insert
  with check (public.is_operator());

create policy "Solo operadores actualizan clientes"
  on public.clientes for update
  using (public.is_operator());

-- ── POLICIES: trabajos ─────────────────────────────────────────────
create policy "Operadores ven todos los trabajos"
  on public.trabajos for select
  using (public.is_operator());

create policy "Clientes ven sus trabajos"
  on public.trabajos for select
  using (cliente_id = public.my_cliente_id());

create policy "Solo operadores gestionan trabajos"
  on public.trabajos for all
  using (public.is_operator());

-- ── POLICIES: facturas ─────────────────────────────────────────────
create policy "Operadores ven todas las facturas"
  on public.facturas for select
  using (public.is_operator());

create policy "Clientes ven sus facturas"
  on public.facturas for select
  using (cliente_id = public.my_cliente_id());

create policy "Solo operadores gestionan facturas"
  on public.facturas for all
  using (public.is_operator());

-- ── POLICIES: tareas ───────────────────────────────────────────────
create policy "Operadores gestionan todas las tareas"
  on public.tareas for all
  using (public.is_operator());

-- ── POLICIES: compliance ───────────────────────────────────────────
create policy "Operadores ven todo compliance"
  on public.compliance for select
  using (public.is_operator());

create policy "Clientes ven su compliance"
  on public.compliance for select
  using (cliente_id = public.my_cliente_id());

create policy "Solo operadores gestionan compliance"
  on public.compliance for all
  using (public.is_operator());

-- ── POLICIES: client_users ─────────────────────────────────────────
create policy "Usuarios ven su propio registro"
  on public.client_users for select
  using (user_id = auth.uid());

create policy "Operadores ven todos"
  on public.client_users for select
  using (public.is_operator());

-- ══════════════════════════════════════════════════════════════════
-- DATOS DE EJEMPLO
-- ══════════════════════════════════════════════════════════════════

insert into public.clientes (nombre, rubro, plan, telefono, email, cuit, facturacion_estimada, estado_syh, vence_syh, art, habilitacion, iso_estado, notas) values
  ('Gomez Instalaciones', 'Electricidad', 'pro', '+54 9 11 4523-8870', 'gomez@instal.com.ar', '20-28341122-4', 850000, 'ok', '2025-06-30', 'Vigente', 'Vigente', 'En proceso', 'Cliente desde enero. Quiere ISO en Q3.'),
  ('Peralta HVAC', 'Aire acondicionado', 'premium', '+54 9 11 6671-2234', 'peralta.hvac@gmail.com', '23-31122334-9', 1200000, 'warn', '2025-05-31', 'Por renovar', 'Vigente', 'Certificado', 'ART próxima a vencer. Cobro atrasado.'),
  ('Torres Electricidad', 'Electricista matriculado', 'basico', '+54 9 11 3341-9920', 'torrelectr@hotmail.com', '27-20567891-3', 480000, 'risk', '2025-02-28', 'Vencida', 'Vencida', 'No iniciado', 'ART y habilitación vencidas.'),
  ('Fernandez Climatización', 'HVAC / Refrigeración', 'pro', '+54 9 11 5589-3301', 'fernandez.clima@gmail.com', '20-33778890-1', 760000, 'ok', '2025-09-30', 'Vigente', 'Vigente', 'En proceso', 'Incorporado en marzo.')
on conflict do nothing;
