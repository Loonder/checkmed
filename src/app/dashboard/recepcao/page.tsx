/**
 * 🏥 Receptionist Dashboard
 * 
 * Main interface for receptionists with:
 * - Real-time queue management
 * - Check-in form
 * - Today's appointments (view-only)
 */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Users,
    UserPlus,
    Clock,
    Phone,
    AlertCircle,
    CheckCircle2,
    PlayCircle,
    ChevronRight,
    Calendar,
    Activity,
    LogOut,
    Volume2,
} from "lucide-react";
import type { Checkin, Appointment } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RecepcaoPage() {
    const router = useRouter();
    const [queue, setQueue] = useState<Checkin[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [clinicName, setClinicName] = useState("");

    // Check-in form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patient_name: "",
        patient_phone: "",
        symptoms: "",
        priority: "normal" as Checkin["priority"],
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
        setupRealtime();
    }, []);

    const loadData = async () => {
        try {
            // Get user info
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, tenant_id")
                .eq("id", user.id)
                .single();

            if (profile) {
                setUserName(profile.full_name || user.email?.split("@")[0] || "");

                // Get clinic name
                if (profile.tenant_id) {
                    const { data: tenant } = await supabase
                        .from("tenants")
                        .select("name")
                        .eq("id", profile.tenant_id)
                        .single();
                    if (tenant) setClinicName(tenant.name);
                }
            }

            // Get queue
            const { data: checkins } = await supabase
                .from("checkins")
                .select("*")
                .in("status", ["waiting", "in_progress"])
                .order("created_at", { ascending: true });

            setQueue(checkins || []);

            // Get today's appointments
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data: appointments } = await supabase
                .from("appointments")
                .select("*")
                .gte("start_time", today.toISOString())
                .lt("start_time", tomorrow.toISOString())
                .order("start_time", { ascending: true });

            setTodayAppointments(appointments || []);

        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtime = () => {
        const channel = supabase
            .channel("recepcao-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "checkins" },
                () => loadData()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "appointments" },
                () => loadData()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    };

    const handleCheckin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_name) return;
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from("profiles")
                .select("tenant_id")
                .eq("id", user?.id)
                .single();

            const { error } = await supabase.from("checkins").insert({
                patient_name: formData.patient_name,
                patient_phone: formData.patient_phone,
                symptoms: formData.symptoms,
                priority: formData.priority,
                status: "waiting",
                tenant_id: profile?.tenant_id,
            });

            if (error) throw error;

            toast.success("Paciente adicionado à fila!");
            setFormData({ patient_name: "", patient_phone: "", symptoms: "", priority: "normal" });
            setShowForm(false);
            loadData();
        } catch (error: any) {
            toast.error("Erro ao adicionar: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const callPatient = async (checkin: Checkin) => {
        try {
            await supabase
                .from("checkins")
                .update({ status: "in_progress" })
                .eq("id", checkin.id);

            // Announce via TTS
            if ("speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(
                    `Paciente ${checkin.patient_name}, comparecer ao consultório.`
                );
                utterance.lang = "pt-BR";
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }

            toast.success(`Chamando ${checkin.patient_name}!`);
            loadData();
        } catch (error: any) {
            toast.error("Erro ao chamar paciente");
        }
    };

    const completeCheckin = async (id: string) => {
        try {
            await supabase
                .from("checkins")
                .update({ status: "completed" })
                .eq("id", id);
            loadData();
            toast.success("Atendimento concluído!");
        } catch (error) {
            toast.error("Erro ao concluir");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const waitingCount = queue.filter(c => c.status === "waiting").length;
    const inProgressCount = queue.filter(c => c.status === "in_progress").length;

    const priorityColors: Record<string, string> = {
        low: "bg-slate-500",
        normal: "bg-emerald-500",
        high: "bg-amber-500",
        urgent: "bg-rose-500",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-500">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500/20 p-2.5 rounded-xl">
                        <Activity className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Recepção</h1>
                        <p className="text-sm text-slate-400">{clinicName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-lg">
                            {format(new Date(), "HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                    <span className="text-slate-400">Olá, {userName}</span>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </header>

            <main className="p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="bg-amber-500/20 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{waitingCount}</p>
                            <p className="text-sm text-slate-400">Na fila</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="bg-sky-500/20 p-3 rounded-xl">
                            <PlayCircle className="w-6 h-6 text-sky-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{inProgressCount}</p>
                            <p className="text-sm text-slate-400">Em atendimento</p>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-3 rounded-xl">
                            <Calendar className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{todayAppointments.length}</p>
                            <p className="text-sm text-slate-400">Agendamentos hoje</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-amber-500 hover:bg-amber-600 rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-500/20"
                    >
                        <UserPlus className="w-6 h-6" />
                        <span className="font-bold">Novo Check-in</span>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Queue */}
                    <div className="col-span-7">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-400" />
                                Fila de Espera
                            </h2>

                            <div className="space-y-3">
                                {queue.length === 0 && (
                                    <p className="text-slate-500 text-center py-8">Nenhum paciente na fila.</p>
                                )}

                                <AnimatePresence>
                                    {queue.map((checkin, i) => (
                                        <motion.div
                                            key={checkin.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`bg-slate-800 border rounded-xl p-4 flex items-center justify-between ${checkin.status === "in_progress"
                                                    ? "border-sky-500/50 bg-sky-500/10"
                                                    : "border-slate-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-8 rounded-full ${priorityColors[checkin.priority]}`} />
                                                <div>
                                                    <p className="font-bold text-lg">{checkin.patient_name}</p>
                                                    <div className="flex items-center gap-3 text-sm text-slate-400">
                                                        {checkin.patient_phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="w-3 h-3" /> {checkin.patient_phone}
                                                            </span>
                                                        )}
                                                        <span>Senha: {String(i + 1).padStart(3, "0")}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {checkin.status === "waiting" ? (
                                                    <button
                                                        onClick={() => callPatient(checkin)}
                                                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                                                    >
                                                        <Volume2 className="w-4 h-4" /> Chamar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <span className="text-sky-400 text-sm font-medium px-3">Em atendimento</span>
                                                        <button
                                                            onClick={() => completeCheckin(checkin.id)}
                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> Concluir
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Today's Appointments */}
                    <div className="col-span-5">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                                Agenda de Hoje
                            </h2>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {todayAppointments.length === 0 && (
                                    <p className="text-slate-500 text-center py-4">Nenhum agendamento.</p>
                                )}

                                {todayAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-center bg-slate-900 px-2 py-1 rounded-lg">
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(apt.start_time), "HH:mm")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium">{apt.patient_name}</p>
                                                <p className="text-xs text-slate-400">{apt.type === "telemed" ? "Telemedicina" : "Presencial"}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${apt.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" :
                                                apt.status === "scheduled" ? "bg-slate-700 text-slate-300" :
                                                    "bg-slate-700 text-slate-400"
                                            }`}>
                                            {apt.status === "confirmed" ? "Confirmado" : apt.status === "scheduled" ? "Agendado" : apt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Check-in Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-amber-400" />
                                Novo Check-in
                            </h3>

                            <form onSubmit={handleCheckin} className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Nome do Paciente *</label>
                                    <input
                                        autoFocus
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Nome completo"
                                        value={formData.patient_name}
                                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Telefone</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
                                        placeholder="(00) 00000-0000"
                                        value={formData.patient_phone}
                                        onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Sintomas / Motivo</label>
                                    <textarea
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors resize-none"
                                        rows={2}
                                        placeholder="Descrição breve"
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-slate-400 mb-2 block">Prioridade</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(["low", "normal", "high", "urgent"] as const).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.priority === p
                                                        ? priorityColors[p] + " text-white"
                                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                                    }`}
                                            >
                                                {p === "low" ? "Baixa" : p === "normal" ? "Normal" : p === "high" ? "Alta" : "Urgente"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !formData.patient_name}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                                    >
                                        {submitting ? "Adicionando..." : "Adicionar à Fila"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
