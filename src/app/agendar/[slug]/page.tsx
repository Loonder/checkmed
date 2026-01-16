"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Video, MapPin, User, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function BookingPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<any>(null);

    // Booking State
    const [serviceType, setServiceType] = useState<'presencial' | 'telemed'>('presencial');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [patientData, setPatientData] = useState({ name: "", phone: "", cpf: "" });

    // Availability
    const [slots, setSlots] = useState<TimeSlot[]>([]);

    useEffect(() => {
        const fetchTenant = async () => {
            // Find tenant by slug
            const { data, error } = await supabase.from("tenants").select("*").eq("slug", slug).single();
            if (error || !data) {
                toast.error("Clínica não encontrada.");
            } else {
                setTenant(data);
            }
            setLoading(false);
        };
        fetchTenant();
    }, [slug]);

    useEffect(() => {
        if (tenant && step === 2) {
            generateSlotsForDate(selectedDate);
        }
    }, [selectedDate, tenant, step]);

    const generateSlotsForDate = async (date: Date) => {
        setSlots([]); // clear

        // 1. Generate base slots (09:00 to 18:00, every 1h)
        const baseSlots = [
            "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
        ];

        // 2. Fetch existing appointments for this day
        const start = startOfDay(date).toISOString();
        const end = addDays(startOfDay(date), 1).toISOString();

        const { data: bookedApps } = await supabase
            .from("appointments")
            .select("start_time")
            .eq("tenant_id", tenant.id)
            .gte("start_time", start)
            .lt("start_time", end)
            .neq("status", "cancelled");

        // 3. Filter
        const bookedTimes = bookedApps?.map(app => format(parseISO(app.start_time), 'HH:mm')) || [];

        const availability = baseSlots.map(time => ({
            time,
            available: !bookedTimes.includes(time)
        }));

        setSlots(availability);
    };

    const handleConfirm = async () => {
        if (!tenant || !selectedTime) return;
        setLoading(true);

        try {
            const { bookPublicAppointment } = await import('../actions');

            const result = await bookPublicAppointment(
                slug,
                serviceType,
                selectedDate.toISOString(),
                selectedTime,
                patientData
            );

            if (result.error) {
                toast.error(result.error);
                setLoading(false);
            } else {
                setStep(4); // Success
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado. Tente novamente.");
            setLoading(false);
        }
    };

    if (loading && !tenant) return <div className="text-center p-12 text-slate-500">Carregando clínica...</div>;
    if (!tenant) return <div className="text-center p-12 text-red-500 font-bold">Clínica não encontrada. Verifique o link.</div>;

    // Available Days (Next 14 days)
    const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            {/* Progress Bar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className={cn(step >= 1 && "text-emerald-600")}>1. Serviço</span>
                <span className={cn(step >= 2 && "text-emerald-600")}>2. Horário</span>
                <span className={cn(step >= 3 && "text-emerald-600")}>3. Dados</span>
                <span className={cn(step === 4 && "text-emerald-600")}>4. Confirmado</span>
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">

                    {/* STEP 1: SERVICE TYPE */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">Olá! 👋</h1>
                            <p className="text-slate-500 mb-8">Bem-vindo à {tenant.name}. Como podemos te ajudar hoje?</p>

                            <div className="grid gap-4">
                                <button onClick={() => { setServiceType('presencial'); setStep(2); }} className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg transition text-left group">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Consulta Presencial</h3>
                                        <p className="text-slate-500 text-sm">Ir até a clínica para exame físico.</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500" />
                                </button>

                                <button onClick={() => { setServiceType('telemed'); setStep(2); }} className="flex items-center gap-4 p-6 border border-slate-200 rounded-2xl hover:border-sky-500 hover:bg-sky-50 hover:shadow-lg transition text-left group">
                                    <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Telemedicina (Vídeo)</h3>
                                        <p className="text-slate-500 text-sm">Consulta online no conforto de casa.</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-sky-500" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DATE & TIME */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 font-bold">
                                <ChevronLeft className="w-4 h-4" /> Voltar
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Escolha o Melhor Horário</h2>

                            {/* Horizontal Calendar */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                                {days.map(day => (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "min-w-[70px] p-3 rounded-xl border flex flex-col items-center gap-1 transition",
                                            isSameDay(selectedDate, day)
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg scale-105"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-emerald-300"
                                        )}
                                    >
                                        <span className="text-xs uppercase font-bold">{format(day, 'EEE', { locale: ptBR })}</span>
                                        <span className="text-lg font-bold">{format(day, 'd')}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {slots.map(slot => (
                                    <button
                                        key={slot.time}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={cn(
                                            "py-3 rounded-lg text-sm font-bold border transition",
                                            !slot.available
                                                ? "bg-slate-100 text-slate-300 border-transparent cursor-not-allowed decoration-slice line-through"
                                                : selectedTime === slot.time
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105"
                                                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                                        )}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>

                            {selectedTime && (
                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200">
                                        Continuar <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 3: PATIENT DATA */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <button onClick={() => setStep(2)} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 font-bold">
                                <ChevronLeft className="w-4 h-4" /> Voltar
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Seus Dados</h2>
                            <p className="text-slate-500 mb-6">Para confirmarmos seu agendamento.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            autoFocus
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                            placeholder="Ex: João Silva"
                                            value={patientData.name}
                                            onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp / Celular</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                            placeholder="(11) 99999-9999"
                                            value={patientData.phone}
                                            onChange={e => setPatientData({ ...patientData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!patientData.name || !patientData.phone || loading}
                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200"
                                >
                                    {loading ? "Confirmando..." : "Confirmar Agendamento"} <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Agendado com Sucesso!</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                {patientData.name}, sua consulta {serviceType === 'telemed' ? 'online' : 'presencial'} foi agendada para <strong>{format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às {selectedTime}</strong>.
                            </p>
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl inline-block text-left text-sm text-slate-600">
                                <p className="mb-2"><strong>O que acontece agora?</strong></p>
                                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                                    <li>Enviamos uma confirmação no WhatsApp.</li>
                                    {serviceType === 'telemed' && <li>O link da vídeo-chamada será enviado 10min antes.</li>}
                                    <li>Se precisar cancelar, avise com antecedência.</li>
                                </ul>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
