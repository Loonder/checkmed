// Type definitions for CheckMed application

// Database types
export interface Tenant {
    id: string
    name: string
    slug: string
    plan: 'trial' | 'basic' | 'professional' | 'enterprise'
    status: 'active' | 'suspended' | 'cancelled'
    owner_id: string
    settings: Record<string, any>
    created_at: string
    updated_at: string
}

export interface Profile {
    id: string
    full_name: string | null
    role: 'patient' | 'doctor' | 'admin' | 'receptionist'
    specialty: string | null
    crm: string | null
    phone: string | null
    tenant_id: string | null
    created_at: string
    updated_at: string
}

export interface Appointment {
    id: string
    patient_name: string
    patient_id: string | null
    patient_phone: string | null
    patient_email: string | null
    doctor_id: string | null
    start_time: string
    end_time: string
    duration_minutes?: number
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'blocked'
    type: 'presencial' | 'telemed'
    meet_link: string | null
    notes: string | null
    cancellation_reason: string | null
    tenant_id: string
    created_at: string
    updated_at: string
}

export interface Checkin {
    id: string
    patient_name: string
    patient_cpf: string | null
    patient_phone: string | null
    symptoms: string | null
    pain_level: number
    status: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    tenant_id: string
    assigned_doctor_id: string | null
    created_at: string
    updated_at: string
}

export interface MedicalRecord {
    id: string
    checkin_id: string | null
    appointment_id: string | null
    patient_name: string
    doctor_id: string | null
    doctor_name: string
    diagnosis: string | null
    prescription: string | null
    notes: string | null
    attachments: any[]
    is_ai_generated: boolean
    tenant_id: string
    created_at: string
    updated_at: string
}

export interface Medication {
    id: string
    name: string
    description: string | null
    category: string | null
    dosage: string | null
    price: number | null
    stock: number
    min_stock: number
    image_url: string | null
    is_controlled: boolean
    tenant_id: string
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    status: 'pending' | 'paid' | 'scheduled' | 'cancelled'
    payment_method: string | null
    reference_id: string | null
    date: string
    due_date: string | null
    tenant_id: string
    created_by: string | null
    created_at: string
    updated_at: string
}

// View types for Agenda
export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    type: Appointment['type']
    status: Appointment['status']
    patient: string
    phone?: string
    notes?: string
    meetLink?: string
}

// UI Component Props
export interface AppointmentCardProps {
    appointment: Appointment
    onEdit: (appointment: Appointment) => void
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: Appointment['status']) => void
}

export interface CalendarHeaderProps {
    currentDate: Date
    view: CalendarView
    onViewChange: (view: CalendarView) => void
    onNavigate: (direction: 'prev' | 'next' | 'today') => void
}
