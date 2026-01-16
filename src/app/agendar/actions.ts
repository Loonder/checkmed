"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeText, isValidBrazilianPhone } from "@/lib/validations";
import { addDays, startOfDay, parseISO, format } from "date-fns";
import { headers } from "next/headers";

export async function bookPublicAppointment(
    tenantSlug: string,
    serviceType: 'presencial' | 'telemed',
    dateString: string,
    timeString: string,
    patientData: { name: string; phone: string; cpf?: string }
) {
    const supabase = await createClient();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";

    // 1. Rate Limiting (Public Form)
    const { success } = checkRateLimit(ip, RATE_LIMITS.PUBLIC_FORM);
    if (!success) {
        return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
    }

    // 2. Resolve Tenant
    const { data: tenant } = await supabase
        .from("tenants")
        .select("id, name")
        .eq("slug", tenantSlug)
        .single();

    if (!tenant) return { error: "Clínica não encontrada." };

    // 3. Validation & Sanitization
    const name = sanitizeText(patientData.name);
    const phone = patientData.phone.replace(/\D/g, ''); // Basic clean

    if (!name || name.length < 3) return { error: "Nome inválido." };
    if (!phone || phone.length < 10) return { error: "Telefone inválido." }; // Basic length check

    // 4. Time Slot Validation (Server Side)
    // Re-check if slot is actually available to prevent race conditions/manipulation
    const appointmentDate = new Date(dateString);
    const [hours, minutes] = timeString.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const startISO = appointmentDate.toISOString();

    // 🛡️ Security: Prevent past booking
    if (appointmentDate < new Date()) {
        return { error: "Não é possível agendar no passado." };
    }

    const endISO = new Date(appointmentDate.getTime() + 60 * 60 * 1000).toISOString(); // 1h duration

    // Check overlaps
    const { data: overrides } = await supabase
        .from("appointments")
        .select("id")
        .eq("tenant_id", tenant.id)
        .neq("status", "cancelled")
        .lt("start_time", endISO)
        .gt("end_time", startISO);

    if (overrides && overrides.length > 0) {
        return { error: "Desculpe, este horário acabou de ser reservado." };
    }

    // 5. Insert
    const payload = {
        patient_name: name,
        patient_phone: patientData.phone, // Keep original format for display if preferred, or standard
        start_time: startISO,
        end_time: endISO,
        status: 'scheduled',
        type: serviceType,
        tenant_id: tenant.id,
        notes: `Agendamento Online (${serviceType === 'telemed' ? 'Telemedicina' : 'Presencial'}) - IP: ${ip}`
    };

    const { error } = await supabase.from("appointments").insert([payload]);

    if (error) {
        console.error("Public Booking Error:", error);
        return { error: "Erro ao salvar agendamento." };
    }

    return { success: true, tenantName: tenant.name };
}
