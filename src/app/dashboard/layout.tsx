"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Lock, CreditCard, AlertTriangle } from "lucide-react";

// Routes restricted by role
const RESTRICTED_PATHS: Record<string, string[]> = {
    receptionist: [
        '/dashboard/telemed',
        '/dashboard/financeiro',
        '/dashboard/medicamentos',
        '/dashboard/pacientes',
    ],
    patient: [
        '/dashboard/agenda',
        '/dashboard/telemed',
        '/dashboard/financeiro',
        '/dashboard/medicamentos',
        '/dashboard/pacientes',
    ],
};

// Default redirect for each role
const ROLE_DEFAULTS: Record<string, string> = {
    receptionist: '/dashboard/recepcao',
    doctor: '/dashboard',
    admin: '/dashboard',
    patient: '/dashboard',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [status, setStatus] = useState<'loading' | 'active' | 'suspended' | 'redirecting'>('loading');

    useEffect(() => {
        checkTenantStatus();
    }, [pathname]);

    const checkTenantStatus = async () => {
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 2. Get User Profile to check Role
            const { data: profile } = await supabase
                .from("profiles")
                .select("role, tenant_id")
                .eq("id", user.id)
                .single();

            // If no profile or no role, redirect to Onboarding
            if (!profile || !profile.role) {
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/onboarding')) {
                    window.location.href = '/onboarding';
                }
                return;
            }

            const role = profile.role as keyof typeof RESTRICTED_PATHS;

            // 3. Role-based Route Protection
            const restrictedForRole = RESTRICTED_PATHS[role] || [];
            const isRestricted = restrictedForRole.some(p => pathname?.startsWith(p));

            if (isRestricted) {
                setStatus('redirecting');
                const defaultPath = ROLE_DEFAULTS[role] || '/dashboard';
                window.location.href = defaultPath;
                return;
            }

            // 4. Redirect receptionist to their dashboard if on main dashboard
            if (role === 'receptionist' && pathname === '/dashboard') {
                setStatus('redirecting');
                window.location.href = '/dashboard/recepcao';
                return;
            }

            // 5. Get Tenant Status
            if (profile.tenant_id) {
                const { data: tenant } = await supabase
                    .from("tenants")
                    .select("status")
                    .eq("id", profile.tenant_id)
                    .single();

                if (tenant?.status === 'suspended') {
                    setStatus('suspended');
                    return;
                }
            }

            setStatus('active');

        } catch (e) {
            console.error(e);
            setStatus('active');
        }
    };

    if (status === 'loading' || status === 'redirecting') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-500">Carregando...</div>
            </div>
        );
    }

    if (status === 'suspended') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="text-center max-w-lg">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-rose-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Acesso Suspenso</h1>
                    <p className="text-slate-400 mb-8 text-lg">
                        O acesso a este ambiente foi temporariamente bloqueado devido a pendências financeiras ou administrativas.
                    </p>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8">
                        <div className="flex items-center gap-3 text-amber-500 font-bold mb-2">
                            <AlertTriangle className="w-5 h-5" /> Importante
                        </div>
                        <p className="text-slate-400 text-sm text-left">
                            Seus dados estão seguros e nenhum dado foi perdido. Para restabelecer o acesso imediato, entre em contato com o administrador.
                        </p>
                    </div>

                    <a
                        href="https://wa.me/5511999999999"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition w-full"
                    >
                        <CreditCard className="w-5 h-5" /> Regularizar Acesso
                    </a>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 text-slate-500 hover:text-white text-sm underline"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
