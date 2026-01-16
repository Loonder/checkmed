"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { User, FileText, CheckCircle, AlertCircle, Activity, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isValidCPF, formatCPF, sanitizeText, isValidName } from "@/lib/validations";

interface Tenant {
    id: string;
    name: string;
    slug: string;
}

export default function CheckInPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [tenantError, setTenantError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        symptoms: "",
        painLevel: 5,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch tenant by slug - SECURE
    useEffect(() => {
        const getTenant = async () => {
            if (!slug) {
                setTenantError("Link de check-in inválido.");
                return;
            }

            const { data, error } = await supabase
                .from('tenants')
                .select('id, name, slug')
                .eq('slug', slug)
                .eq('status', 'active')
                .single();

            if (error || !data) {
                setTenantError("Clínica não encontrada ou inativa. Verifique o link.");
                return;
            }

            setTenant(data);
        };
        getTenant();
    }, [slug]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        } else if (!isValidName(formData.name)) {
            newErrors.name = "Nome inválido";
        }

        // CPF validation (optional but must be valid if provided)
        if (formData.cpf && !isValidCPF(formData.cpf)) {
            newErrors.cpf = "CPF inválido";
        }

        // Symptoms validation
        if (!formData.symptoms.trim()) {
            newErrors.symptoms = "Descreva seus sintomas";
        } else if (formData.symptoms.length < 10) {
            newErrors.symptoms = "Descreva com mais detalhes (mín. 10 caracteres)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Corrija os erros no formulário.");
            return;
        }

        if (!tenant) {
            toast.error("Clínica não identificada.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from("checkins")
                .insert([
                    {
                        patient_name: sanitizeText(formData.name.trim()),
                        patient_cpf: formData.cpf ? formatCPF(formData.cpf) : null,
                        symptoms: sanitizeText(formData.symptoms.trim()),
                        status: "waiting",
                        pain_level: formData.painLevel,
                        tenant_id: tenant.id
                    },
                ]);

            if (error) throw error;

            setCompleted(true);
            toast.success("Check-in realizado com sucesso! Aguarde sua vez.");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
            toast.error("Erro ao realizar check-in: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Error state - Invalid clinic
    if (tenantError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full glass-dark p-8 rounded-2xl border border-red-500/30"
                >
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Link Inválido</h2>
                    <p className="text-slate-400 mb-8">{tenantError}</p>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                    >
                        Voltar ao Início
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Loading state
    if (!tenant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-pulse text-slate-400">Carregando...</div>
            </div>
        );
    }

    // Success state
    if (completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full glass-dark p-8 rounded-2xl border border-emerald-500/30"
                >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Check-In Confirmado</h2>
                    <p className="text-slate-400 mb-8">
                        Você foi adicionado à fila de <span className="text-sky-400 font-medium">{tenant.name}</span>.
                        Por favor aguarde e acompanhe o painel.
                    </p>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                    >
                        Voltar ao Início
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 text-slate-200">
                    <Activity className="w-6 h-6 text-sky-500" />
                    <span className="font-bold">CheckMed</span>
                </Link>
            </header>

            <main className="flex-1 relative z-10 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full mb-4">
                            <Building2 className="w-4 h-4 text-sky-400" />
                            <span className="text-sky-400 font-medium">{tenant.name}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Check-In Paciente</h1>
                        <p className="text-slate-400">Insira seus dados para entrar na fila.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 glass-dark p-8 rounded-2xl shadow-2xl">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-sky-400" /> Nome Completo <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: João da Silva"
                                className={cn(
                                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition",
                                    errors.name ? "border-red-500" : "border-slate-700"
                                )}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-sky-400" /> CPF <span className="text-slate-500">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="000.000.000-00"
                                className={cn(
                                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition",
                                    errors.cpf ? "border-red-500" : "border-slate-700"
                                )}
                                value={formData.cpf}
                                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                            />
                            {errors.cpf && <p className="text-red-400 text-sm">{errors.cpf}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-sky-400" /> Sintomas <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Descreva o que está sentindo..."
                                className={cn(
                                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none transition resize-none",
                                    errors.symptoms ? "border-red-500" : "border-slate-700"
                                )}
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            />
                            {errors.symptoms && <p className="text-red-400 text-sm">{errors.symptoms}</p>}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Nível de Dor</span>
                                <span className={cn(
                                    "font-bold",
                                    formData.painLevel < 4 ? "text-emerald-400" :
                                        formData.painLevel < 8 ? "text-yellow-400" : "text-red-500"
                                )}>
                                    {formData.painLevel} / 10
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0" max="10"
                                step="1"
                                className="w-full accent-sky-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                value={formData.painLevel}
                                onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Sem Dor</span>
                                <span>Severa</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                "Confirmar Check-In"
                            )}
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
