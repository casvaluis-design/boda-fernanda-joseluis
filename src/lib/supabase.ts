import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type GuestType = 'individual' | 'couple' | 'family'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined'
export type EventKey = 'civil' | 'ceremonia'
export type Accommodation = 'casa_begonias' | 'otro' | 'none'

export const EVENTS: { key: EventKey; label: string; date: string; description: string; location: string }[] = [
  {
    key:         'civil',
    label:       'Civil + Rompe Hielos',
    date:        'Viernes 16 de octubre, 2026',
    description: 'Ceremonia civil y convivio inicial',
    location:    'Jardín Alma · Jiutepec, Morelos',
  },
  {
    key:         'ceremonia',
    label:       'Ceremonia + Recepción',
    date:        'Sábado 17 de octubre, 2026',
    description: 'Ceremonia religiosa y recepción principal',
    location:    'Jardín Alma · Jiutepec, Morelos',
  },
]

export interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  guest_type: GuestType
  max_companions: number
  token: string
  status: RSVPStatus
  hotel_assignment: 'hotel_alma' | 'none'   // interno, nunca visible al invitado
  notes: string                              // notas internas, nunca visible al invitado
  created_at: string
}

export interface RSVPResponse {
  id: string
  guest_id: string
  attending: boolean
  attendee_count: number       // cuántas personas vienen (incluyendo el titular)
  allergies: string            // alergias del grupo (texto libre)
  events: EventKey[]
  accommodation: Accommodation
  message?: string
  submitted_at: string
  guest?: Guest
}

// Lazy client-side singleton (anon key — seguro en browser)
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// Server-side client (service role — solo en API routes)
export function getServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
