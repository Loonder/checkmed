"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Wallet, PieChart, TrendingUp, Download, Loader2 } from "lucide-react";
import { FinanceMetrics } from "./components/FinanceMetrics";
import { RevenueChart } from "./components/RevenueChart";
import { TransactionsTable } from "./components/TransactionsTable";
import { toast } from "sonner";
import { startOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    status: string;
    category: string;
    date: string;
    created_at: string;
}

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ revenue: 0, pending: 0, expenses: 0 });
    const [chartData, setChartData] = useState<{ name: string, income: number, expense: number }[]>([]);

    // Dynamic Stats
    const [distribution, setDistribution] = useState({ private: 0, insurance: 0 });
    const [insight, setInsight] = useState("Analisando dados...");

    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const { data: tenants } = await supabase.from("tenants").select("id, plan").limit(1);
            if (!tenants?.[0]) return;
            const tenant = tenants[0];
            const tenantId = tenant.id;

            // Only 'free' or explicit 'demo' plans get the button
            setIsDemo(tenant.plan === 'free' || tenant.plan === 'demo');

            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("tenant_id", tenantId)
                .order("date", { ascending: false });

            if (error) throw error;

            const trans = data as Transaction[];
            setTransactions(trans);

            calculateMetrics(trans);
            prepareChartData(trans);
            calculateDistribution(trans);
            generateInsight(trans);

        } catch (error: any) {
            console.error(error);
            if (error.message?.includes('does not exist') || error.code === '42P01') {
                toast.error("Tabela 'transactions' não encontrada.");
            } else {
                toast.error("Erro ao carregar dados financeiros.");
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (data: Transaction[]) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const currentMonthTrans = data.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const revenue = currentMonthTrans
            .filter(t => t.type === 'income' && t.status === 'paid')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const expenses = currentMonthTrans
            .filter(t => t.type === 'expense' && t.status === 'paid')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const pending = data
            .filter(t => t.type === 'income' && t.status === 'pending')
            .reduce((acc, curr) => acc + curr.amount, 0);

        setMetrics({ revenue, expenses, pending });
    };

    const calculateDistribution = (data: Transaction[]) => {
        // Filter only Income
        const income = data.filter(t => t.type === 'income');
        if (income.length === 0) {
            setDistribution({ private: 0, insurance: 0 });
            return;
        }

        const insurance = income.filter(t => t.category === 'TISS' || t.category === 'Convênio' || t.description.toLowerCase().includes('convênio')).reduce((acc, t) => acc + t.amount, 0);
        const particular = income.filter(t => t.category !== 'TISS' && t.category !== 'Convênio' && !t.description.toLowerCase().includes('convênio')).reduce((acc, t) => acc + t.amount, 0);

        const total = insurance + particular;
        if (total === 0) {
            setDistribution({ private: 0, insurance: 0 });
            return;
        }

        setDistribution({
            private: Math.round((particular / total) * 100),
            insurance: Math.round((insurance / total) * 100)
        });
    };

    const generateInsight = (data: Transaction[]) => {
        if (data.length === 0) {
            setInsight("Sem dados suficientes para análise.");
            return;
        }

        // Compare last 30 days revenue vs previous 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(today.getDate() - 30);
        const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(today.getDate() - 60);

        const last30Revenue = data
            .filter(t => new Date(t.date) >= thirtyDaysAgo && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const prev30Revenue = data
            .filter(t => new Date(t.date) < thirtyDaysAgo && new Date(t.date) >= sixtyDaysAgo && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        if (prev30Revenue === 0) {
            setInsight("Iniciando coleta de métricas. Mantenha os lançamentos em dia!");
            return;
        }

        const growth = ((last30Revenue - prev30Revenue) / prev30Revenue) * 100;

        if (growth > 0) {
            setInsight(`Sua receita cresceu +${growth.toFixed(1)}% nos últimos 30 dias. Ótimo trabalho!`);
        } else {
            setInsight(`Receita ${Math.abs(growth).toFixed(1)}% menor que o período anterior. Revise os agendamentos.`);
        }
    };

    const prepareChartData = (data: Transaction[]) => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return {
                date: d,
                name: format(d, 'MMM', { locale: ptBR }),
                income: 0,
                expense: 0
            };
        });

        data.forEach(t => {
            const tDate = new Date(t.date);
            const monthIndex = last6Months.findIndex(m =>
                m.date.getMonth() === tDate.getMonth() && m.date.getFullYear() === tDate.getFullYear()
            );

            if (monthIndex !== -1 && t.status === 'paid') {
                if (t.type === 'income') last6Months[monthIndex].income += t.amount;
                if (t.type === 'expense') last6Months[monthIndex].expense += t.amount;
            }
        });
        setChartData(last6Months);
    };

    const generateSeedData = async () => {
        const { data: tenants } = await supabase.from("tenants").select("id").limit(1);
        if (!tenants?.[0]) return;
        const tenantId = tenants[0].id;

        const dummy: any[] = [];
        const categories = ['Consulta', 'TISS', 'Procedimento'];
        const expenses = ['Aluguel', 'Equipamentos', 'Limpeza', 'Pessoal'];

        for (let i = 0; i < 6; i++) {
            const date = subMonths(new Date(), i);
            for (let j = 0; j < 5; j++) {
                dummy.push({
                    description: `Receita Exemplo ${i}-${j}`,
                    amount: Math.floor(Math.random() * 500) + 150,
                    type: 'income',
                    status: Math.random() > 0.3 ? 'paid' : 'pending',
                    category: categories[Math.floor(Math.random() * categories.length)],
                    date: date.toISOString(),
                    tenant_id: tenantId
                });
            }
            for (let k = 0; k < 3; k++) {
                dummy.push({
                    description: `Despesa ${i}-${k}`,
                    amount: Math.floor(Math.random() * 2000) + 500,
                    type: 'expense',
                    status: 'paid',
                    category: expenses[Math.floor(Math.random() * expenses.length)],
                    date: date.toISOString(),
                    tenant_id: tenantId
                });
            }
        }
        await supabase.from("transactions").insert(dummy);
        toast.success("Dados de teste gerados!");
        fetchFinanceData();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-400" /> Financeiro
                    </h1>
                    <p className="text-slate-400">Visão geral da saúde financeira da clínica.</p>
                </div>
                <div className="flex gap-3">
                    {transactions.length === 0 && !loading && isDemo && (
                        <button onClick={generateSeedData} className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-slate-400 text-sm transition border-dashed">
                            Gerar Dados (Demo)
                        </button>
                    )}
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-emerald-900/20 text-sm transition">
                        <Download className="w-4 h-4" /> Exportar Relatório
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <p>Calculando métricas...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <FinanceMetrics
                        revenue={metrics.revenue}
                        pending={metrics.pending}
                        expenses={metrics.expenses}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <RevenueChart data={chartData} />
                        </div>
                        <div className="space-y-6">
                            {/* DYNAMIC DISTRIBUTION */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-slate-400" /> Distribuição
                                </h3>

                                {distribution.private === 0 && distribution.insurance === 0 ? (
                                    <div className="text-center py-8 text-slate-500 text-sm">Sem dados de receita ainda.</div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Particular</span>
                                                <span>{distribution.private}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${distribution.private}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Convênios (TISS)</span>
                                                <span>{distribution.insurance}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${distribution.insurance}%` }} />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Particular</div>
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /> Convênio</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* DYNAMIC INSIGHT */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2 text-emerald-400">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Insight IA</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {insight}
                                </p>
                            </div>
                        </div>
                    </div>

                    <TransactionsTable transactions={transactions} />
                </div>
            )}
        </div>
    );
}
