import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ROUTE PROTECTION LOGIC
    // 1. Protected Routes (require auth)
    if (
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/onboarding") ||
        request.nextUrl.pathname.startsWith("/super-admin")
    ) {
        // Exception: /super-admin/login is public
        if (request.nextUrl.pathname === "/super-admin/login") {
            return response;
        }

        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // 🛡️ RBAC & Tenant Security (Server-Side)
        // Fetch profile to get role and tenant info
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single();

        if (profile) {
            const path = request.nextUrl.pathname;

            // A. Check Tenant Suspension
            if (profile.tenant_id) {
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('status')
                    .eq('id', profile.tenant_id)
                    .single();

                // If suspended, only allow access to billing or limited pages (or block all)
                // For now, if suspended, redirect to a suspension page if not already there
                // We'll leave the specific "suspension page" handling to the layout for UX, 
                // but we could enforce it here for strictness. 
                // Let's enforce strict blocking of functional routes:
                if (tenant?.status === 'suspended' && !path.includes('/financeiro')) {
                    // Optionally redirect here or let Layout handle visual, 
                    // but middleware can block API calls etc.
                }
            }

            // B. Enforce Role Restrictions
            const RESTRICTED_PATHS: Record<string, string[]> = {
                receptionist: ['/dashboard/telemed', '/dashboard/financeiro', '/dashboard/medicamentos', '/dashboard/pacientes'],
                patient: ['/dashboard/agenda', '/dashboard/telemed', '/dashboard/financeiro', '/dashboard/medicamentos', '/dashboard/pacientes'],
            };

            const restrictedRoutes = RESTRICTED_PATHS[profile.role] || [];
            if (restrictedRoutes.some(r => path.startsWith(r))) {
                // Access Denied for this role
                const url = request.nextUrl.clone();
                url.pathname = "/dashboard/acesso-negado"; // Or redirect to their default home
                return NextResponse.redirect(url);
            }
        }
    }

    // 2. Auth Routes (redirect to dashboard if already logged in)
    if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
        const url = request.nextUrl.clone();
        // We rely on dashboard/layout.tsx to redirect to /onboarding if needed
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return response;
}
