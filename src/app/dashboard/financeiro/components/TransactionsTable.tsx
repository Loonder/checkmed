"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: string; // 'income' | 'expense'
    status: string;
    category: string;
    date: string;
}

interface TransactionsTableProps {
    transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
    if (transactions.length === 0) {
        return <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">Nenhuma transação encontrada.</div>;
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Transações Recentes</h3>
                <button className="text-sm text-sky-400 font-medium hover:underline">Ver todas</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-800/50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <span className="font-medium text-slate-200">{t.description}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-400 capitalize">{t.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-400">
                                        {format(new Date(t.date), "d 'de' MMM", { locale: ptBR })}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'expense' ? '- ' : '+ '}
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${t.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                            t.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-slate-700 text-slate-400'}`}>
                                        {t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-500 hover:text-white transition">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
