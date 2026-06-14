# Setup — Boda Fernanda & Jose Luis

## 1. Crear proyecto Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un nuevo proyecto (nombre: `boda-fernanda-joseluis`)
3. En **SQL Editor**, pega y ejecuta todo el contenido de `supabase-schema.sql`

## 2. Obtener credenciales

En tu proyecto Supabase → **Settings → API**:

- `Project URL` → pégalo en `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`
- `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Configurar `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=tu-contraseña-segura
NEXT_PUBLIC_ADMIN_PASSWORD=tu-contraseña-segura  ← misma que arriba
NEXT_PUBLIC_BASE_URL=https://tudominio.com       ← cuando despliegues
```

## 4. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 5. Rutas

| URL | Descripción |
|-----|-------------|
| `/` | Invitación digital |
| `/rsvp/demo` | Formulario RSVP (modo demo sin Supabase) |
| `/rsvp/[token]` | Formulario RSVP personalizado por invitado |
| `/admin` | Panel de administración (contraseña: `boda2025admin`) |

## 6. Agregar invitados

**Opción A — Panel admin:**  
Ve a `/admin` → botón "Agregar invitado"

**Opción B — SQL directo en Supabase:**
```sql
INSERT INTO guests (name, email, guest_type, max_companions) VALUES
  ('Nombre Apellido', 'email@ejemplo.com', 'individual', 0),
  ('Pareja Apellido', 'email@ejemplo.com', 'couple', 1),
  ('Familia Apellido', 'email@ejemplo.com', 'family', 4);
```

Después de insertar, copia el `token` de cada invitado y envíales el link:
`https://tudominio.com/rsvp/TOKEN`

## 7. Desplegar en Vercel (gratis)

```bash
npx vercel
```

O conecta el repositorio en https://vercel.com y agrega las variables de `.env.local`
en **Settings → Environment Variables**.

## Tipos de invitado

| Tipo | `guest_type` | `max_companions` |
|------|-------------|-----------------|
| Individual | `individual` | `0` |
| Pareja | `couple` | `1` |
| Familia de 5 | `family` | `4` (4 acompañantes además del titular) |
