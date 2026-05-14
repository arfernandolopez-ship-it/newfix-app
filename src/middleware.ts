import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Rutas públicas
  if (path === '/login' || path === '/') {
    if (user) {
      // Si ya está logueado, redirigir según rol
      const { data: clientUser } = await supabase
        .from('client_users')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (clientUser?.role === 'operator') {
        return NextResponse.redirect(new URL('/operator/dashboard', request.url))
      } else if (clientUser?.role === 'client') {
        return NextResponse.redirect(new URL('/client/inicio', request.url))
      }
    }
    return supabaseResponse
  }

  // Rutas protegidas
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar rol para rutas de operador
  if (path.startsWith('/operator')) {
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (clientUser?.role !== 'operator') {
      return NextResponse.redirect(new URL('/client/inicio', request.url))
    }
  }

  // Verificar rol para rutas de cliente
  if (path.startsWith('/client')) {
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!clientUser) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
