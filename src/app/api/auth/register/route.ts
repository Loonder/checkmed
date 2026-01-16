
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { isValidEmail, validatePassword, sanitizeText } from "@/lib/validations";

export async function POST(req: NextRequest) {
    try {
        // 1. Rate Limiting
        const clientIP = getClientIP(req.headers);
        const limit = checkRateLimit(`register:${clientIP}`, RATE_LIMITS.AUTH);

        if (!limit.success) {
            return NextResponse.json(
                { error: "Muitas tentativas. Tente novamente em alguns minutos." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { email, password, name, clinicName } = body;

        // 2. Validation
        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: "Email inválido" }, { status: 400 });
        }

        const passStrength = validatePassword(password);
        if (!passStrength.isValid) {
            return NextResponse.json({
                error: "Senha fraca",
                details: passStrength.feedback
            }, { status: 400 });
        }

        if (!name || name.trim().length < 3) {
            return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
        }

        // 3. Create User in Supabase (Server-side to prevent tampering)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use Service Role Key for admin tasks
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Sanitization
        const safeName = sanitizeText(name);
        const safeClinicName = clinicName ? sanitizeText(clinicName) : null;

        // Sign Up User
        // Note: Using admin.createUser ensures we can set `email_confirm: true` if we want,
        // or handle metadata securely without client-side spoofing.
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for this SaaS demo, change for prod
            user_metadata: {
                full_name: safeName,
                // Do NOT set sensitive roles here if you can avoid it, 
                // but since we need a role for RLS, we set 'doctor' only if they are creating a clinic.
                // For safety, let's default to 'doctor' (SaaS owner) but ensure they create a Tenant next.
                role: 'doctor'
            }
        });

        if (userError) throw userError;
        const user = userData.user;

        // 4. Create Tenant (Clinic) for this Doctor
        if (user && safeClinicName) {
            // Generate slug
            const slug = safeClinicName
                .toLowerCase()
                .normalize('NFD') // Remove accents
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, '-') // Replace special chars with hyphen
                .replace(/-+/g, '-') // Remove duplicate hyphens
                .replace(/^-|-$/g, ''); // Remove start/end hyphens

            const uniqueSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

            const { error: tenantError } = await supabase
                .from('tenants')
                .insert({
                    name: safeClinicName,
                    slug: uniqueSlug,
                    owner_id: user.id,
                    status: 'active',
                    plan: 'trial'
                });

            if (tenantError) {
                // If tenant creation fails, we might want to rollback user creation
                // But for now, just log it. Real-world needs a transaction or cleanup.
                console.error("Failed to create tenant:", tenantError);
                return NextResponse.json({ error: "Erro ao criar clínica." }, { status: 500 });
            }

            // Update user profile with tenant_id if needed (or rely on triggers)
            await supabase
                .from('profiles')
                .update({
                    tenant_id: (await supabase.from('tenants').select('id').eq('slug', uniqueSlug).single()).data?.id,
                    role: 'doctor'
                })
                .eq('id', user.id);
        }

        return NextResponse.json({ success: true, user: { email: user?.email } });

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno ao criar conta" },
            { status: 500 }
        );
    }
}
