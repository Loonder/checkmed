"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, Activity, Users, Calendar, Sparkles } from "lucide-react";
import { TelemedList } from "./components/TelemedList";
import { PrescriptionModal } from "./components/PrescriptionModal";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const AIScribeModal = dynamic(() => import("@/components/AIScribeModal").then(mod => mod.AIScribeModal), {
    loading: () => null,
    ssr: false
});

interface Appointment {
    id: string;
    patient_name: string;
    phone: string;
    start_time: string;
    end_time: string;
    status: string;
    type: 'presencial' | 'telemed' | string;
    meet_link?: string;
    notes?: string;
}

export default function TelemedPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<{ name: string, id: string } | null>(null);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [isScribeOpen, setIsScribeOpen] = useState(false);
    const [tenantId, setTenantId] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            // Fetch tenant first (simplified for MVP, ideally context)
            const { data: tenants } = await supabase.from("tenants").select("id").limit(1);
            if (!tenants?.[0]) return;
            const tid = tenants[0].id; // Rename to tid to avoid collision
            setTenantId(tid);

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD local approx
            // Fetch all appointments for today where type is telemed
            // Note: In real app, handle timezones carefully. Here we fetch broad range for simplicity.

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from("appointments")
                .select("*")
                .eq("tenant_id", tid)
                .eq("type", "telemed")
                .gte("start_time", startOfDay.toISOString())
                .lte("start_time", endOfDay.toISOString())
                .order("start_time", { ascending: true });

            if (error) throw error;
            setAppointments(data || []);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar teleconsultas.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartCall = (link: string) => {
        if (!link) {
            toast.error("Erro: Link da reunião não encontrado.");
            return;
        }
        window.open(link, '_blank');
        toast.info("Conectando à sala segura...", {
            description: "Aguarde a permissão da câmera."
        });
    };

    const handlePrescribe = (app: Appointment) => {
        setSelectedPatient({ name: app.patient_name, id: app.id });
        setIsPrescriptionOpen(true);
    };

    const handleScribe = (app: Appointment) => {

        // App.patient_id might be missing in interface but exists in DB if linked
        const pId = (app as any).patient_id || app.id;
        setSelectedPatient({ name: app.patient_name, id: pId });
        setIsScribeOpen(true);
    };

    const nextPatient = appointments.find(a => new Date(a.start_time) > new Date()) || appointments[0];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Video className="w-8 h-8 text-sky-400" /> Telemedicina
                    </h1>
                    <p className="text-slate-400">Gerenciamento de consultas online e prescrições digitais.</p>
                </div>

                <button
                    onClick={() => { setSelectedPatient(null); setIsScribeOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition hover:scale-105"
                >
                    <Sparkles className="w-5 h-5" /> AI Scribe
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Status Cards */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                            <Video className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-sky-500/20 text-sky-300 px-2 py-1 rounded-full">HOJE</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{appointments.length}</h3>
                    <p className="text-slate-500 text-sm">Consultas Agendadas</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {nextPatient ? nextPatient.patient_name : "Ninguém na fila"}
                    </h3>
                    <p className="text-slate-500 text-sm">
                        {nextPatient
                            ? `Próximo às ${format(parseISO(nextPatient.start_time), 'HH:mm')}`
                            : "Agenda livre por enquanto"
                        }
                    </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Activity className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Status do Sistema</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">Online e Operante</h3>
                        <p className="text-indigo-200 text-sm">Vídeo e Áudio verificados.</p>
                    </div>
                    <div className="absolute bottom-0 right-0 opacity-20 transform translate-x-4 translate-y-4">
                        <Video className="w-32 h-32" />
                    </div>
                </div>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Sala de Espera Virtual</h2>
                        <span className="text-sm text-slate-500">{format(new Date(), "eeee, d 'de' MMMM", { locale: ptBR })}</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Carregando agenda...</div>
                    ) : (
                        <TelemedList
                            appointments={appointments}
                            onStartCall={handleStartCall}
                            onPrescribe={handlePrescribe}
                            onStartScribe={handleScribe}
                        />
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" /> Resumo do Dia
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between text-sm">
                                <span className="text-slate-400">Total Consultas</span>
                                <span className="text-white font-mono font-bold">{appointments.length}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                                <span className="text-slate-400">Concluídas</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                    {appointments.filter(a => a.status === 'completed').length}
                                </span>
                            </li>
                            <li className="flex justify-between text-sm">
                                <span className="text-slate-400">Pendentes</span>
                                <span className="text-sky-400 font-mono font-bold">
                                    {appointments.filter(a => a.status === 'scheduled').length}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <PrescriptionModal
                isOpen={isPrescriptionOpen}
                onClose={() => setIsPrescriptionOpen(false)}
                patientName={selectedPatient?.name || ""}
            />

            <AIScribeModal
                isOpen={isScribeOpen}
                onClose={() => setIsScribeOpen(false)}
                patientName={selectedPatient?.name}
                patientId={selectedPatient?.id}
                tenantId={tenantId}
            />
        </div>
    );
}
