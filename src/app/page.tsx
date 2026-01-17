"use client";

import Link from "next/link";
import { ArrowRight, Activity, Play, CheckCircle2, ChevronRight, ChevronDown, Calendar, Users, Video, BarChart3, Bell, Search, Settings, Clock, User, Shield, Zap, MessageSquare, Phone, Star, Sparkles, FileText, CreditCard, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

// === MINI MOCKUPS FOR FEATURES ===
function AgendaMockup() {
  return (
    <div className="w-full h-full bg-[#0f0f12] rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-medium">Janeiro 2026</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[8px] text-center mb-2">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="text-slate-600">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
        {Array.from({ length: 31 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center",
              i === 15 && "bg-emerald-500 text-white font-bold",
              [5, 12, 19, 26].includes(i) && "bg-emerald-500/20 text-emerald-400",
              ![5, 12, 15, 19, 26].includes(i) && "text-slate-500 hover:bg-white/5"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function TelemedMockup() {
  return (
    <div className="w-full h-full bg-[#0f0f12] rounded-xl overflow-hidden border border-white/5">
      <div className="h-3/4 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl">
            👩‍⚕️
          </div>
        </div>
        <div className="absolute bottom-2 right-2 w-12 h-9 rounded bg-slate-700 border border-white/10" />
      </div>
      <div className="h-1/4 p-2 flex items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
          <Phone className="w-4 h-4 text-rose-400" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Mic className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

function AIMockup() {
  return (
    <div className="w-full h-full bg-[#0f0f12] rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-medium text-violet-400">IA Ativa</span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="w-1 rounded bg-violet-500" />
          <div className="flex-1">
            <p className="text-[10px] text-slate-400">Queixa principal</p>
            <p className="text-xs">Dor abdominal há 3 dias...</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-1 rounded bg-emerald-500" />
          <div className="flex-1">
            <p className="text-[10px] text-slate-400">HDA</p>
            <p className="text-xs">Paciente relata início...</p>
          </div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-3 bg-violet-500/20 rounded w-2/3"
        />
      </div>
    </div>
  );
}

function FinanceMockup() {
  return (
    <div className="w-full h-full bg-[#0f0f12] rounded-xl p-3 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">Receita Mensal</span>
        <span className="text-xs text-emerald-400">+12%</span>
      </div>
      <div className="text-lg font-bold mb-2">R$ 24.850</div>
      <div className="flex items-end gap-1 h-12">
        {[40, 55, 45, 70, 60, 80, 75, 90, 85, 100].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex-1 rounded-t",
              i === 9 ? "bg-emerald-500" : "bg-emerald-500/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SecurityMockup() {
  return (
    <div className="w-full h-full bg-[#0f0f12] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2"
      >
        <Shield className="w-6 h-6 text-emerald-400" />
      </motion.div>
      <span className="text-xs font-medium text-emerald-400">Protegido</span>
      <span className="text-[10px] text-slate-500">256-bit SSL</span>
    </div>
  );
}

// === FAQ COMPONENT ===
function FAQItem({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="font-medium group-hover:text-emerald-400 transition">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === HERO MOCKUP ===
function DashboardMockup() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-t from-emerald-500/30 via-emerald-500/10 to-transparent rounded-[2rem] blur-2xl -z-10" />

        <div className="bg-[#1a1a1f] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0f0f12] border-b border-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-lg text-xs text-slate-500">
                <Activity className="w-3 h-3 text-emerald-400" />
                app.checkmed.shop
              </div>
            </div>
          </div>

          <div className="flex h-[350px] md:h-[450px]">
            <div className="w-14 md:w-48 bg-[#0f0f12] border-r border-white/5 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-semibold">CheckMed</span>
              </div>
              <nav className="space-y-1">
                {[
                  { icon: BarChart3, label: "Dashboard", active: true },
                  { icon: Calendar, label: "Agenda" },
                  { icon: Users, label: "Pacientes" },
                  { icon: Video, label: "Telemed" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                      item.active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden md:block">{item.label}</span>
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-base md:text-lg font-semibold">Bom dia, Dr. Ricardo</h1>
                  <p className="text-[10px] md:text-xs text-slate-500">Quinta-feira, 16 de Janeiro</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                    <Bell className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Consultas", value: "12", color: "text-emerald-400" },
                  { label: "Pacientes", value: "3", color: "text-cyan-400" },
                  { label: "Telemed", value: "4", color: "text-violet-400" },
                  { label: "Receita", value: "R$ 18k", color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <p className="text-[9px] text-slate-500 mb-1">{stat.label}</p>
                    <p className={cn("text-lg md:text-xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.03] rounded-xl border border-white/5">
                <div className="px-4 py-3 border-b border-white/5">
                  <h2 className="text-sm font-medium">Próximas Consultas</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { time: "09:00", name: "Ana Silva", type: "Retorno" },
                    { time: "09:30", name: "Carlos M.", type: "Novo" },
                    { time: "10:00", name: "Julia S.", type: "Telemedicina", video: true },
                  ].map((apt, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="text-xs font-mono text-slate-500">{apt.time}</div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-[10px]">
                        {apt.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{apt.name}</p>
                        <p className="text-[10px] text-slate-500">{apt.type}</p>
                      </div>
                      {apt.video && (
                        <div className="flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                          <Video className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Preciso instalar algum software?",
      answer: "Não! O CheckMed funciona 100% no navegador. Basta acessar e logar. Seus pacientes também não precisam instalar nada para usar a telemedicina."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim. Utilizamos criptografia SSL 256-bit, servidores com backup diário, e estamos em conformidade com a LGPD. Você pode exportar seus dados a qualquer momento."
    },
    {
      question: "Como funciona o período de teste?",
      answer: "São 7 dias com acesso completo a todos os recursos, sem precisar cadastrar cartão de crédito. Se gostar, escolhe um plano. Se não, sem cobranças."
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim, sem fidelidade! Você cancela direto nas configurações da conta, sem precisar ligar ou pedir autorização. Seus dados ficam disponíveis por 30 dias após o cancelamento."
    },
    {
      question: "Tem suporte em português?",
      answer: "100%. Somos uma empresa brasileira com suporte por email e chat. Respondemos em até 24 horas em dias úteis."
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro_Display',system-ui,sans-serif]">

      {/* === NAVBAR === */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-12 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">CheckMed</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs text-slate-400">
            <a href="#recursos" className="hover:text-white transition">Recursos</a>
            <a href="#planos" className="hover:text-white transition">Planos</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
          <Link href="/register" className="text-xs text-sky-400 hover:text-sky-300 transition flex items-center gap-1">
            Começar <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative z-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-emerald-400 text-xs mb-6"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Sistema Médico Completo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6"
          >
            Sua clínica merece
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              tecnologia premium.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 max-w-lg mx-auto mb-10"
          >
            Agenda, telemedicina, prontuário com IA e financeiro. Tudo em um só lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="group px-8 py-4 bg-white text-black font-semibold rounded-full flex items-center gap-2 hover:bg-slate-100 transition">
              Testar 7 Dias Grátis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#recursos" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
              <Play className="w-4 h-4" /> Conhecer Recursos
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full px-4"
        >
          <DashboardMockup />
        </motion.div>
      </section>

      {/* === LOGOS / TRUST === */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs text-slate-600 mb-6">TECNOLOGIAS QUE USAMOS</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50">
            {["Supabase", "Next.js", "AWS", "Stripe", "WhatsApp API"].map((tech) => (
              <span key={tech} className="text-sm font-medium text-slate-500">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="recursos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Recursos poderosos, interface simples.
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Cada funcionalidade pensada para economizar seu tempo.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1: Agenda */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Agenda</span>
                  <h3 className="text-xl font-semibold mt-1">Online 24/7</h3>
                </div>
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Pacientes agendam sozinhos. Lembretes via WhatsApp.</p>
              <div className="h-40 rounded-xl overflow-hidden">
                <AgendaMockup />
              </div>
            </motion.div>

            {/* Feature 2: Telemedicina */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-violet-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-violet-400 text-xs font-medium uppercase tracking-wider">Telemedicina</span>
                  <h3 className="text-xl font-semibold mt-1">HD Integrado</h3>
                </div>
                <Video className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Videochamadas sem instalar nada. Gravação opcional.</p>
              <div className="h-40 rounded-xl overflow-hidden">
                <TelemedMockup />
              </div>
            </motion.div>

            {/* Feature 3: IA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider">Prontuário IA</span>
                  <h3 className="text-xl font-semibold mt-1">Escreve Sozinho</h3>
                </div>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Fale com o paciente. A IA organiza o prontuário.</p>
              <div className="h-40 rounded-xl overflow-hidden">
                <AIMockup />
              </div>
            </motion.div>

            {/* Feature 4: Financeiro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-amber-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">Financeiro</span>
                  <h3 className="text-xl font-semibold mt-1">Controle Total</h3>
                </div>
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Receitas, despesas e repasses num dashboard claro.</p>
              <div className="h-40 rounded-xl overflow-hidden">
                <FinanceMockup />
              </div>
            </motion.div>

            {/* Feature 5: Segurança */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Segurança</span>
                  <h3 className="text-xl font-semibold mt-1">LGPD Compliant</h3>
                </div>
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Criptografia, backups e seus dados exportáveis.</p>
              <div className="h-40 rounded-xl overflow-hidden">
                <SecurityMockup />
              </div>
            </motion.div>

            {/* Feature 6: Suporte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 hover:border-rose-500/30 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-rose-400 text-xs font-medium uppercase tracking-wider">Suporte</span>
                  <h3 className="text-xl font-semibold mt-1">Humano, Rápido</h3>
                </div>
                <MessageSquare className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-slate-400 text-sm mb-4">Chat, email ou telefone. Sem robôs.</p>
              <div className="flex-1 flex items-center justify-center gap-4 py-4">
                <div className="flex -space-x-2">
                  {["👩‍💻", "👨‍💼", "👩‍🔧"].map((e, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0a0a0a] flex items-center justify-center text-lg">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Equipe Brasil</p>
                  <p className="text-xs text-slate-500">Resposta em até 2h</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === PRICING === */}
      <section id="planos" className="py-24 px-6 bg-gradient-to-b from-transparent via-[#050505] to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Planos honestos.
            </h2>
            <p className="text-slate-400">7 dias grátis. Cancele quando quiser.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Solo", price: "R$ 79", period: "/mês", features: ["1 Profissional", "Agenda Online", "Prontuário Digital"] },
              { name: "Clínica", price: "R$ 149", period: "/mês", features: ["Até 5 Profissionais", "Telemedicina HD", "IA Transcrição", "Financeiro"], popular: true },
              { name: "Rede", price: "Sob Consulta", period: "", features: ["Ilimitado", "API Própria", "Suporte Dedicado"] },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "relative p-8 rounded-3xl border transition-all",
                  plan.popular ? "bg-white text-black border-white" : "bg-white/[0.02] border-white/5"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}<span className={cn("text-sm font-normal", plan.popular ? "text-slate-500" : "text-slate-500")}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={cn("flex items-center gap-2 text-sm", plan.popular ? "text-slate-600" : "text-slate-400")}>
                      <CheckCircle2 className={cn("w-4 h-4", plan.popular ? "text-emerald-600" : "text-emerald-400")} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={cn("block w-full py-3 rounded-full text-center text-sm font-semibold transition", plan.popular ? "bg-black text-white hover:bg-slate-800" : "bg-white/5 text-white hover:bg-white/10")}>
                  Começar
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400">Tire suas dúvidas antes de começar.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Experimente grátis.
          </h2>
          <p className="text-slate-400 mb-10">
            Configure em 5 minutos. Sem cartão de crédito.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition">
            Criar Conta Grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>CheckMed © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
