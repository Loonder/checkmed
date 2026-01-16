"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    isToday, parseISO, addWeeks, subWeeks, addDays, subDays,
    startOfDay as startOfDayFn, endOfDay as endOfDayFn
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Plus, Clock, MessageCircle, User, Trash2, Video, Loader2,
    LayoutGrid, Rows3, Square, Search, Filter, X, Repeat
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Appointment, CalendarView } from "@/types";
import dynamic from "next/dynamic";
import { MonthViewSkeleton, WeekViewSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

// Dynamic Imports (Lazy Loading)
const RecurrenceModal = dynamic(() => import("@/components/RecurrenceModal").then(mod => mod.RecurrenceModal), {
    loading: () => null,
    ssr: false
});
const AppointmentModal = dynamic(() => import("@/components/AppointmentModal").then(mod => mod.AppointmentModal), {
    loading: () => null,
    ssr: false
});
import type { RecurrenceRule } from "@/types/recurrence";

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Recurrence states (novo!)
    const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);

    const [formData, setFormData] = useState({
        patient_name: "",
        phone: "",
        time: "09:00",
        duration: 60,
        notes: "",
        status: "scheduled" as Appointment['status'],
        type: "presencial" as Appointment['type'],
        meet_link: "",
        series_id: null as string | null  // Para edição de séries recorrentes
    });

    useEffect(() => {
        fetchTenantAndAppointments();
    }, [currentDate, view]);

    const fetchTenantAndAppointments = async () => {
        setLoading(true); // Show skeleton
        let currentTenantId = tenantId;
        if (!currentTenantId) {
            const { data: tenants } = await supabase.from("tenants").select("id").limit(1);
            if (tenants?.[0]) {
                currentTenantId = tenants[0].id;
                setTenantId(currentTenantId);
            }
        }

        // Fetch range based on view
        let start: string, end: string;

        if (view === 'month') {
            start = startOfMonth(currentDate).toISOString();
            end = endOfMonth(currentDate).toISOString();
        } else if (view === 'week') {
            start = startOfWeek(currentDate).toISOString();
            end = endOfWeek(currentDate).toISOString();
        } else {
            start = startOfDayFn(currentDate).toISOString();
            end = endOfDayFn(currentDate).toISOString();
        }

        let query = supabase
            .from("appointments")
            .select("*")
            .gte("start_time", start)
            .lte("start_time", end);

        if (currentTenantId) query = query.eq("tenant_id", currentTenantId);

        const { data, error } = await query;
        if (error) {
            console.error(error);
            toast.error("Erro ao carregar agenda.");
        } else {
            setAppointments(data || []);
        }
        setLoading(false); // Hide skeleton
    };

    // Helper: Remove accents for search (José -> Jose)
    const normalizeString = (str: string) => {
        return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Filtered appointments based on search and filters
    const filteredAppointments = appointments.filter(apt => {
        // Search by patient name (accent-insensitive)
        if (searchQuery) {
            const normalizedQuery = normalizeString(searchQuery);
            const normalizedName = normalizeString(apt.patient_name || '');
            if (!normalizedName.includes(normalizedQuery)) {
                return false;
            }
        }

        // Filter by status
        if (statusFilter !== 'all' && apt.status !== statusFilter) {
            return false;
        }

        // Filter by type
        if (typeFilter !== 'all' && apt.type !== typeFilter) {
            return false;
        }

        return true;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setTypeFilter("all");
    };

    const checkConflicts = (start: Date, end: Date, excludeId?: string) => {
        return appointments.some(app => {
            if (app.id === excludeId) return false;
            if (app.status === 'cancelled') return false;

            const appStart = parseISO(app.start_time);
            const appEnd = parseISO(app.end_time);

            return start < appEnd && end > appStart;
        });
    };

    const openNewModal = (date: Date, hour?: number) => {
        setSelectedDate(date);
        setEditingId(null);

        const timeStr = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : "09:00";

        setFormData({
            patient_name: "",
            phone: "",
            time: timeStr,
            duration: 60,
            notes: "",
            status: "scheduled",
            type: "presencial",
            meet_link: "",
            series_id: null
        });
        setIsModalOpen(true);
    };

    const openEditModal = (app: Appointment, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedDate(parseISO(app.start_time));
        setEditingId(app.id);

        const date = parseISO(app.start_time);
        const timeStr = format(date, 'HH:mm');
        const duration = (new Date(app.end_time).getTime() - date.getTime()) / 60000;

        setFormData({
            patient_name: app.patient_name || "",
            phone: app.patient_phone || "",
            time: timeStr,
            duration: duration,
            notes: app.notes || "",
            status: app.status,
            type: app.type || "presencial",
            meet_link: app.meet_link || "",
            series_id: (app as any).series_id || null  // 🆕 Incluir series_id!
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate) return;

        let targetTenantId = tenantId;
        if (!targetTenantId) {
            const { data: tenants } = await supabase.from("tenants").select("id").limit(1);
            if (tenants?.[0]) targetTenantId = tenants[0].id;
        }

        if (!targetTenantId) {
            toast.error("Erro: Nenhuma clínica encontrada.");
            return;
        }

        setLoading(true);

        try {
            const [hours, minutes] = formData.time.split(':').map(Number);
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + formData.duration);

            // 🆕 LÓGICA DE RECORRÊNCIA!
            let datesToCreate: Date[] = [startDateTime];

            // Se tem regra de recorrência E não está editando, gera série!
            if (recurrenceRule && recurrenceRule.frequency !== 'never' && !editingId) {
                const { generateRecurringDates } = await import('@/lib/recurrence');
                datesToCreate = generateRecurringDates(startDateTime, recurrenceRule);
            }

            // Verifica conflitos (MANTIDO NO CLIENT POR ENQUANTO PARA UX)
            if (formData.status !== 'cancelled') {
                for (const date of datesToCreate) {
                    const endDate = new Date(date);
                    endDate.setMinutes(endDate.getMinutes() + formData.duration);

                    if (checkConflicts(date, endDate, editingId || undefined)) {
                        if (!confirm(`⚠️ Existem ${datesToCreate.length > 1 ? 'conflitos em algumas datas' : 'conflito de horário'}! Deseja agendar mesmo assim?`)) {
                            setLoading(false);
                            return;
                        }
                        break;
                    }
                }
            }

            // PREPARAR PAYLOADS PARA SERVER ACTION
            let payloads = [];
            let isUpdate = false;
            let seriesId: string | null = null;

            if (editingId) {
                isUpdate = true;
                payloads.push({
                    patient_name: formData.status === 'blocked' ? 'BLOQUEADO' : formData.patient_name,
                    patient_phone: formData.phone,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: formData.status,
                    type: formData.status === 'blocked' ? 'presencial' : formData.type,
                    meet_link: formData.meet_link,
                    notes: formData.notes,
                    tenant_id: targetTenantId
                });
            } else {
                seriesId = datesToCreate.length > 1 ? crypto.randomUUID() : null;
                payloads = datesToCreate.map(date => {
                    const end = new Date(date);
                    end.setMinutes(end.getMinutes() + formData.duration);

                    return {
                        patient_name: formData.status === 'blocked' ? 'BLOQUEADO' : formData.patient_name,
                        patient_phone: formData.phone,
                        start_time: date.toISOString(),
                        end_time: end.toISOString(),
                        status: formData.status,
                        type: formData.status === 'blocked' ? 'presencial' : formData.type,
                        meet_link: formData.meet_link,
                        notes: formData.notes,
                        tenant_id: targetTenantId,
                        series_id: seriesId
                    };
                });
            }

            // CHAMAR SERVER ACTION #SECURITY
            const { saveAppointmentsAction } = await import('./actions');
            const result = await saveAppointmentsAction(payloads, targetTenantId, isUpdate, editingId || undefined);

            if (result.error) {
                throw new Error(result.error);
            }

            if (datesToCreate.length > 1) {
                toast.success(`🎉 ${datesToCreate.length} agendamentos criados com sucesso!`);
            } else {
                toast.success("Agendado!");
            }

            setRecurrenceRule(null); // Limpa regra após usar
            await fetchTenantAndAppointments();
            setIsModalOpen(false);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar agendamento");
        } finally {
            setLoading(false);
        }
    };

    // 🆕 FUNÇÃO: Deletar série inteira
    const deleteEntireSeries = async (seriesId: string) => {
        if (!window.confirm('⚠️ Tem certeza que deseja CANCELAR TODA A SÉRIE de agendamentos?\n\nIsso vai cancelar todos os agendamentos futuros desta série.')) {
            return;
        }

        setLoading(true);
        try {
            // Conta quantos appointments tem na série
            const { count } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('series_id', seriesId);

            // Deleta todos da série
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('series_id', seriesId);

            if (error) throw error;

            toast.success(`🎉 ${count || 0} agendamentos da série foram cancelados!`);
            await fetchTenantAndAppointments();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error(err);
            toast.error('Erro ao cancelar série: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Excluir permanentemente este agendamento?")) return;

        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) toast.error("Erro ao cancelar");
        else {
            setAppointments(appointments.filter(a => a.id !== id));
            toast.success("Agendamento excluído.");
            setIsModalOpen(false);
        }
    };

    const getWhatsAppLink = (phone: string, name: string, date: string, time: string) => {
        if (!phone) return "#";
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${name}, confirmamos seu agendamento na CheckMed para ${date} às ${time}. Responda Sim para confirmar.`;
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    };

    // ========== DRAG & DROP HANDLERS ==========
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, appointmentOrId: Appointment | string) => {
        // Aceita tanto appointment quanto ID (pra funcionar em todas as views)
        const id = typeof appointmentOrId === 'string' ? appointmentOrId : appointmentOrId.id;
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('appointmentId', id);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newDate: Date, newHour: number) => {
        e.preventDefault();

        const appointmentId = e.dataTransfer.getData('appointmentId');
        const appointment = appointments.find(a => a.id === appointmentId);

        if (!appointment) return;

        // Calculate new times
        const newStart = new Date(newDate);
        newStart.setHours(newHour, 0, 0, 0);

        const originalStart = parseISO(appointment.start_time);
        const originalEnd = parseISO(appointment.end_time);
        const duration = (originalEnd.getTime() - originalStart.getTime()) / 60000;

        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        // Check conflicts
        if (checkConflicts(newStart, newEnd, appointmentId)) {
            toast.error('❌ Conflito de horário! Já existe outro agendamento neste horário.');
            return;
        }

        // Optimistic update
        setAppointments(prev => prev.map(a =>
            a.id === appointmentId
                ? { ...a, start_time: newStart.toISOString(), end_time: newEnd.toISOString() }
                : a
        ));

        // Update database
        const { error } = await supabase
            .from('appointments')
            .update({
                start_time: newStart.toISOString(),
                end_time: newEnd.toISOString()
            })
            .eq('id', appointmentId);

        if (error) {
            console.error('Drag drop error:', error);
            toast.error('Erro ao reagendar. Recarregando...');
            fetchTenantAndAppointments();
        } else {
            toast.success(`✅ Reagendado para ${format(newStart, "d MMM 'às' HH:mm", { locale: ptBR })}!`);
        }
    };

    const navigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date());
        } else if (direction === 'prev') {
            if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
            else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
            else setCurrentDate(subDays(currentDate, 1));
        } else {
            if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
            else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
            else setCurrentDate(addDays(currentDate, 1));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8">
            {/* Header with Premium Design */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                                <CalendarIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    Agenda Pro
                                    <span className="text-xs font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent px-2 py-0.5 rounded border border-sky-500/20">
                                        BETA
                                    </span>
                                </h1>
                                <p className="text-slate-400 text-sm">Gerenciamento profissional de horários</p>
                            </div>
                        </div>
                    </div>

                    {/* View Selector - Premium Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1 shadow-xl">
                            <button
                                onClick={() => setView('month')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                                    view === 'month'
                                        ? "bg-white text-slate-900 shadow-lg"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden sm:inline">Mês</span>
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                                    view === 'week'
                                        ? "bg-white text-slate-900 shadow-lg"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <Rows3 className="w-4 h-4" />
                                <span className="hidden sm:inline">Semana</span>
                            </button>
                            <button
                                onClick={() => setView('day')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                                    view === 'day'
                                        ? "bg-white text-slate-900 shadow-lg"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <Square className="w-4 h-4" />
                                <span className="hidden sm:inline">Dia</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4 bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                    {/* Search Input */}
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-sm"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-auto px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
                    >
                        <option value="all">📋 Todos Status</option>
                        <option value="scheduled">🗓️ Agendado</option>
                        <option value="confirmed">✅ Confirmado</option>
                        <option value="completed">🎉 Concluído</option>
                        <option value="cancelled">❌ Cancelado</option>
                        <option value="blocked">🚫 Bloqueado</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full md:w-auto px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
                    >
                        <option value="all">📱 Todos Tipos</option>
                        <option value="presencial">🏥 Presencial</option>
                        <option value="telemed">💻 Telemedicina</option>
                    </select>

                    {/* Clear Button */}
                    {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                        <button
                            onClick={clearFilters}
                            className="p-2.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors"
                            title="Limpar filtros"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigation - Premium Style */}
                <div className="flex items-center justify-between bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl p-4 shadow-2xl">
                    <button
                        onClick={() => navigate('prev')}
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-300 hover:text-white"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white capitalize">
                            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            {view === 'week' && `Semana de ${format(startOfWeek(currentDate), 'd MMM', { locale: ptBR })}`}
                            {view === 'day' && format(currentDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                        </h2>
                        <button
                            onClick={() => navigate('today')}
                            className="px-3 py-1.5 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            Hoje
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('next')}
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors text-slate-300 hover:text-white"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </header >

            {/* Calendar Content */}
            < AnimatePresence mode="wait" >
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {loading ? (
                        // Show skeleton based on view
                        view === 'month' ? <MonthViewSkeleton /> :
                            view === 'week' ? <WeekViewSkeleton /> :
                                <WeekViewSkeleton /> // Day view uses same skeleton as week
                    ) : filteredAppointments.length === 0 && (searchQuery || statusFilter !== 'all' || typeFilter !== 'all') ? (
                        // Empty state when search/filter returns nothing
                        <EmptyState
                            illustration="search"
                            title="Nenhum resultado encontrado"
                            description="Tente buscar por outro nome ou remover os filtros aplicados."
                            actionLabel="Limpar filtros"
                            onAction={clearFilters}
                        />
                    ) : (
                        // Show actual content
                        <>
                            {view === 'month' && <MonthView
                                currentDate={currentDate}
                                appointments={filteredAppointments}
                                onDateClick={openNewModal}
                                onAppointmentClick={openEditModal}
                                handleDragStart={handleDragStart}
                                handleDragEnd={handleDragEnd}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                draggingId={draggingId}
                            />}
                            {view === 'week' && <WeekView currentDate={currentDate} appointments={filteredAppointments} onSlotClick={openNewModal} onAppointmentClick={openEditModal} handleDragStart={handleDragStart} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver} handleDrop={handleDrop} draggingId={draggingId} />}
                            {view === 'day' && <DayView
                                currentDate={currentDate}
                                appointments={filteredAppointments}
                                onSlotClick={openNewModal}
                                onAppointmentClick={openEditModal}
                                handleDragStart={handleDragStart}
                                handleDragEnd={handleDragEnd}
                                handleDragOver={handleDragOver}
                                handleDrop={handleDrop}
                                draggingId={draggingId}
                            />}
                        </>
                    )}
                </motion.div>
            </AnimatePresence >

            {/* Modal component (keeping the existing one) */}
            <AnimatePresence>
                {
                    isModalOpen && selectedDate && (
                        <AppointmentModal
                            selectedDate={selectedDate}
                            formData={formData}
                            setFormData={setFormData}
                            editingId={editingId}
                            loading={loading}
                            onClose={() => setIsModalOpen(false)}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            getWhatsAppLink={getWhatsAppLink}
                            showRecurrenceModal={showRecurrenceModal}
                            setShowRecurrenceModal={setShowRecurrenceModal}
                            recurrenceRule={recurrenceRule}
                            deleteEntireSeries={deleteEntireSeries}
                        />
                    )
                }
            </AnimatePresence >

            {/* 🆕 NOVO: SEU Modal de Recorrência! */}
            < RecurrenceModal
                isOpen={showRecurrenceModal}
                onClose={() => setShowRecurrenceModal(false)
                }
                onSave={(rule) => {
                    setRecurrenceRule(rule);
                    setShowRecurrenceModal(false);

                }}
                startDateTime={selectedDate || new Date()}
            />
        </div >
    );
}

// Month View Component
function MonthView({
    currentDate,
    appointments,
    onDateClick,
    onAppointmentClick,
    handleDragStart,     // 🆕 Drag handlers
    handleDragEnd,
    handleDragOver,
    handleDrop,
    draggingId
}: any) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-7 bg-slate-900/50 border-b border-slate-700/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="py-4 text-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day) => {
                    const dayApps = appointments.filter((a: Appointment) => isSameDay(parseISO(a.start_time), day));
                    dayApps.sort((a: Appointment, b: Appointment) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDateClick(day, 9)}
                            // 🆕 Drag & Drop - célula é droppable
                            onDragOver={(e) => handleDragOver(e, day, 9)}
                            onDrop={(e) => handleDrop(e, day, 9)}
                            className={cn(
                                "min-h-[140px] p-2 border-r border-b border-slate-800/50 transition-all cursor-pointer group relative hover:bg-sky-500/5",
                                !isCurrentMonth && "bg-slate-950/50 opacity-40",
                                isToday(day) && "bg-gradient-to-br from-emerald-500/10 to-sky-500/10 ring-1 ring-emerald-500/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all",
                                    isToday(day)
                                        ? "bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg ring-2 ring-emerald-400/50"
                                        : "text-slate-400 group-hover:text-white group-hover:bg-white/5"
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {dayApps.slice(0, 3).map((app: Appointment) => (
                                    <AppointmentCard
                                        key={app.id}
                                        appointment={app}
                                        onClick={onAppointmentClick}
                                        compact
                                        draggable={true}
                                        onDragStart={(e: any) => handleDragStart(e, app.id)}
                                        onDragEnd={handleDragEnd}
                                        draggingId={draggingId}
                                    />
                                ))}
                                {dayApps.length > 3 && (
                                    <div className="text-xs text-slate-500 font-medium pl-2">
                                        +{dayApps.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Week View Component with Timeline
function WeekView({ currentDate, appointments, onSlotClick, onAppointmentClick, handleDragStart, handleDragEnd, handleDragOver, handleDrop, draggingId }: any) {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const getAppointmentsForSlot = (day: Date, hour: number) => {
        return appointments.filter((app: Appointment) => {
            const appStart = parseISO(app.start_time);
            return isSameDay(appStart, day) && appStart.getHours() === hour;
        });
    };

    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header with days */}
            <div className="grid grid-cols-8 bg-slate-900/50 border-b border-slate-700/50 sticky top-0 z-10">
                <div className="p-4 text-center text-xs font-bold text-slate-500 uppercase">Hora</div>
                {weekDays.map(day => (
                    <div key={day.toString()} className={cn(
                        "p-4 text-center border-l border-slate-800/50",
                        isToday(day) && "bg-emerald-500/10"
                    )}>
                        <div className="text-xs font-bold text-slate-500 uppercase">
                            {format(day, 'EEE', { locale: ptBR })}
                        </div>
                        <div className={cn(
                            "text-lg font-bold mt-1",
                            isToday(day) ? "text-emerald-400" : "text-white"
                        )}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Timeline grid */}
            <div className="overflow-x-auto">
                {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group">
                        {/* Hour label */}
                        <div className="p-3 text-right pr-4 border-r border-slate-800/50">
                            <span className="text-sm font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                                {hour.toString().padStart(2, '0')}:00
                            </span>
                        </div>

                        {/* Day slots */}
                        {weekDays.map(day => {
                            const slotApps = getAppointmentsForSlot(day, hour);

                            return (
                                <div
                                    key={`${day}-${hour}`}
                                    onClick={() => onSlotClick(day, hour)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day, hour)}
                                    className={cn(
                                        "min-h-[80px] p-2 border-l border-slate-800/30 cursor-pointer transition-all relative",
                                        "hover:bg-sky-500/10 hover:ring-1 hover:ring-sky-500/30",
                                        isToday(day) && "bg-emerald-500/5"
                                    )}
                                >
                                    {slotApps.map((app: Appointment) => (
                                        <div
                                            key={app.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAppointmentClick(app, e);
                                            }}
                                            draggable={true}
                                            onDragStart={(e) => handleDragStart(e, app)}
                                            onDragEnd={handleDragEnd}
                                            className={cn(
                                                "mb-1 p-2 rounded-lg text-xs font-medium cursor-move",
                                                "bg-gradient-to-r border shadow-sm hover:shadow-md transition-all group/app",
                                                app.type === 'telemed'
                                                    ? "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30"
                                                    : "from-sky-500/20 to-indigo-500/20 border-sky-500/30 hover:from-sky-500/30 hover:to-indigo-500/30",
                                                app.status === 'blocked' && "from-slate-700/50 to-slate-600/50 border-slate-600/30",
                                                draggingId === app.id && "opacity-50 scale-95"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-white">
                                                    {format(parseISO(app.start_time), 'HH:mm')}
                                                </span>
                                                {app.type === 'telemed' && <Video className="w-3 h-3 text-emerald-400" />}
                                            </div>
                                            <div className="text-slate-200 font-medium truncate">
                                                {app.patient_name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">
                                                {app.duration_minutes || 60} min
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Day View Component with Detailed Timeline
function DayView({
    currentDate,
    appointments,
    onSlotClick,
    onAppointmentClick,
    handleDragStart,     // 🆕 Drag handlers
    handleDragEnd,
    handleDragOver,
    handleDrop,
    draggingId
}: any) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const getAppointmentsForHour = (hour: number) => {
        return appointments.filter((app: Appointment) => {
            const appStart = parseISO(app.start_time);
            return isSameDay(appStart, currentDate) && appStart.getHours() === hour;
        });
    };

    const todayAppointments = appointments.filter((app: Appointment) =>
        isSameDay(parseISO(app.start_time), currentDate)
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Timeline */}
            <div className="lg:col-span-3">
                <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-slate-900/50 border-b border-slate-700/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {todayAppointments.length} {todayAppointments.length === 1 ? 'agendamento' : 'agendamentos'}
                                </p>
                            </div>
                            {isToday(currentDate) && (
                                <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-full border border-emerald-500/30">
                                    Hoje
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="divide-y divide-slate-800/30">
                        {hours.map(hour => {
                            const hourApps = getAppointmentsForHour(hour);

                            return (
                                <div
                                    key={hour}
                                    className="grid grid-cols-12 hover:bg-slate-800/10 transition-colors group"
                                >
                                    {/* Hour Label */}
                                    <div className="col-span-2 p-4 border-r border-slate-800/30">
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">
                                                {hour.toString().padStart(2, '0')}
                                            </span>
                                            <span className="text-sm text-slate-500">:00</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div
                                        className="col-span-10 p-4 min-h-[100px] cursor-pointer"
                                        onClick={() => onSlotClick(currentDate, hour)}
                                        // 🆕 Drag & Drop support
                                        onDragOver={(e) => handleDragOver(e, currentDate, hour)}
                                        onDrop={(e) => handleDrop(e, currentDate, hour)}
                                    >
                                        {hourApps.length === 0 ? (
                                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-slate-500 flex items-center gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Clique para agendar
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {hourApps.map((app: Appointment) => (
                                                    <div
                                                        key={app.id}
                                                        // 🆕 Draggable
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, app.id)}
                                                        onDragEnd={handleDragEnd}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onAppointmentClick(app, e);
                                                        }}
                                                        className={cn(
                                                            "p-4 rounded-xl border-l-4 cursor-move transition-all",
                                                            draggingId === app.id && "opacity-50",
                                                            "bg-gradient-to-r hover:shadow-lg",
                                                            app.type === 'telemed'
                                                                ? "from-emerald-500/10 to-transparent border-emerald-500 hover:from-emerald-500/20"
                                                                : "from-sky-500/10 to-transparent border-sky-500 hover:from-sky-500/20",
                                                            app.status === 'blocked' && "from-slate-700/20 to-transparent border-slate-600"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                                    {app.patient_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-white font-bold">{app.patient_name}</h4>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                                        <span className="text-xs text-slate-400">
                                                                            {format(parseISO(app.start_time), 'HH:mm')} - {format(parseISO(app.end_time), 'HH:mm')}
                                                                        </span>
                                                                        {app.type === 'telemed' && (
                                                                            <>
                                                                                <span className="text-slate-600">•</span>
                                                                                <Video className="w-3 h-3 text-emerald-400" />
                                                                                <span className="text-xs text-emerald-400">Telemedicina</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className={cn(
                                                                "px-2 py-1 rounded-full text-xs font-bold",
                                                                app.status === 'confirmed' && "bg-emerald-500/20 text-emerald-400",
                                                                app.status === 'scheduled' && "bg-sky-500/20 text-sky-400",
                                                                app.status === 'cancelled' && "bg-red-500/20 text-red-400"
                                                            )}>
                                                                {app.status === 'confirmed' && 'Confirmado'}
                                                                {app.status === 'scheduled' && 'Agendado'}
                                                                {app.status === 'cancelled' && 'Cancelado'}
                                                            </span>
                                                        </div>
                                                        {app.notes && (
                                                            <p className="text-sm text-slate-300 mt-2 pt-2 border-t border-slate-700/50">
                                                                {app.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-4">
                <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl p-6 shadow-xl">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        Resumo do Dia
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total</span>
                            <span className="font-bold text-white">{todayAppointments.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Confirmados</span>
                            <span className="font-bold text-emerald-400">
                                {todayAppointments.filter((a: Appointment) => a.status === 'confirmed').length}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Telemedicina</span>
                            <span className="font-bold text-sky-400">
                                {todayAppointments.filter((a: Appointment) => a.type === 'telemed').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur-md border border-sky-500/20 rounded-2xl p-6 shadow-xl">
                    <h4 className="font-bold text-white mb-3">Ações Rápidas</h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => onSlotClick(currentDate, 9)}
                            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Agendamento
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

// Appointment Card Component
function AppointmentCard({ appointment, onClick, compact = false, draggable: isDraggable, onDragStart, onDragEnd, draggingId }: any) {
    const isBlocked = appointment.status === 'blocked';

    return (
        <div
            // 🆕 Draggable support
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={(e) => onClick(appointment, e)}
            className={cn(
                "text-xs p-2 rounded-lg border shadow-sm transition-all hover:shadow-md group/app relative overflow-hidden",
                isDraggable && "cursor-move",
                draggingId === appointment.id && "opacity-50",
                !isDraggable && "cursor-pointer",
                isBlocked
                    ? "bg-slate-800/50 border-slate-700 text-slate-500"
                    : "bg-gradient-to-br from-slate-800/80 to-slate-800/60 border-slate-700 hover:border-sky-500/50 hover:from-slate-800 hover:to-slate-700"
            )}
        >
            {/* Status indicator */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                appointment.status === 'confirmed' ? "bg-emerald-500" :
                    appointment.status === 'cancelled' ? "bg-red-500/50" :
                        appointment.status === 'blocked' ? "bg-slate-600" :
                            "bg-sky-500"
            )} />

            <div className="pl-2 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                    <span className={cn("font-bold font-mono text-xs", isBlocked ? "text-slate-500" : "text-sky-400")}>
                        {format(parseISO(appointment.start_time), 'HH:mm')}
                    </span>
                    {appointment.type === 'telemed' && <Video className="w-3 h-3 text-sky-400" />}
                </div>
                <span className={cn("truncate font-medium text-xs", appointment.status === 'cancelled' && "line-through opacity-50")}>
                    {appointment.patient_name || "Sem nome"}
                </span>
            </div>
        </div>
    );
}

// AppointmentModal moved to src/components/AppointmentModal.tsx
