"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
    Building2, Plus, Shield, Users, Activity,
    Search, Trash2, ExternalLink, CheckCircle, XCircle, Ban, Power, Settings, CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'suspended';
    created_at: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    active: boolean;
}

export default function SuperAdminPage() {
    const [activeTab, setActiveTab] = useState<'clinics' | 'plans'>('clinics');

    // Tenants State
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(true);
    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [newTenant, setNewTenant] = useState({ name: "", slug: "", plan: "pro" });

    // Plans State
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<Plan>>({ name: "", price: 0, features: [] });

    useEffect(() => {
        if (activeTab === 'clinics') fetchTenants();
        if (activeTab === 'plans') fetchPlans();
    }, [activeTab]);

    // --- Tenants Logic ---
    const fetchTenants = async () => {
        setLoadingTenants(true);
        const { data, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
        if (error) toast.error("Erro ao carregar clínicas.");
        else setTenants(data as any || []);
        setLoadingTenants(false);
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTenant.name || !newTenant.slug) return;
        const { data: existing } = await supabase.from("tenants").select("id").eq("slug", newTenant.slug).single();
        if (existing) { toast.error("URL já em uso."); return; }

        const { data, error } = await supabase.from("tenants").insert([{ ...newTenant, status: 'active' }]).select().single();
        if (error) toast.error(error.message);
        else {
            setTenants([data, ...tenants]);
            setIsTenantModalOpen(false);
            setNewTenant({ name: "", slug: "", plan: "pro" });
            toast.success("Clínica criada!");
        }
    };

    const toggleStatus = async (tenant: Tenant) => {
        const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
        const updatedTenants = tenants.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t);
        setTenants(updatedTenants as Tenant[]);
        const { error } = await supabase.from("tenants").update({ status: newStatus }).eq("id", tenant.id);
        if (error) {
            toast.error("Erro ao atualizar status.");
            fetchTenants();
        } else {
            newStatus === 'suspended' ? toast.warning(`Acesso de ${tenant.name} suspenso.`) : toast.success(`Acesso de ${tenant.name} reativado.`);
        }
    };

    const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-");


    // --- Plans Logic ---
    const fetchPlans = async () => {
        const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });
        if (error) {
            // Silently ignore if table doesn't exist yet (user needs to run SQL)
            console.error(error);
        } else {
            setPlans(data as any || []);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlan.name || newPlan.price === undefined) return;

        // Simple create for MVP (Update logic would need ID check)
        const { data, error } = await supabase.from("plans").insert([newPlan]).select().single();

        if (error) {
            toast.error("Erro ao salvar plano. Verifique se criou a tabela 'plans'.");
        } else {
            setPlans([...plans, data]);
            setIsPlanModalOpen(false);
            setNewPlan({ name: "", price: 0, features: [] });
            toast.success("Plano criado!");
        }
    };


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-500/20 p-2 rounded-lg">
                                <Shield className="w-8 h-8 text-purple-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Super Admin</h1>
                        </div>
                        <p className="text-slate-400">Gerenciamento Centralizado (SaaS).</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 space-x-6">
                    <button
                        onClick={() => setActiveTab('clinics')}
                        className={`pb-4 text-sm font-bold flex items-center gap-2 transition ${activeTab === 'clinics' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Building2 className="w-4 h-4" /> Clínicas
                    </button>
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`pb-4 text-sm font-bold flex items-center gap-2 transition ${activeTab === 'plans' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <CreditCard className="w-4 h-4" /> Planos & Preços
                    </button>
                    <button className="pb-4 text-sm font-bold flex items-center gap-2 text-slate-400 hover:text-white transition">
                        <Settings className="w-4 h-4" /> Configurações
                    </button>
                </div>

                {/* CONTENT: CLINICS */}
                {activeTab === 'clinics' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        {/* KPIs */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-dark p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="bg-slate-800 p-3 rounded-xl"><Building2 className="w-8 h-8 text-sky-400" /></div>
                                <div><p className="text-slate-400 text-sm">Ativas</p><p className="text-2xl font-bold text-white">{tenants.filter(t => t.status !== 'suspended').length}</p></div>
                            </div>
                            <div className="glass-dark p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="bg-slate-800 p-3 rounded-xl"><Ban className="w-8 h-8 text-rose-400" /></div>
                                <div><p className="text-slate-400 text-sm">Suspensas</p><p className="text-2xl font-bold text-white">{tenants.filter(t => t.status === 'suspended').length}</p></div>
                            </div>
                            <div className="glass-dark p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="bg-slate-800 p-3 rounded-xl"><Activity className="w-8 h-8 text-emerald-400" /></div>
                                <div><p className="text-slate-400 text-sm">Saúde</p><p className="text-2xl font-bold text-white">100%</p></div>
                            </div>
                        </div>

                        <div className="glass-dark rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Building2 className="w-5 h-5 text-slate-400" /> Clínicas</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsTenantModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Nova
                                    </button>
                                </div>
                            </div>
                            {/* ... Table (Same as before but abstracted) ... */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4">Nome</th>
                                            <th className="p-4">Plano</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {tenants.map(tenant => (
                                            <tr key={tenant.id} className="hover:bg-slate-800/30">
                                                <td className="p-4 text-white font-medium">{tenant.name} <span className="text-xs text-slate-500 block">/{tenant.slug}</span></td>
                                                <td className="p-4"><span className="bg-slate-800 px-2 py-1 rounded text-xs uppercase">{tenant.plan}</span></td>
                                                <td className="p-4">
                                                    {tenant.status === 'suspended'
                                                        ? <span className="text-rose-400 text-xs font-bold flex items-center gap-1"><Ban className="w-3 h-3" /> Suspenso</span>
                                                        : <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ativo</span>
                                                    }
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => toggleStatus(tenant)} className={`text-xs font-bold px-3 py-1.5 rounded transition ${tenant.status === 'suspended' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {tenant.status === 'suspended' ? "Reativar" : "Suspender"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT: PLANS */}
                {activeTab === 'plans' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <div className="flex justify-between items-center bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Planos Dinâmicos</h3>
                                <p className="text-slate-400 text-sm">Crie planos personalizados para ofertar na Landing Page.</p>
                            </div>
                            <button onClick={() => setIsPlanModalOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20">
                                <Plus className="w-5 h-5" /> Criar Novo Plano
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {plans.map(plan => (
                                <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-bold">ATIVO</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-6">
                                        R$ {plan.price}<span className="text-sm text-slate-500 font-normal">/mês</span>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        {plan.features?.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                <CheckCircle className="w-4 h-4 text-purple-500" /> {feat}
                                            </div>
                                        ))}
                                        {(!plan.features || plan.features.length === 0) && <p className="text-slate-500 text-sm italic">Sem features listadas.</p>}
                                    </div>
                                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-white transition">
                                        Editar Detalhes
                                    </button>
                                </div>
                            ))}
                            {plans.length === 0 && (
                                <div className="col-span-3 text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                                    <p className="text-slate-500">Nenhum plano criado ainda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: NEW TENANT (Existing logic...) */}
            {isTenantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Nova Clínica</h2>
                            <button onClick={() => setIsTenantModalOpen(false)} className="text-slate-500 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateTenant} className="space-y-4">
                            <input className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" placeholder="Nome Comercial" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value, slug: generateSlug(e.target.value) })} required />
                            <input className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" placeholder="Slug URL" value={newTenant.slug} onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })} required />
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl mt-4">Criar Clínica</button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* MODAL: NEW PLAN */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Novo Plano de Assinatura</h2>
                            <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-500 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSavePlan} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Nome do Plano</label>
                                <input className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-purple-500" placeholder="Ex: Black Friday Promo" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Preço Mensal (R$)</label>
                                <input type="number" step="0.01" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-purple-500" placeholder="0.00" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })} required />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Funcionalidades (Separar por vírgula)</label>
                                <textarea className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-purple-500 h-24" placeholder="Ex: 3 Médicos, Telemedicina, Suporte VIP"
                                    onChange={e => setNewPlan({ ...newPlan, features: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl mt-4 flex justify-center gap-2">
                                <Plus className="w-5 h-5" /> Criar Plano
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
