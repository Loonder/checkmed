"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, User, Building2, ChevronRight, Loader2, Headset } from "lucide-react";
import { toast } from "sonner";

type UserRole = 'doctor' | 'patient' | 'receptionist';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);

    // Clinic Data (For Doctors)
    const [clinicName, setClinicName] = useState("");
    // Clinic Code (For Receptionists)
    const [clinicCode, setClinicCode] = useState("");

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        if (selectedRole === 'patient') {
            toast.info("Em breve: portal do paciente. Redirecionando para demonstração.");
            completeOnboarding(selectedRole);
        } else if (selectedRole === 'receptionist') {
            setStep(3); // Go to clinic code entry
        } else {
            setStep(2); // Go to clinic creation
        }
    };

    const handleCreateClinic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clinicName) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const slug = clinicName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const { data: tenant, error: tenantError } = await supabase
                .from("tenants")
                .insert([{
                    name: clinicName,
                    slug: slug + '-' + Math.floor(Math.random() * 1000),
                    owner_id: user.id,
                    plan: 'free',
                    status: 'active'
                }])
                .select()
                .single();

            if (tenantError) throw tenantError;

            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    role: 'doctor',
                    tenant_id: tenant.id
                });

            if (profileError) throw profileError;

            toast.success("Clínica criada com sucesso!");
            router.push("/dashboard");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao criar clínica: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClinic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clinicCode) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            // Find tenant by slug (clinic code)
            const { data: tenant, error: tenantError } = await supabase
                .from("tenants")
                .select("id, name")
                .ilike("slug", `%${clinicCode}%`)
                .single();

            if (tenantError || !tenant) {
                toast.error("Código da clínica não encontrado. Verifique com o administrador.");
                setLoading(false);
                return;
            }

            // Create profile as receptionist
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    role: 'receptionist',
                    tenant_id: tenant.id
                });

            if (profileError) throw profileError;

            toast.success(`Bem-vindo à ${tenant.name}!`);
            router.push("/dashboard/recepcao");

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao entrar na clínica: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const completeOnboarding = async (role: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("profiles").upsert({
                    id: user.id,
                    role: role,
                    full_name: user.email?.split('@')[0]
                });
                router.push("/dashboard");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-3xl relative z-10">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                        Bem-vindo ao CheckMed
                    </h1>
                    <p className="text-slate-400 text-lg">Vamos configurar seu ambiente de trabalho.</p>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid md:grid-cols-3 gap-6"
                        >
                            {/* Doctor Card */}
                            <button
                                onClick={() => handleRoleSelect('doctor')}
                                className="group relative p-8 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-3xl transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-slate-800 group-hover:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <Stethoscope className="w-7 h-7 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Sou Médico</h3>
                                <p className="text-sm text-slate-400">Gerenciar minha clínica, atender pacientes.</p>
                                <div className="absolute bottom-8 right-8 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight />
                                </div>
                            </button>

                            {/* Receptionist Card */}
                            <button
                                onClick={() => handleRoleSelect('receptionist')}
                                className="group relative p-8 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-3xl transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-slate-800 group-hover:bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <Headset className="w-7 h-7 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Sou Recepcionista</h3>
                                <p className="text-sm text-slate-400">Gerenciar fila de espera e check-ins.</p>
                                <div className="absolute bottom-8 right-8 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight />
                                </div>
                            </button>

                            {/* Patient Card */}
                            <button
                                onClick={() => handleRoleSelect('patient')}
                                className="group relative p-8 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 rounded-3xl transition-all duration-300 text-left hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-slate-800 group-hover:bg-sky-500/20 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                                    <User className="w-7 h-7 text-sky-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Sou Paciente</h3>
                                <p className="text-sm text-slate-400">Agendar consultas e ver histórico.</p>
                                <div className="absolute bottom-8 right-8 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight />
                                </div>
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Create Clinic (Doctor) */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md mx-auto"
                        >
                            <div className="flex items-center gap-3 mb-6 text-emerald-400">
                                <Building2 className="w-6 h-6" />
                                <span className="font-bold uppercase tracking-wider text-sm">Dados da Clínica</span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Qual o nome do consultório?</h2>
                            <p className="text-slate-400 mb-8 text-sm">Isso criará seu ambiente exclusivo.</p>

                            <form onSubmit={handleCreateClinic}>
                                <input
                                    autoFocus
                                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-4 text-lg text-white outline-none mb-6 transition-colors"
                                    placeholder="Ex: Clínica Saúde Total"
                                    value={clinicName}
                                    onChange={e => setClinicName(e.target.value)}
                                />

                                <button
                                    type="submit"
                                    disabled={loading || !clinicName}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Criar Meu Consultório"}
                                </button>
                            </form>

                            <button onClick={() => setStep(1)} className="mt-6 text-slate-500 hover:text-white text-sm w-full text-center">
                                Voltar
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Join Clinic (Receptionist) */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md mx-auto"
                        >
                            <div className="flex items-center gap-3 mb-6 text-amber-400">
                                <Headset className="w-6 h-6" />
                                <span className="font-bold uppercase tracking-wider text-sm">Entrar na Clínica</span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Código da Clínica</h2>
                            <p className="text-slate-400 mb-8 text-sm">Peça o código ao médico ou administrador da clínica.</p>

                            <form onSubmit={handleJoinClinic}>
                                <input
                                    autoFocus
                                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-4 text-lg text-white outline-none mb-6 transition-colors font-mono uppercase tracking-widest text-center"
                                    placeholder="ex: clinica-saude-123"
                                    value={clinicCode}
                                    onChange={e => setClinicCode(e.target.value.toLowerCase())}
                                />

                                <button
                                    type="submit"
                                    disabled={loading || !clinicCode}
                                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Entrar na Clínica"}
                                </button>
                            </form>

                            <button onClick={() => setStep(1)} className="mt-6 text-slate-500 hover:text-white text-sm w-full text-center">
                                Voltar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stepper Dots */}
                <div className="flex justify-center gap-2 mt-12">
                    <div className={`w-2 h-2 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    <div className={`w-2 h-2 rounded-full transition-all ${step >= 3 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                </div>
            </div>
        </div>
    );
}
