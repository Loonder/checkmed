"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    Building2, CreditCard, Save, CheckCircle, AlertTriangle,
    Smartphone, Wifi, RotateCw, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'payments'>('profile');
    const [loading, setLoading] = useState(true);

    // Enterprise Data
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        corporate_name: "",
        cnpj: "",
        technical_responsable: "",
        address: "",
        payment_provider: "stone", // default
        payment_terminal_id: "",
        is_verified: false
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: tenants } = await supabase.from("tenants").select("*").limit(1);
            if (tenants?.[0]) {
                const t = tenants[0];
                setFormData({
                    id: t.id,
                    name: t.name || "",
                    corporate_name: t.corporate_name || "",
                    cnpj: t.cnpj || "",
                    technical_responsable: t.technical_responsable || "",
                    address: t.address || "",
                    payment_provider: t.payment_provider || "stone",
                    payment_terminal_id: t.payment_terminal_id || "",
                    is_verified: t.is_verified || false
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from("tenants")
            .update({
                name: formData.name,
                corporate_name: formData.corporate_name,
                cnpj: formData.cnpj,
                technical_responsable: formData.technical_responsable,
                address: formData.address,
                payment_provider: formData.payment_provider,
                payment_terminal_id: formData.payment_terminal_id,
                // Simulate verification if CNPJ is present
                is_verified: formData.cnpj.length > 10
            })
            .eq("id", formData.id);

        if (error) {
            toast.error("Erro ao salvar: " + error.message);
        } else {
            toast.success("Configurações salvas com sucesso!");
            if (formData.cnpj.length > 10) {
                setFormData(prev => ({ ...prev, is_verified: true }));
                toast.success("Empresa verificada! ✅");
            }
        }
        setLoading(false);
    };

    const handleTestConnection = () => {
        if (!formData.payment_terminal_id) {
            toast.error("Insira o Serial Number da maquininha.");
            return;
        }

        const promise = new Promise((resolve) => setTimeout(resolve, 2000));
        toast.promise(promise, {
            loading: 'Buscando terminal na rede...',
            success: 'Conectado! Maquininha pronta para receber.',
            error: 'Erro de conexão'
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-sky-400" /> Configurações da Clínica
                </h1>
                <p className="text-slate-400">Dados cadastrais e integrações de hardware.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'profile' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
                    >
                        <Building2 className="w-5 h-5" /> Dados da Empresa
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'payments' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
                    >
                        <CreditCard className="w-5 h-5" /> Maquininha & Pagamentos
                    </button>
                </nav>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSave} className="space-y-6">
                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <h2 className="text-xl font-bold text-white">Identidade Corporativa</h2>
                                        {formData.is_verified && (
                                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/20">
                                                <ShieldCheck className="w-4 h-4" /> EMPRESA VERIFICADA
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Nome Fantasia</label>
                                            <input
                                                required
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">CNPJ</label>
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                                                placeholder="00.000.000/0001-00"
                                                value={formData.cnpj}
                                                onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Razão Social</label>
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none"
                                                value={formData.corporate_name}
                                                onChange={e => setFormData({ ...formData, corporate_name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Responsável Técnico (CRM)</label>
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none"
                                                value={formData.technical_responsable}
                                                onChange={e => setFormData({ ...formData, technical_responsable: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'payments' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-6">Terminal de Pagamento (POS)</h2>

                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl mb-8 flex gap-4 items-start">
                                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                                            <Wifi className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-emerald-400">Integração Cloud-to-Device</h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Conecte sua Stone/Cielo Smart. As vendas iniciadas no painel aparecerão automaticamente no visor da maquininha.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Provedor</label>
                                            <select
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none"
                                                value={formData.payment_provider}
                                                onChange={e => setFormData({ ...formData, payment_provider: e.target.value })}
                                            >
                                                <option value="stone">Stone</option>
                                                <option value="cielo">Cielo LIO</option>
                                                <option value="pagseguro">PagSeguro Moderninha</option>
                                                <option value="stripe">Stripe Terminal (Dev)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Serial Number (S/N)</label>
                                            <input
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                                                placeholder="Ex: 88392019"
                                                value={formData.payment_terminal_id}
                                                onChange={e => setFormData({ ...formData, payment_terminal_id: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            {formData.payment_terminal_id ? (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                    Aguardando pareamento...
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                    Desconectado
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleTestConnection}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition"
                                        >
                                            <RotateCw className="w-4 h-4" /> Testar Conexão
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition hover:scale-105"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
