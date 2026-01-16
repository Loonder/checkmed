
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, FileText, Plus, Save, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MedicalRecord {
    id: string;
    doctor_name: string;
    diagnosis: string;
    prescription: string;
    notes: string;
    created_at: string;
}

interface Patient {
    id: string; // correlates to checkins.id or a profiles.id
    patient_name: string;
    cpf: string;
    symptoms: string; // from latest checkin
    created_at: string;
}

export default function PatientRecordPage() {
    const { id } = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // New Record Form
    const [newDiagnosis, setNewDiagnosis] = useState("");
    const [newPrescription, setNewPrescription] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // 1. Fetch Patient Info (Using checkins for this demo as "Patients")
            const { data: patientData, error: patientError } = await supabase
                .from("checkins")
                .select("*")
                .eq("id", id)
                .single();

            if (patientError) {
                toast.error("Paciente não encontrado");
                router.push("/dashboard");
                return;
            }
            setPatient(patientData);

            // 2. Fetch Medical Records
            const { data: recordData, error: recordError } = await supabase
                .from("medical_records")
                .select("*")
                .eq("checkin_id", id) // Linking record to specific checkin/visit for this demo context
                .order("created_at", { ascending: false });

            if (recordError) {
                console.error(recordError);
            } else {
                setRecords(recordData || []);
            }

            setLoading(false);
        };

        fetchData();
    }, [id, router]);

    const handleSaveRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDiagnosis) {
            toast.error("O diagnóstico é obrigatório.");
            return;
        }
        setIsSubmitting(true);

        try {
            // In a real app we would get the logged-in doctor's name
            const doctorName = "Dr. Exemplo";

            const { data, error } = await supabase
                .from("medical_records")
                .insert([
                    {
                        checkin_id: id,
                        patient_id: patient?.id, // Assuming schema allows this or we just use checkin_id
                        doctor_name: doctorName,
                        diagnosis: newDiagnosis,
                        prescription: newPrescription,
                        notes: newNotes
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setRecords([data, ...records]);
            setNewDiagnosis("");
            setNewPrescription("");
            setNewNotes("");
            toast.success("Evolução salva com sucesso!");
        } catch (err: any) {
            toast.error("Erro ao salvar: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-400 hover:text-white mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
                </button>

                {/* Header / Client Card */}
                <div className="glass-dark p-8 rounded-2xl border border-slate-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-sky-500/20">
                            <User className="w-10 h-10 text-sky-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{patient?.patient_name}</h1>
                            <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> CPF: {patient?.cpf}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Entrada: {new Date(patient?.created_at!).toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl max-w-md">
                        <h3 className="text-red-400 font-bold mb-1 text-sm uppercase tracking-wider">Queixa Principal</h3>
                        <p className="text-white">{patient?.symptoms}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT: New Record Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-dark p-6 rounded-2xl border border-slate-800"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-400" /> Nova Evolução / Prontuário
                            </h2>

                            <form onSubmit={handleSaveRecord} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Diagnóstico / Hipótese</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                        placeholder="Ex: Infecção Respiratória Aguda"
                                        value={newDiagnosis}
                                        onChange={(e) => setNewDiagnosis(e.target.value)}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Prescrição Medicamentosa</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
                                            placeholder="- Dipirona 500mg..."
                                            value={newPrescription}
                                            onChange={(e) => setNewPrescription(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Anotações / Exames</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none"
                                            placeholder="Paciente relata melhora..."
                                            value={newNotes}
                                            onChange={(e) => setNewNotes(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" /> Salvar Prontuário
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* RIGHT: History */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-sky-400" /> Histórico
                            </h2>

                            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:h-full before:w-[2px] before:bg-slate-800">
                                {records.length === 0 && (
                                    <p className="text-slate-500 text-sm text-center py-4 bg-slate-900 rounded-lg border border-dashed border-slate-800">
                                        Nenhum histórico encontrado.
                                    </p>
                                )}
                                {records.map((rec) => (
                                    <motion.div
                                        key={rec.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative pl-10"
                                    >
                                        <div className="absolute left-0 top-1 w-10 h-10 bg-slate-900 rounded-full border-2 border-sky-500 flex items-center justify-center z-10">
                                            <FileText className="w-4 h-4 text-sky-400" />
                                        </div>
                                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-sky-500/30 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs text-sky-400 font-bold bg-sky-400/10 px-2 py-1 rounded">{new Date(rec.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-slate-500">{new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <h4 className="font-bold text-white mb-1">{rec.diagnosis}</h4>
                                            <p className="text-xs text-slate-400 mb-3">Dr. {rec.doctor_name}</p>

                                            {rec.prescription && (
                                                <div className="mt-2 text-sm text-slate-300 bg-slate-900/50 p-2 rounded">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Prescrição:</p>
                                                    {rec.prescription}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
