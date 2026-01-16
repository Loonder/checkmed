
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, Volume2 } from "lucide-react";

interface Checkin {
    id: string;
    patient_name: string;
    symptoms: string;
    status: "waiting" | "in_progress" | "completed" | "cancelled";
    created_at: string;
}

export default function TvPage() {
    const [queue, setQueue] = useState<Checkin[]>([]);
    const [calling, setCalling] = useState<Checkin | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const announcePatient = (name: string) => {
        // 1. Play "Ding Dong" sound (optional, simulated here or use an audio file)
        // const audio = new Audio('/ding.mp3'); audio.play();

        // 2. Text to Speech
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Paciente ${name}, comparecer ao consultório 1.`);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // 1. Initial Fetch
        const fetchQueue = async () => {
            const { data } = await supabase
                .from("checkins")
                .select("*")
                .in("status", ["waiting", "in_progress"])
                .order("created_at", { ascending: true });

            setQueue(data || []);

            // Check if someone is already being called
            const active = data?.find(c => c.status === 'in_progress');
            if (active) setCalling(active);
        };

        fetchQueue();

        // 2. Realtime Listener
        const channel = supabase
            .channel("tv-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "checkins" },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newCheckin = payload.new as Checkin;
                        // Client-side filtering if needed, though we want all for now to debug
                        setQueue(prev => [...prev, newCheckin]);
                    }
                    else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as Checkin;

                        // If status changed to 'in_progress', TRIGGER CALL
                        if (updated.status === 'in_progress') {
                            setCalling(updated);
                            announcePatient(updated.patient_name);
                        }
                        // If completed/cancelled, remove from queue
                        else if (['completed', 'cancelled'].includes(updated.status)) {
                            setQueue(prev => prev.filter(c => c.id !== updated.id));
                            if (calling?.id === updated.id) setCalling(null);
                        }
                        else {
                            // Regular update
                            setQueue(prev => prev.map(c => c.id === updated.id ? updated : c));
                        }
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [calling]);



    const waitingList = queue.filter(c => c.status === 'waiting');

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center shadow-2xl z-10 relative">
                <div className="flex items-center gap-4">
                    <div className="bg-sky-500/20 p-3 rounded-full animate-pulse">
                        <Activity className="w-8 h-8 text-sky-400" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Echilen Saúde</h1>
                </div>
                <div className="flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
                    <Clock className="w-6 h-6 text-emerald-400" />
                    <span className="text-2xl font-mono font-bold">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </header>

            <main className="grid grid-cols-12 h-[calc(100vh-100px)]">

                {/* LEFT: Calling Now (Highlight) */}
                <div className="col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 p-12 flex flex-col justify-center items-center border-r border-slate-800 relative overflow-hidden">

                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-50" />

                    <AnimatePresence mode="wait">
                        {calling ? (
                            <motion.div
                                key={calling.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="text-center z-10"
                            >
                                <h2 className="text-4xl text-sky-400 font-bold uppercase tracking-widest mb-8 animate-bounce">Chamando Agora</h2>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-[0_0_100px_rgba(14,165,233,0.3)]">
                                    <h1 className="text-7xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl">
                                        {calling.patient_name}
                                    </h1>
                                    <div className="text-3xl text-emerald-400 font-bold bg-emerald-500/10 inline-block px-8 py-4 rounded-full border border-emerald-500/20">
                                        Consultório 01
                                    </div>
                                </div>
                                <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-sm">
                                    <Volume2 className="w-4 h-4 animate-pulse" /> Anunciando...
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-slate-600 z-10"
                            >
                                <div className="w-32 h-32 rounded-full border-4 border-slate-800 mx-auto mb-6 flex items-center justify-center">
                                    <Activity className="w-16 h-16 text-slate-800" />
                                </div>
                                <h2 className="text-3xl font-bold">Aguardando Chamada...</h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: Queue List */}
                <div className="col-span-5 bg-slate-950 p-8 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-slate-400 mb-8 border-b border-slate-800 pb-4 flex items-center gap-3">
                        Próximos Pacientes <span className="text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-300">{waitingList.length}</span>
                    </h2>

                    <div className="space-y-4">
                        {waitingList.length === 0 && (
                            <p className="text-slate-600 text-center py-10 italic">Ninguém na fila.</p>
                        )}
                        {waitingList.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-200">{p.patient_name}</h3>
                                    <span className="text-slate-500 text-sm font-mono">Senha: 00{i + 1}</span>
                                </div>
                                <div className="w-3 h-3 rounded-full bg-slate-700" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
