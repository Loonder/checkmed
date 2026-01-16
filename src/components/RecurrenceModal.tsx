// 🎓 RECURRENCE MODAL - Modal de Recorrência
// Este é o componente que você vai trabalhar!

"use client";

// ========== IMPORTS (Importações) ==========
// Aqui trazemos as "ferramentas" que vamos usar

import { useState } from "react"; // Hook para criar estados
import { motion, AnimatePresence } from "framer-motion"; // Animações
import { X, Calendar, Repeat } from "lucide-react"; // Ícones
import { format } from "date-fns"; // Trabalhar com datas
import { ptBR } from "date-fns/locale"; // Português BR
import type { RecurrenceModalProps, RecurrenceRule } from "@/types/recurrence";

// ========== COMPONENTE PRINCIPAL ==========
export function RecurrenceModal({
    isOpen,      // true/false - modal aberto?
    onClose,     // função pra fechar
    onSave,      // função pra salvar
    startDateTime
}: RecurrenceModalProps) {

    // ========== ESTADOS (States) ==========
    // Pensa assim: Estados são variáveis que, quando mudam, a tela atualiza sozinha!

    // 1. Tipo de repetição (nunca, diário, semanal, mensal)
    const [frequency, setFrequency] = useState<RecurrenceRule['frequency']>('never');

    // 2. Intervalo (a cada quantos? Ex: a cada 2 semanas)
    const [interval, setInterval] = useState(1);

    // 3. Dias da semana selecionados (array de números)
    const [byweekday, setByweekday] = useState<number[]>([]);

    // 4. Tipo de fim (por data ou por contagem)
    const [endType, setEndType] = useState<'date' | 'count'>('date');

    // 5. Data de término
    const [endDate, setEndDate] = useState<string>('');

    // 6. Número de ocorrências
    const [count, setCount] = useState<number>(10);

    // ========== FUNÇÕES AUXILIARES ==========

    // Função para adicionar/remover dias da semana
    const toggleWeekday = (day: number) => {
        // Se já está selecionado, remove
        if (byweekday.includes(day)) {
            setByweekday(byweekday.filter(d => d !== day));
        } else {
            // Se não está, adiciona
            setByweekday([...byweekday, day]);
        }
    };

    // Função para gerar texto de resumo
    // Função para gerar texto de resumo
    const getSummaryText = (): string => {
        if (frequency === 'never') return 'Não repete';

        let summary = '';

        // 1. Frequência
        switch (frequency) {
            case 'daily':
                summary = interval > 1 ? `A cada ${interval} dias` : 'Diariamente';
                break;
            case 'weekly':
                const days = byweekday
                    .map(d => {
                        const date = new Date();
                        const currentDay = date.getDay();
                        const diff = d - currentDay;
                        date.setDate(date.getDate() + diff);
                        return format(date, 'EEEE', { locale: ptBR });
                    })
                    .join(', ');
                summary = interval > 1
                    ? `A cada ${interval} semanas` + (days ? ` nas ${days}` : '')
                    : `Semanalmente` + (days ? ` nas ${days}` : '');
                break;
            case 'monthly':
                summary = interval > 1 ? `A cada ${interval} meses` : 'Mensalmente';
                break;
        }

        // 2. Término
        if (endType === 'date' && endDate) {
            try {
                const date = new Date(endDate);
                // Adjust timezone offset to prevent one-day-off error if string is YYYY-MM-DD
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
                summary += ` até ${format(adjustedDate, 'dd/MM/yyyy')}`;
            } catch (e) {
                // Invalid date, ignore
            }
        } else if (endType === 'count' && count) {
            summary += ` por ${count} vezes`;
        }

        return summary;
    };

    // Função para validar antes de salvar
    const handleSave = () => {
        // Validação: Se for semanal, precisa ter pelo menos 1 dia selecionado
        if (frequency === 'weekly' && byweekday.length === 0) {
            alert('Selecione pelo menos um dia da semana!');
            return;
        }

        // Criar objeto com as regras
        const rule: RecurrenceRule = {
            frequency,
            interval,
            byweekday: frequency === 'weekly' ? byweekday : [],
            endDate: endType === 'date' ? endDate : undefined,
            count: endType === 'count' ? count : undefined,
        };

        // Chamar função onSave (passada como prop)
        onSave(rule);
    };

    // Se modal não está aberto, não renderiza nada
    if (!isOpen) return null;

    // ========== RENDERIZAÇÃO (HTML/JSX) ==========
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay escuro de fundo */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal em si */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Não fechar ao clicar dentro
                            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* ========== HEADER DO MODAL ========== */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <Repeat className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Repetir Agendamento</h2>
                                        <p className="text-sm text-slate-400">Configure quando este agendamento se repete</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* ========== CONTEÚDO DO MODAL ========== */}
                            <div className="p-6 space-y-6">

                                {/* ========== TAREFA 1: RADIO BUTTONS ========== */}
                                {/* 🟢 VERDE = VOCÊ FAZ! */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-300">
                                        Frequência
                                    </label>



                                    <div className="space-y-2">
                                        {/* ✅ OPÇÃO 1: Não repetir */}
                                        <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-slate-700/50">
                                            <input
                                                type="radio"
                                                name="frequency"
                                                value="never"
                                                checked={frequency === 'never'}
                                                onChange={() => setFrequency('never')}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Não repetir</span>
                                                <p className="text-xs text-slate-400">Apenas este agendamento</p>
                                            </div>
                                        </label>

                                        {/* ✅ OPÇÃO 2: Todos os dias */}
                                        <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-slate-700/50">
                                            <input
                                                type="radio"
                                                name="frequency"
                                                value="daily"
                                                checked={frequency === 'daily'}
                                                onChange={() => setFrequency('daily')}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Todos os dias</span>
                                                <p className="text-xs text-slate-400">Repetir diariamente</p>
                                            </div>
                                        </label>

                                        {/* ✅ OPÇÃO 3: Toda semana */}
                                        <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-slate-700/50">
                                            <input
                                                type="radio"
                                                name="frequency"
                                                value="weekly"
                                                checked={frequency === 'weekly'}
                                                onChange={() => setFrequency('weekly')}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Toda semana</span>
                                                <p className="text-xs text-slate-400">Repetir semanalmente</p>
                                            </div>
                                        </label>

                                        {/* ✅ OPÇÃO 4: Todo mês */}
                                        <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border border-slate-700/50">
                                            <input
                                                type="radio"
                                                name="frequency"
                                                value="monthly"
                                                checked={frequency === 'monthly'}
                                                onChange={() => setFrequency('monthly')}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <div>
                                                <span className="text-white font-medium">Todo mês</span>
                                                <p className="text-xs text-slate-400">Repetir mensalmente</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* ========== TAREFA 2: CHECKBOXES DE DIAS (Só aparece se frequency = 'weekly') ========== */}
                                {/* 🟢 VERDE = VOCÊ FAZ! */}
                                {frequency === 'weekly' && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-slate-300">
                                            Repetir nos dias
                                        </label>

                                        <div className="grid grid-cols-7 gap-2">
                                            {/* 
                        ✨ SUA TAREFA:
                        Criar 7 checkboxes (um pra cada dia da semana)
                        
                        EXEMPLO de 1 checkbox (Domingo):
                      */}
                                            <button
                                                onClick={() => toggleWeekday(0)} // 0 = Domingo
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(0)
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                D
                                            </button>

                                            {/* ✅ Segunda-feira */}
                                            <button
                                                onClick={() => toggleWeekday(1)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(1) // ← Mudou! Agora checa se 1 está no array
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                S
                                            </button>

                                            {/* ✅ Terça-feira */}
                                            <button
                                                onClick={() => toggleWeekday(2)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(2) // ← Mudou! Checa se 2 está no array
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                T
                                            </button>

                                            {/* ✅ Quarta-feira */}
                                            <button
                                                onClick={() => toggleWeekday(3)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(3) // ← Checa 3
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                Q
                                            </button>

                                            {/* ✅ Quinta-feira */}
                                            <button
                                                onClick={() => toggleWeekday(4)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(4) // ← Checa 4
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                Q
                                            </button>

                                            {/* ✅ Sexta-feira */}
                                            <button
                                                onClick={() => toggleWeekday(5)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(5) // ← Checa 5
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                S
                                            </button>

                                            {/* ✅ Sábado */}
                                            <button
                                                onClick={() => toggleWeekday(6)}
                                                className={`p-3 rounded-lg font-medium text-sm transition-all ${byweekday.includes(6) // ← Checa 6
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                    }`}
                                            >
                                                S
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ========== INTERVALO (a cada quantos?) ========== */}
                                {frequency !== 'never' && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-slate-300">
                                            Repetir a cada
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={interval}
                                                onChange={(e) => setInterval(Number(e.target.value))}
                                                className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-slate-400">
                                                {frequency === 'daily' && 'dia(s)'}
                                                {frequency === 'weekly' && 'semana(s)'}
                                                {frequency === 'monthly' && 'mês(es)'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* ========== QUANDO TERMINA ========== */}
                                {frequency !== 'never' && (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-slate-300">
                                            Termina
                                        </label>

                                        {/* Radio: Por data ou por contagem */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name="endType"
                                                    checked={endType === 'date'}
                                                    onChange={() => setEndType('date')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-white">Em uma data específica</span>
                                            </label>

                                            {endType === 'date' && (
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                                />
                                            )}

                                            <label className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name="endType"
                                                    checked={endType === 'count'}
                                                    onChange={() => setEndType('count')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-white">Após</span>
                                            </label>

                                            {endType === 'count' && (
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="365"
                                                        value={count}
                                                        onChange={(e) => setCount(Number(e.target.value))}
                                                        className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                                    />
                                                    <span className="text-slate-400">ocorrências</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ========== TAREFA 3: PREVIEW ========== */}
                                {/* 🟢 VERDE = VOCÊ FAZ! */}
                                {frequency !== 'never' && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-purple-300 mb-1">Resumo da recorrência</p>
                                                <p className="text-sm text-slate-300">
                                                    {getSummaryText()}
                                                </p>
                                                {/* 
                          ✨ SUA TAREFA FUTURA:
                          Melhorar a função getSummaryText() pra mostrar:
                          "Repete toda segunda-feira, até 31/03/2026"
                          "Repete a cada 2 semanas, por 10 vezes"
                        */}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* ========== FOOTER (Botões) ========== */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={frequency === 'never'}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Salvar Recorrência
                                </button>
                            </div>

                        </motion.div>
                    </div >
                </>
            )
            }
        </AnimatePresence >
    );
}
