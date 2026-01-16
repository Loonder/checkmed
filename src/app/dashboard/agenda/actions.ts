"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeText, isValidBrazilianPhone } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function saveAppointmentsAction(
    payloads: any[],
    tenantId: string,
    isUpdate: boolean = false,
    updateId?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autenticado" };
    }

    // 1. Verify access to tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    // Strict RBAC: User must belong to the tenant they are trying to write to
    // Or be a super-admin (not handled here yet)
    if (profile?.tenant_id && profile.tenant_id !== tenantId) {
        return { error: "Acesso negado a esta clínica: ID incompatível." };
    }
    // If profile has no tenant_id, they might be an owner setting up? 
    // Or we rely on RLS. But explicitly checking is safer.

    try {
        // 2. Sanitize and Validate Payloads
        const cleanPayloads = payloads.map(p => {
            return {
                ...p,
                patient_name: sanitizeText(p.patient_name || ''),
                notes: p.notes ? sanitizeText(p.notes) : null,
                tenant_id: tenantId,
                // Ensure critical fields are preserved and safe
                patient_phone: isValidBrazilianPhone(p.patient_phone) ? p.patient_phone : p.patient_phone.replace(/\D/g, ''), // Best effort clean or validate
                start_time: p.start_time,
                end_time: p.end_time,
                status: p.status,
                type: p.type,
                meet_link: p.meet_link, // URL validation ideally
                series_id: p.series_id
            };
        });

        // 3. Perform DB Operation
        if (isUpdate && updateId && cleanPayloads.length === 1) {
            const { error } = await supabase
                .from("appointments")
                .update(cleanPayloads[0])
                .eq("id", updateId)
                .eq("tenant_id", tenantId); // Extra safety
            if (error) throw error;
        } else {
            // Bulk insert for recurrence or single create
            const { error } = await supabase
                .from("appointments")
                .insert(cleanPayloads);
            if (error) throw error;
        }

        revalidatePath("/dashboard/agenda");
        return { success: true };

    } catch (error: any) {
        console.error("Save Appointment Error:", error);
        return { error: error.message || "Erro ao salvar agendamento." };
    }
}
