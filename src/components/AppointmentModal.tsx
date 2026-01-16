import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Plus, Video, User, MessageCircle, Trash2, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppointmentModal({
    selectedDate, formData, setFormData, editingId, loading, onClose, onSave, onDelete, getWhatsAppLink,
    showRecurrenceModal, setShowRecurrenceModal, recurrenceRule,
    deleteEntireSeries
}: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {editingId ? <Clock className="w-5 h-5 text-sky-400" /> : <Plus className="w-5 h-5 text-sky-400" />}
                            {editingId ? "Editar Detalhes" : "Novo Agendamento"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 capitalize">
                            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition text-xs uppercase font-bold">
                        Fechar (Esc)
                    </button>
                </div>

                <form onSubmit={onSave} className="space-y-5">
                    {/* Status Tabs */}
                    <div className="flex bg-slate-800/50 p-1 rounded-lg">
                        {['scheduled', 'blocked', 'confirmed'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, status: type as any })}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-bold rounded-md transition capitalize",
                                    formData.status === type
                                        ? "bg-slate-700 text-white shadow"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {type === 'scheduled' ? 'Agendar' : type === 'blocked' ? 'Bloquear' : 'Confirmar'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 font-bold mb-1.5 block">Horário</label>
                            <input type="time" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                                value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold mb-1.5 block">Duração (min)</label>
                            <input type="number" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-sky-500 outline-none font-mono"
                                value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                        </div>
                    </div>

                    {formData.status !== 'blocked' && (
                        <>
                            {/* Type Selector */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'presencial' })}
                                    className={cn("py-2 px-3 rounded-lg border text-sm font-bold transition",
                                        formData.type === 'presencial' ? "bg-sky-500/10 border-sky-500 text-sky-400" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    Presencial
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'telemed' })}
                                    className={cn("py-2 px-3 rounded-lg border text-sm font-bold transition flex items-center justify-center gap-2",
                                        formData.type === 'telemed' ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    <Video className="w-4 h-4" /> Telemedicina
                                </button>
                            </div>

                            {formData.type === 'telemed' && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                                    <label className="text-xs text-slate-400 font-bold mb-1.5 block">Link da Videochamada</label>
                                    <input required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-600 text-sm"
                                        placeholder="https://meet.google.com/..." value={formData.meet_link} onChange={e => setFormData({ ...formData, meet_link: e.target.value })} />
                                </motion.div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1.5 block">Nome do Paciente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input required autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-600"
                                        placeholder="Nome completo..." value={formData.patient_name} onChange={e => setFormData({ ...formData, patient_name: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-bold mb-1.5 block">WhatsApp</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                                    <input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-600"
                                        placeholder="DDD + Número" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-xs text-slate-400 font-bold mb-1.5 block flex justify-between">
                            <span>Observações / Prontuário</span>
                            <span className="text-[10px] text-slate-600 uppercase">Opcional</span>
                        </label>
                        <textarea
                            rows={4}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 outline-none resize-none text-sm leading-relaxed"
                            placeholder="Detalhes do caso, sintomas, observações internas..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* 🆕 BOTÃO TORNAR RECORRENTE */}
                    {formData.status !== 'blocked' && !editingId && (
                        <button
                            type="button"
                            onClick={() => setShowRecurrenceModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-lg font-medium transition-all group"
                        >
                            <Repeat className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            {recurrenceRule && recurrenceRule.frequency !== 'never' ? (
                                <span>🔄 Repetir configurado</span>
                            ) : (
                                <span>Tornar recorrente</span>
                            )}
                        </button>
                    )}

                    {/* 🆕 BOTÃO: Deletar Série Completa (só aparece se for parte de série) */}
                    {editingId && formData.series_id && (
                        <button
                            type="button"
                            onClick={() => deleteEntireSeries(formData.series_id)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg font-medium transition-all group disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Cancelar série completa</span>
                        </button>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        {editingId && (
                            <button
                                type="button"
                                onClick={(e) => onDelete(editingId, e)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-bold transition text-xs"
                            >
                                Excluir
                            </button>
                        )}
                        <div className="flex-1 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 hover:bg-slate-800 text-slate-400 rounded-lg font-bold transition text-sm">Cancelar</button>
                            <button type="submit" disabled={loading} className={cn("px-8 py-2 text-white rounded-lg font-bold transition shadow-lg text-sm", formData.status === 'blocked' ? "bg-slate-600 hover:bg-slate-500" : "bg-sky-600 hover:bg-sky-500 shadow-sky-900/20")}>
                                {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Add display name for debugging
AppointmentModal.displayName = "AppointmentModal";
