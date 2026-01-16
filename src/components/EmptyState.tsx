"use client";

/**
 * 🎨 Empty State Component
 * 
 * Componente reutilizável para mostrar quando uma lista/página está vazia.
 * Usa ilustrações SVG inline para 0 dependências externas.
 * 
 * @example
 * <EmptyState
 *   illustration="calendar"
 *   title="Nenhum agendamento"
 *   description="Clique no calendário para agendar seu primeiro paciente!"
 *   actionLabel="Agendar agora"
 *   onAction={() => openModal()}
 * />
 */

import { motion } from "framer-motion";
import { Calendar, FileText, Pill, Search, Users, DollarSign, Video } from "lucide-react";

// Tipos das ilustrações disponíveis
type IllustrationType =
    | "calendar"      // Agenda vazia
    | "records"       // Prontuários vazios
    | "medications"   // Medicamentos vazios
    | "search"        // Nenhum resultado de busca
    | "patients"      // Nenhum paciente
    | "financial"     // Sem transações
    | "telemed";      // Sem consultas telemedicina

interface EmptyStateProps {
    illustration: IllustrationType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

// Configuração de cada tipo de ilustração
const illustrations: Record<IllustrationType, {
    icon: typeof Calendar;
    gradient: string;
    bgGlow: string;
}> = {
    calendar: {
        icon: Calendar,
        gradient: "from-sky-500 to-indigo-600",
        bgGlow: "bg-sky-500/20"
    },
    records: {
        icon: FileText,
        gradient: "from-emerald-500 to-teal-600",
        bgGlow: "bg-emerald-500/20"
    },
    medications: {
        icon: Pill,
        gradient: "from-pink-500 to-rose-600",
        bgGlow: "bg-pink-500/20"
    },
    search: {
        icon: Search,
        gradient: "from-amber-500 to-orange-600",
        bgGlow: "bg-amber-500/20"
    },
    patients: {
        icon: Users,
        gradient: "from-violet-500 to-purple-600",
        bgGlow: "bg-violet-500/20"
    },
    financial: {
        icon: DollarSign,
        gradient: "from-green-500 to-emerald-600",
        bgGlow: "bg-green-500/20"
    },
    telemed: {
        icon: Video,
        gradient: "from-cyan-500 to-blue-600",
        bgGlow: "bg-cyan-500/20"
    }
};

export function EmptyState({
    illustration,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    const config = illustrations[illustration];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            {/* Ilustração Animada */}
            <div className="relative mb-8">
                {/* Glow background */}
                <div className={`absolute inset-0 ${config.bgGlow} blur-3xl rounded-full scale-150 opacity-50`} />

                {/* Círculos decorativos animados */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative"
                >
                    {/* Círculo externo */}
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} p-1 shadow-2xl`}>
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                            <IconComponent className="w-14 h-14 text-slate-300" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Partículas flutuantes */}
                    <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} opacity-60`}
                    />
                    <motion.div
                        animate={{ y: [5, -5, 5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className={`absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-gradient-to-br ${config.gradient} opacity-40`}
                    />
                </motion.div>
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-white mb-3">
                {title}
            </h3>

            {/* Descrição */}
            <p className="text-slate-400 text-base max-w-md mb-6 leading-relaxed">
                {description}
            </p>

            {/* Botão de Ação (opcional) */}
            {actionLabel && onAction && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAction}
                    className={`
            px-6 py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r ${config.gradient}
            shadow-lg shadow-sky-500/25
            hover:shadow-xl hover:shadow-sky-500/30
            transition-shadow duration-300
          `}
                >
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
}

// ======================================================
// 📚 EXEMPLOS DE USO (para referência)
// ======================================================

/**
 * Agenda vazia:
 * <EmptyState
 *   illustration="calendar"
 *   title="Nenhum agendamento ainda"
 *   description="Clique em qualquer data do calendário para agendar seu primeiro paciente."
 *   actionLabel="Agendar agora"
 *   onAction={() => openNewModal(new Date())}
 * />
 * 
 * Busca sem resultados:
 * <EmptyState
 *   illustration="search"
 *   title="Nenhum resultado encontrado"
 *   description="Tente buscar por outro nome ou remover os filtros."
 * />
 * 
 * Prontuários vazios:
 * <EmptyState
 *   illustration="records"
 *   title="Nenhum prontuário"
 *   description="Os prontuários dos pacientes aparecerão aqui após as consultas."
 * />
 */
