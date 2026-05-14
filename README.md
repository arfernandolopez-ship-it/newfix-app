# NewFix — Guía de instalación y deploy

## Stack técnico
- **Frontend**: Next.js 14 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL + Auth + RLS)
- **Deploy**: Vercel
- **Costo total**: $0 para empezar

---

## PASO 1 — Crear la base de datos en Supabase (15 min)

1. Ir a **supabase.com** → Crear cuenta gratuita
2. Crear nuevo proyecto → Nombre: `newfix` → Región: South America (São Paulo)
3. Esperar que el proyecto esté listo (~2 min)
4. Ir a **SQL Editor** → **New Query**
5. Pegar el contenido completo de `supabase/schema.sql`
6. Clic en **Run** → Esperar confirmación

Esto crea:
- Tablas: `clientes`, `trabajos`, `facturas`, `tareas`, `compliance`, `client_users`
- Políticas de seguridad (RLS) — cada usuario ve solo sus datos
- Datos de ejemplo con 4 clientes

---

## PASO 2 — Crear usuarios de prueba (10 min)

En Supabase → **Authentication** → **Users** → **Add user**:

### Usuario operador (vos y tu equipo NewFix)
- Email: `operador@newfix.com.ar`
- Password: (elegís vos)

Después en SQL Editor, correr:
```sql
-- Primero obtener el ID del usuario recién creado
SELECT id FROM auth.users WHERE email = 'operador@newfix.com.ar';

-- Insertar como operador (reemplazá el UUID)
INSERT INTO public.client_users (user_id, cliente_id, role)
SELECT 'UUID-DEL-USUARIO', id, 'operator'
FROM public.clientes
WHERE nombre = 'Peralta HVAC'; -- cliente cualquiera
```

### Usuario cliente (el profesional)
- Email: `peralta@newfix.com.ar`
- Password: (elegís vos)

Después en SQL Editor:
```sql
SELECT id FROM auth.users WHERE email = 'peralta@newfix.com.ar';

INSERT INTO public.client_users (user_id, cliente_id, role)
SELECT 'UUID-DEL-USUARIO', id, 'client'
FROM public.clientes
WHERE nombre = 'Peralta HVAC';
```

---

## PASO 3 — Configurar variables de entorno locales (5 min)

1. Copiar `.env.local.example` → `.env.local`
2. En Supabase → Settings → API:
   - Copiar **Project URL** → pegar en `NEXT_PUBLIC_SUPABASE_URL`
   - Copiar **anon public key** → pegar en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## PASO 4 — Instalar y correr localmente (5 min)

```bash
# Instalar dependencias
npm install

# Correr en modo desarrollo
npm run dev

# Abrir en el navegador
# Panel operador: http://localhost:3000/login (con operador@newfix.com.ar)
# Panel cliente: misma URL, loguearse con peralta@newfix.com.ar
```

---

## PASO 5 — Deploy en Vercel (10 min)

1. Subir el código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit NewFix"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/newfix-app.git
git push -u origin main
```

2. Ir a **vercel.com** → Importar el repositorio
3. En "Environment Variables" agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
4. Clic en **Deploy** → En 2 minutos tenés la URL pública

---

## Estructura del proyecto

```
newfix-app/
├── src/
│   ├── app/
│   │   ├── login/           → Página de login (ambos roles)
│   │   ├── operator/        → Panel del operador NewFix
│   │   │   ├── layout.tsx   → Sidebar + navegación
│   │   │   ├── dashboard/   → Vista general
│   │   │   ├── clientes/    → Lista y detalle de clientes
│   │   │   ├── pipeline/    → Kanban 6 etapas
│   │   │   ├── agenda/      → Agenda semanal
│   │   │   ├── tareas/      → Gestión de tareas
│   │   │   ├── compliance/  → Semáforo SyH & ISO
│   │   │   └── facturas/    → Facturas NewFix
│   │   └── client/          → Panel del profesional (mobile)
│   │       ├── layout.tsx   → Bottom nav mobile
│   │       ├── inicio/      → Home del cliente
│   │       ├── trabajos/    → Sus trabajos con flujo 6 pasos
│   │       ├── agenda/      → Su agenda
│   │       ├── clientes/    → Sus clientes
│   │       └── cobros/      → Sus cobros
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts    → Cliente Supabase (browser)
│   │   │   └── server.ts    → Cliente Supabase (server)
│   │   └── utils.ts         → Funciones helpers
│   ├── types/index.ts        → Tipos TypeScript
│   └── middleware.ts         → Auth routing
├── supabase/
│   └── schema.sql            → SQL completo de la BD
├── .env.local.example        → Template de variables de entorno
└── package.json
```

---

## URLs de acceso

| Rol | URL | Descripción |
|-----|-----|-------------|
| Operador | `/operator/dashboard` | Panel web completo con sidebar |
| Cliente | `/client/inicio` | App mobile con bottom nav |
| Login | `/login` | Único punto de entrada, redirige según rol |

---

## Próximos pasos (v2)

- [ ] Formularios de alta de clientes y trabajos conectados a BD
- [ ] Módulo de agenda con calendario real
- [ ] Notificaciones automáticas por email (Supabase Edge Functions)
- [ ] Carga de documentos (SyH, ART) con Supabase Storage
- [ ] Clientes finales del profesional en BD
- [ ] App móvil nativa (React Native + mismo Supabase)
- [ ] Módulo de presupuestos en PDF
