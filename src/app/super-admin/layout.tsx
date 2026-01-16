"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [pathname]);

    const checkAuth = async () => {
        // 1. Allow access to Login Page without checks
        if (pathname === "/super-admin/login") {
            setAuthorized(true);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in -> Redirect to Admin Login
                router.push("/super-admin/login");
                return;
            }

            // 2. Check Database for Super Admin status OR Local Flag
            // (The local flag allows instant access after PIN entry without requiring a DB Schema migration)
            const isLocalSuperAdmin = typeof window !== 'undefined' && localStorage.getItem("checkmed_super_admin") === "true";

            if (isLocalSuperAdmin) {
                setAuthorized(true);
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("is_super_admin")
                .eq("id", user.id)
                .single();

            if (error || !profile?.is_super_admin) {
                // Logged in but not Admin -> Kick out
                toast.error("Acesso Negado. Área restrita a Super Admins.");
                router.push("/dashboard"); // Or home
                return;
            }

            // Success
            setAuthorized(true);

        } catch (error) {
            console.error(error);
            router.push("/super-admin/login");
        }
    };

    // Show Loader while checking (unless it's the login page, render immediately to avoid flash)
    if (!authorized && pathname !== "/super-admin/login") {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Verificando credenciais...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
