
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Pill, Plus, Search, Trash2, Edit2, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Medication {
    id: string;
    name: string;
    description: string;
    dosage: string;
    price: number;
    stock: number;
    category: string;
}

export default function PharmacyPage() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMed, setNewMed] = useState({
        name: "",
        description: "",
        dosage: "",
        price: 0,
        stock: 0,
        category: "Geral"
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        const { data, error } = await supabase
            .from("medications")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            toast.error("Erro ao buscar medicamentos");
        } else {
            setMedications(data || []);
        }
        setLoading(false);
    };

    const handleAddMedication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.name) return;

        const { data, error } = await supabase
            .from("medications")
            .insert([newMed])
            .select();

        if (error) {
            toast.error("Erro ao adicionar medicamento");
        } else {
            setMedications([...(data || []), ...medications]);
            setIsModalOpen(false);
            setNewMed({ name: "", description: "", dosage: "", price: 0, stock: 0, category: "Geral" });
            toast.success("Medicamento adicionado!");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este item?")) return;

        const { error } = await supabase
            .from("medications")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Erro ao excluir");
        } else {
            setMedications(medications.filter(m => m.id !== id));
            toast.success("Item removido");
        }
    };

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Pill className="w-8 h-8 text-emerald-400" /> Farmácia & Estoque
                    </h1>
                    <p className="text-slate-400 mt-1">Gerencie o inventário de medicamentos da clínica.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition hover:scale-105"
                >
                    <Plus className="w-5 h-5" /> Novo Medicamento
                </button>
            </header>

            {/* Search & Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-sky-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Total Itens</span>
                    <span className="text-2xl font-bold text-white">{medications.length}</span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredMeds.map((med) => (
                        <motion.div
                            key={med.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-dark p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(med.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 mb-2 border border-slate-700">
                                    {med.category || 'Geral'}
                                </span>
                                <h3 className="text-lg font-bold text-white leading-tight">{med.name}</h3>
                                <p className="text-emerald-400 text-sm font-medium">{med.dosage}</p>
                            </div>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10">
                                {med.description || "Sem descrição."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Preço</span>
                                    <span className="text-white font-medium">R$ {Number(med.price).toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Estoque</span>
                                    <span className={cn(
                                        "font-medium px-2 py-0.5 rounded text-sm",
                                        med.stock < 10 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                                    )}>
                                        {med.stock} un
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-8 shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Novo Medicamento</h2>
                        <form onSubmit={handleAddMedication} className="space-y-4">
                            <input
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Nome do Medicamento"
                                required
                                value={newMed.name}
                                onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Dosagem (ex: 500mg)"
                                    value={newMed.dosage}
                                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                />
                                <input
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Categoria"
                                    value={newMed.category}
                                    onChange={e => setNewMed({ ...newMed, category: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Preço (R$)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newMed.price}
                                        onChange={e => setNewMed({ ...newMed, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Estoque Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newMed.stock}
                                        onChange={e => setNewMed({ ...newMed, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <textarea
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                rows={3}
                                placeholder="Descrição..."
                                value={newMed.description}
                                onChange={e => setNewMed({ ...newMed, description: e.target.value })}
                            />

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-500/20"
                                >
                                    Salvar Item
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
