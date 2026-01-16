"use client";

import { useState } from "react";
import { X, FileText, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientName: string;
    doctorName?: string;
}

export function PrescriptionModal({ isOpen, onClose, patientName, doctorName = "Dr. CheckMed" }: PrescriptionModalProps) {
    const [medications, setMedications] = useState([{ name: "", dosage: "", instructions: "" }]);

    const addMedication = () => {
        setMedications([...medications, { name: "", dosage: "", instructions: "" }]);
    };

    const updateMedication = (index: number, field: string, value: string) => {
        const newMeds = [...medications];
        // @ts-ignore
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) return;

        const htmlContent = `
            <html>
            <head>
                <title>Receita Digital - ${patientName}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 40px; }
                    .header h1 { margin: 0; color: #000; font-size: 24px; }
                    .header p { margin: 5px 0; color: #666; }
                    .patient-info { margin-bottom: 30px; font-weight: bold; font-size: 18px; }
                    .medication { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #0ea5e9; }
                    .med-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
                    .med-dosage { font-style: italic; color: #555; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    .signature { margin-top: 60px; text-align: right; }
                    .signature-line { display: inline-block; border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CHECKMED CLINIC</h1>
                    <p>Cardiologia & Clínica Geral</p>
                </div>

                <div class="patient-info">
                    Paciente: ${patientName}
                </div>

                <div class="medications-list">
                    ${medications.map((med, i) => `
                        <div class="medication">
                            <div class="med-name">${i + 1}. ${med.name}</div>
                            <div class="med-dosage">${med.dosage}</div>
                            <div>${med.instructions}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="signature">
                    <div class="signature-line">
                        ${doctorName}<br>
                        CRM 12345/SP
                    </div>
                </div>

                <div class="footer">
                    Receita gerada digitalmente via CheckMed Pro em ${new Date().toLocaleDateString('pt-BR')}
                </div>
                
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                Receita Digital
                            </h2>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {medications.map((med, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-sky-400 font-bold uppercase">Medicamento {index + 1}</span>
                                        {index > 0 && (
                                            <button
                                                onClick={() => setMedications(medications.filter((_, i) => i !== index))}
                                                className="text-red-400 text-xs hover:underline"
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        placeholder="Nome do Medicamento (ex: Amoxicilina 500mg)"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white mb-2 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                        value={med.name}
                                        onChange={e => updateMedication(index, 'name', e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            placeholder="Posologia (ex: 1cp a cada 8h)"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                            value={med.dosage}
                                            onChange={e => updateMedication(index, 'dosage', e.target.value)}
                                        />
                                        <input
                                            placeholder="Tempo (ex: 7 dias)"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                            value={med.instructions}
                                            onChange={e => updateMedication(index, 'instructions', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addMedication}
                                className="w-full py-2 border border-dashed border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition text-sm"
                            >
                                + Adicionar Medicamento
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                            <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancelar</button>
                            <button
                                onClick={handlePrint}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                            >
                                <Printer className="w-4 h-4" />
                                Gerar PDF
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
