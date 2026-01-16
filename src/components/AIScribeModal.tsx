"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Sparkles, Copy, Check, Save, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface AIScribeModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName?: string;
    patientId?: string; // This corresponds to checkin_id in our schema usually
    tenantId?: string;
    doctorName?: string;
}

export function AIScribeModal({ isOpen, onClose, patientName, patientId, tenantId, doctorName }: AIScribeModalProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'completed'>('idle');
    const [transcript, setTranscript] = useState("");
    const [soapNote, setSoapNote] = useState("");
    const [accumulatedText, setAccumulatedText] = useState("");
    const [timer, setTimer] = useState(0);
    const recognitionRef = useRef<any>(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualText, setManualText] = useState("");

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'recording') {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            setTimer(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Seu navegador não suporta reconhecimento de voz. Use o Chrome ou Edge.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
            setStatus('recording');
            setAccumulatedText("");
            toast.info("Microfone ativo. Ouvindo...");
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {

                setAccumulatedText(prev => {
                    const newText = prev + " " + finalTranscript;
                    console.log("Texto acumulado total:", newText);
                    return newText;
                });
                setTranscript(""); // Clear interim
            } else {

                setTranscript(interimTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);

            if (event.error === 'no-speech') {
                toast.error("🎤 Nenhuma fala detectada!\n\nDicas:\n• Fale MAIS ALTO e próximo ao microfone\n• Verifique se o microfone está funcionando\n• Tente de novo e fale continuamente", {
                    duration: 6000
                });
                setStatus('idle');
            } else if (event.error === 'not-allowed') {
                toast.error("❌ Permissão de microfone negada.\n\nClick no cadeado ao lado da URL e permita o microfone.", {
                    duration: 6000
                });
                setStatus('idle');
            } else if (event.error === 'audio-capture') {
                toast.error("❌ Erro ao capturar áudio.\n\nVerifique:\n• Microfone está conectado?\n• Outro app está usando o microfone?", {
                    duration: 6000
                });
                setStatus('idle');
            } else {
                toast.error(`Erro: ${event.error}\n\nTente novamente.`);
                setStatus('idle');
            }
        };

        recognition.onend = () => {
            console.log("Recognition ended. Accumulated text length:", accumulatedText.length);
            // Don't show error here - let handleStop handle validation
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleStop = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const fullText = (accumulatedText + " " + transcript).trim();


        console.log("Full text length:", fullText.length);

        if (!fullText || fullText.length < 10) {
            toast.error("Nenhum áudio foi captado ou texto muito curto. Fale mais alto e por mais tempo.");
            setStatus('idle');
            return;
        }

        setStatus('processing');
        processWithAI(fullText);
    };

    const processWithAI = async (text: string) => {
        try {
            const cleanText = text.trim();



            if (!cleanText) {
                toast.error("❌ Nenhum áudio foi captado.\n\nVerifique:\n• Permissão do microfone\n• Fale mais alto\n• Use Chrome ou Edge");
                setStatus('idle');
                return;
            }

            if (cleanText.length < 10) {
                toast.error("Texto muito curto! Continue falando mais detalhes da consulta.");
                setStatus('idle');
                return;
            }

            // Call real AI API
            toast.info("🤖 Processando com IA...");

            const response = await fetch('/api/generate-soap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript: cleanText,
                    patientName: patientName,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao gerar nota SOAP');
            }

            const data = await response.json();
            setSoapNote(data.soapNote);
            setStatus('completed');
            toast.success("✅ Nota SOAP gerada!");

        } catch (error: any) {
            console.error('AI Processing Error:', error);
            toast.error(`❌ Erro: ${error.message}\n\nVerifique se a API Key está configurada.`);
            setStatus('idle');
        }
    };

    const handleSave = async () => {
        if (!patientId || !tenantId) {
            toast.error("Erro: Contexto do paciente não encontrado.");
            return;
        }

        try {
            const { error } = await supabase.from('medical_records').insert({
                checkin_id: patientId, // Using checkin_id as patient key per schema
                tenant_id: tenantId,
                doctor_name: doctorName || 'Aguardando Médico',
                notes: soapNote,
                diagnosis: "Atendimento Telemedicina",
                prescription: "Vide notas"
            });

            if (error) throw error;
            toast.success("Prontuário salvo com sucesso!");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar prontuário.");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(soapNote);
        toast.success("Copiado para a área de transferência!");
    };

    // Removed early return to let AnimatePresence handle parsing

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        AI Clinical Scribe
                                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">BETA</span>
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        {patientName ? `Atendendo: ${patientName}` : "Modo Standalone (Sem paciente)"}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center min-h-[400px]">

                            {status === 'idle' && (
                                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                    <div className="relative group cursor-pointer" onClick={handleStart}>
                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500" />
                                        <div className="relative w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300 group-hover:border-indigo-500">
                                            <Mic className="w-12 h-12 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <h3 className="text-lg font-semibold text-white mb-2">Pronto para ouvir</h3>
                                        <p className="text-slate-400 text-sm">
                                            O Scribe ouvirá sua consulta e gerará automaticamente um rascunho de prontuário no formato SOAP.
                                        </p>

                                        {/* Manual Mode Toggle */}
                                        <button
                                            onClick={() => setManualMode(!manualMode)}
                                            className="mt-4 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                        >
                                            {manualMode ? '🎤 Usar Microfone' : '✍️ Ou digite o texto manualmente'}
                                        </button>

                                        {/* Manual Text Input */}
                                        {manualMode && (
                                            <div className="mt-4 space-y-3">
                                                <textarea
                                                    value={manualText}
                                                    onChange={(e) => setManualText(e.target.value)}
                                                    placeholder="Digite aqui a transcrição da consulta...&#10;&#10;Ex: Paciente de 45 anos com queixa de cefaleia há 3 dias, dor pulsátil frontal..."
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm resize-none focus:ring-2 focus:ring-sky-500 outline-none"
                                                    rows={5}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (manualText.trim().length < 10) {
                                                            toast.error("Digite pelo menos 10 caracteres");
                                                            return;
                                                        }
                                                        setStatus('processing');
                                                        processWithAI(manualText);
                                                    }}
                                                    disabled={!manualText.trim()}
                                                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    Processar com IA
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleStart} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition shadow-lg">
                                        Iniciar Gravação
                                    </button>
                                </div>
                            )}

                            {status === 'recording' && (
                                <div className="w-full max-w-lg space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-4">
                                            <span className="relative flex h-6 w-6">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500"></span>
                                            </span>
                                        </div>
                                        <div className="text-4xl font-mono font-bold text-white mb-2 tracking-widest">{formatTime(timer)}</div>
                                        <p className="text-indigo-400 text-sm font-medium animate-pulse">Capturando áudio de alta fidelidade...</p>
                                    </div>

                                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 h-48 overflow-y-auto w-full relative group">
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed font-medium">
                                            {accumulatedText} <span className="text-indigo-400 underline decoration-wavy decoration-indigo-500/30 underline-offset-4">{transcript}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <button onClick={handleStop} className="flex items-center gap-3 bg-red-500/10 text-red-400 border border-red-500/50 px-8 py-4 rounded-xl font-bold hover:bg-red-500 hover:text-white transition group">
                                            <Square className="w-5 h-5 fill-current" /> Parar e Processar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === 'processing' && (
                                <div className="text-center space-y-6">
                                    <div className="w-20 h-20 relative mx-auto">
                                        <Loader2 className="w-full h-full text-indigo-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Gerando Notas Clínicas...</h3>
                                    <p className="text-slate-400 max-w-xs mx-auto text-sm">A IA está estruturando o diálogo em formato SOAP, extraindo sintomas e condutas.</p>
                                </div>
                            )}

                            {status === 'completed' && (
                                <div className="w-full h-full flex flex-col">
                                    <div className="flex-1 bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-inner overflow-y-auto mb-6 text-left">
                                        <pre className="font-sans text-slate-200 whitespace-pre-wrap leading-relaxed text-sm">
                                            {soapNote}
                                        </pre>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setStatus('idle')} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition">
                                            Descartar
                                        </button>
                                        <div className="flex gap-2">
                                            <button onClick={handleCopy} className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition flex items-center justify-center gap-2">
                                                <Copy className="w-4 h-4" /> Copiar
                                            </button>
                                            {patientName && (
                                                <button onClick={handleSave} className="flex-[2] px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                                                    <Save className="w-4 h-4" /> Salvar no Prontuário
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
