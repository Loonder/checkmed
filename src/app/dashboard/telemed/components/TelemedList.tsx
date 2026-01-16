import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Video, Paperclip, Clock, Calendar, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
    id: string;
    patient_name: string;
    phone: string;
    start_time: string;
    end_time: string;
    status: string;
    type: 'presencial' | 'telemed' | string;
    meet_link?: string;
}

interface TelemedListProps {
    appointments: Appointment[];
    onStartCall: (link: string) => void;
    onPrescribe: (appointment: Appointment) => void;
    onStartScribe: (appointment: Appointment) => void;
}

export function TelemedList({ appointments, onStartCall, onPrescribe, onStartScribe }: TelemedListProps) {
    // Filter for only today's telemed appointments
    const todayTelemed = appointments.filter(app =>
        app.type === 'telemed' &&
        isToday(parseISO(app.start_time)) &&
        app.status !== 'cancelled'
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    if (todayTelemed.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-center">
                <Video className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Sem teleconsultas hoje</h3>
                <p className="text-slate-500">Sua agenda de telemedicina está livre.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {todayTelemed.map((app) => (
                <div key={app.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-sky-500/30 transition shadow-lg group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-lg">
                            {app.patient_name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-200">{app.patient_name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(parseISO(app.start_time), 'HH:mm')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(parseISO(app.start_time), "d 'de' MMM", { locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={`https://wa.me/55${(app.phone || '').replace(/\D/g, '')}?text=Olá ${app.patient_name}, lembrete da sua consulta online hoje às ${format(parseISO(app.start_time), 'HH:mm')}! Link: ${app.meet_link || 'Enviaremos em breve'}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition"
                            title="Enviar Lembrete WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </a>
                        <button
                            onClick={() => onPrescribe(app)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="Prescrever Receita"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onStartScribe(app)}
                            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Abrir AI Scribe"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => app.meet_link ? onStartCall(app.meet_link) : alert("Sem link configurado")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition",
                                app.meet_link
                                    ? "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/20"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            <Video className="w-4 h-4" />
                            Iniciar Chamada
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
