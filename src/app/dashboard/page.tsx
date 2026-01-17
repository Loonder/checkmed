"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Clock, CheckCircle, MoreHorizontal, User,
    Stethoscope, LogOut, LayoutDashboard, Pill, FileText,
    TrendingUp, Calendar, Sparkles, Video, Settings, Monitor
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Checkin {
    id: string;
    patient_name: string;
    symptoms: string;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
    created_at: string;
    pain_level?: number;
}

export default function DashboardPage() {
    const [queue, setQueue] = useState<Checkin[]>([]);
    const [allCheckinsData, setAllCheckinsData] = useState<Checkin[]>([]); // For analytics
    const [loading, setLoading] = useState(true);

    // Real Data State
    const [userName, setUserName] = useState("");
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [analytics, setAnalytics] = useState<{ name: string, patients: number }[]>([]);

    useEffect(() => {
        fetchDashboardData();
        setupRealtime();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try finding name in metadata first, then profiles
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");

                // Get Profile name if available
                const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (profile?.full_name) setUserName(profile.full_name);
            }

            // 2. Get Today's Appointments Count
            const apptStartOfDay = new Date();
            apptStartOfDay.setHours(0, 0, 0, 0);
            const apptEndOfDay = new Date();
            apptEndOfDay.setHours(23, 59, 59, 999);

            const { count: apptCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .gte('start_time', apptStartOfDay.toISOString())
                .lte('start_time', apptEndOfDay.toISOString());

            setTodayAppointments(apptCount || 0);

            // 3. Get Queue (Waiting/InProgress)
            const { data: queueData, error: queueError } = await supabase
                .from("checkins")
                .select("*")
                .in("status", ["waiting", "in_progress"])
                .order("created_at", { ascending: true });

            if (queueError) throw queueError;
            setQueue(queueData || []);

            // 4. Get All Checkins for Analytics (Today)
            const checkinsStartOfDay = new Date();
            checkinsStartOfDay.setHours(0, 0, 0, 0);

            const { data: todayCheckins } = await supabase
                .from("checkins")
                .select("*")
                .gte("created_at", checkinsStartOfDay.toISOString());

            setAllCheckinsData(todayCheckins || []);
            calculateAnalytics(todayCheckins || []);

        } catch (error: any) {
            console.error("Dashboard Load Error:", error);
            // Don't toast error aggressively on load, silent fail to demo data is better UX sometimes, but here we want "real"
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (data: Checkin[]) => {
        // Group by hour
        const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm (19)
        const stats = hours.map(h => {
            const count = data.filter(c => {
                const date = new Date(c.created_at);
                return date.getHours() === h;
            }).length;
            return {
                name: `${h}:00`,
                patients: count
            };
        });
        setAnalytics(stats);
    };

    const setupRealtime = () => {
        const channel = supabase
            .channel("realtime-dashboard")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "checkins" },
                (payload) => {
                    // Simple refresh for now to keep sync
                    fetchDashboardData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Optimistic Update
        setQueue(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c).filter(c => newStatus !== 'completed' || c.status !== 'completed'));
        // Note: Filter logic above is tricky optimistically. Better to just let fetchDashboardData handle refresh or be precise.
        // Let's just do the DB call and refresh.

        const { error } = await supabase
            .from("checkins")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            toast.error("Falha ao atualizar status");
        } else {
            toast.success(`Status atualizado para: ${newStatus === 'in_progress' ? 'Em Atendimento' : 'Concluído'}`);
            fetchDashboardData(); // Refresh all
        }
    };

    const getUrgencyColor = (symptoms: string) => {
        const urgentKeywords = ['dor', 'falta de ar', 'sangue', 'grave', 'acidente', 'cabeça', 'desmaio'];
        if (urgentKeywords.some(k => symptoms.toLowerCase().includes(k))) return "border-l-red-500 bg-red-500/5";
        return "border-l-sky-500";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col p-6 z-20">
                <div className="flex items-center space-x-2 mb-10 text-sky-400">
                    <Activity className="w-8 h-8" />
                    <span className="text-xl font-bold text-white">CheckMed Pro</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <Link href="/dashboard" className="w-full flex items-center space-x-3 px-4 py-3 bg-white/5 text-white rounded-xl transition font-bold border border-white/5">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Fila ao Vivo</span>
                    </Link>
                    <Link href="/dashboard/agenda" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">Agenda Smart</span>
                    </Link>
                    <Link href="/dashboard/telemed" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition">
                        <Video className="w-5 h-5" />
                        <span className="font-medium">Telemedicina</span>
                    </Link>
                    <Link href="/dashboard/medicamentos" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition">
                        <Pill className="w-5 h-5" />
                        <span className="font-medium">Farmácia</span>
                    </Link>
                    <Link href="/dashboard/financeiro" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-medium">Financeiro</span>
                    </Link>
                    <Link href="/tv" target="_blank" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition border-t border-slate-800/50 mt-4">
                        <Monitor className="w-5 h-5" />
                        <span className="font-medium">Painel TV (Kiosk)</span>
                    </Link>
                    <Link href="/dashboard/configuracoes" className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Configurações</span>
                    </Link>
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')} className="flex items-center space-x-2 text-slate-500 hover:text-white transition cursor-pointer w-full">
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 md:p-8 relative">
                {/* Background Blobs for specific dashboard ambiance */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />

                <header className="mb-10 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3 h-3" /> Briefing Diário
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {loading ? "Carregando..." : `Bom dia, ${userName || 'Doutor(a)'}.`}
                            </h1>
                            <p className="text-slate-400 mt-1 max-w-2xl">
                                Hoje você tem <strong className="text-white">{todayAppointments} pacientes</strong> agendados.
                                O fluxo está {queue.length > 5 ? <span className="text-rose-400 font-bold">intenso</span> : <span className="text-emerald-400 font-bold">moderado</span>} e há {queue.filter(q => q.status === 'waiting' && getUrgencyColor(q.symptoms).includes('red')).length} casos prioritários.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Smart Action: Context Aware */}
                            <button className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                <Stethoscope className="w-4 h-4" /> Iniciar Triagem
                            </button>
                            <Link href="/dashboard/telemed" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition flex items-center gap-2 border border-slate-700">
                                <Video className="w-4 h-4" /> Telemedicina
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Row (Glassmorphism v2) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-sky-500/30 transition group">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition">
                                <User className="w-5 h-5 text-sky-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Espera</p>
                                <p className="text-2xl font-bold text-white">{queue.filter(q => q.status === 'waiting').length}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition">
                                <Stethoscope className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Atendendo</p>
                                <p className="text-2xl font-bold text-white">{queue.filter(q => q.status === 'in_progress').length}</p>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-500/30 transition group">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition">
                                <CheckCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase">Concluídos</p>
                                <p className="text-2xl font-bold text-white">{allCheckinsData.filter(q => q.status === 'completed').length}</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-indigo-900/20 cursor-pointer hover:brightness-110 transition">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-indigo-100 text-xs font-bold uppercase">AI Scribe</p>
                                <p className="text-sm font-bold text-white leading-tight">Ativar Escuta</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-6 mb-8 relative z-10">
                    {/* Analytics Card */}
                    <div className="lg:col-span-2 glass-dark p-6 rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-sky-400" /> Fluxo de Pacientes (Hoje)
                            </h3>
                            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-2 py-1 outline-none">
                                <option>Tempo Real</option>
                            </select>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={analytics.length > 0 ? analytics : [{ name: 'Sem dados', patients: 0 }]}>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Bar dataKey="patients" radius={[4, 4, 0, 0]}>
                                        {analytics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#0ea5e9" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats or Triage Summary */}
                    <div className="space-y-6">
                        <div className="glass-dark p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Na Fila de Espera</p>
                                <p className="text-4xl font-bold text-white mt-1">{queue.filter(q => q.status === 'waiting').length}</p>
                            </div>
                            <div className="bg-sky-500/20 p-3 rounded-xl">
                                <User className="w-8 h-8 text-sky-400" />
                            </div>
                        </div>
                        <div className="glass-dark p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Em Atendimento</p>
                                <p className="text-4xl font-bold text-white mt-1">{queue.filter(q => q.status === 'in_progress').length}</p>
                            </div>
                            <div className="bg-emerald-500/20 p-3 rounded-xl">
                                <Stethoscope className="w-8 h-8 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-400" /> Fila de Atendimento Prioritário
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid gap-4 relative z-10 pb-20">
                        <AnimatePresence>
                            {queue.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 text-slate-500 glass-dark rounded-xl border border-flat-dashed border-slate-800"
                                >
                                    Fila zerada! Ninguém aguardando.
                                </motion.div>
                            )}
                            {queue.map((patient) => (
                                <motion.div
                                    key={patient.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={cn(
                                        "glass-dark p-6 rounded-xl border-l-[6px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group transition-colors",
                                        getUrgencyColor(patient.symptoms)
                                    )}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-white">{patient.patient_name}</h3>
                                            {patient.status === 'in_progress' && (
                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30 uppercase tracking-wider font-bold">
                                                    Em Atendimento
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Chegou às: {new Date(patient.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div className="bg-slate-800/50 p-3 rounded-lg text-slate-300 text-sm border border-slate-700/50 max-w-2xl">
                                            <span className="text-sky-400 font-semibold uppercase text-xs mr-2">Sintomas:</span>
                                            {patient.symptoms}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/dashboard/pacientes/${patient.id}`}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition border border-slate-700 hover:border-sky-500/50"
                                            title="Abrir Prontuário"
                                            aria-label="Abrir Prontuário"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </Link>

                                        {patient.status === 'waiting' && (
                                            <button
                                                onClick={() => updateStatus(patient.id, 'in_progress')}
                                                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-sky-900/20"
                                            >
                                                <User className="w-4 h-4" /> Chamar
                                            </button>
                                        )}
                                        {patient.status === 'in_progress' && (
                                            <button
                                                onClick={() => updateStatus(patient.id, 'completed')}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Finalizar
                                            </button>
                                        )}
                                        <button
                                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                            title="Mais Opções"
                                            aria-label="Mais Opções"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
