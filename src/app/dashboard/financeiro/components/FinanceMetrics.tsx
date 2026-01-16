"use client";

import { DollarSign, TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { motion } from "framer-motion";

interface FinanceMetricsProps {
    revenue: number;
    pending: number;
    expenses: number;
}

export function FinanceMetrics({ revenue, pending, expenses }: FinanceMetricsProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const cards = [
        {
            title: "Receita Total",
            value: formatCurrency(revenue),
            subtitle: "Mês atual",
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "A Receber (TISS)",
            value: formatCurrency(pending),
            subtitle: "Convênios Pendentes",
            icon: AlertCircle,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            title: "Despesas",
            value: formatCurrency(expenses),
            subtitle: "Mês atual",
            icon: Wallet,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-slate-900 border ${card.border} p-6 rounded-2xl shadow-lg relative overflow-hidden`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 ${card.bg} rounded-xl ${card.color}`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <TrendingUp className={`w-4 h-4 ${card.color} opacity-50`} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{card.value}</h3>
                    <p className="text-slate-500 text-sm font-medium">{card.subtitle}</p>
                </motion.div>
            ))}
        </div>
    );
}
