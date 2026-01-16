"use client";

import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Clock, Users, CheckCircle2, Star, Video, Mic, DollarSign, Calendar, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth Scroll Helper
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30">

      {/* 1. NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">CheckMed<span className="text-emerald-400">PRO</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollTo('features')} className="hover:text-white transition">Funcionalidades</button>
            <button onClick={() => scrollTo('about')} className="hover:text-white transition">Sobre</button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition">Planos</button>
            <Link href="/login" className="px-5 py-2.5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition">
              Entrar
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 text-slate-300">
                <button onClick={() => scrollTo('features')} className="text-left py-2">Funcionalidades</button>
                <button onClick={() => scrollTo('about')} className="text-left py-2">Sobre</button>
                <button onClick={() => scrollTo('pricing')} className="text-left py-2">Planos</button>
                <Link href="/login" className="bg-emerald-500 text-white py-3 rounded-lg text-center font-bold">
                  Acessar Plataforma
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700 text-emerald-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              CheckMed v2 MAX disponível
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              O Sistema Operacional da <br />
              <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Sua Clínica Inteligente</span>
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Agendamento online, telemedicina, prontuário com IA e gestão financeira.
              Tudo em uma única plataforma bonita e fácil de usar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group">
                Começar Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <button onClick={() => scrollTo('features')} className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition">
                Ver Funcionalidades
              </button>
            </div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl">
              <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800/50">
                {/* This would be an image in real prod */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-800/50" />
                <div className="text-center z-10">
                  <Activity className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-500 font-mono text-sm">Dashboard Interface Preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. LOGOS / SOCIAL PROOF */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-900/20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500 mb-8 uppercase tracking-widest font-bold">Confiança de clínicas em todo o Brasil</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition duration-500">
            {/* Mock Logos */}
            {["MediClinic", "VidaSaúde", "Hospital São Lucas", "CardioCenter", "OrtoPlus"].map((brand) => (
              <div key={brand} className="text-xl font-bold text-white">{brand}</div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-32 container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Tudo que você precisa em um só lugar.</h2>
          <p className="text-slate-400 text-lg">Substitua 5 ferramentas diferentes pelo CheckMed. Integramos jornada do paciente, clínica e financeiro.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Calendar}
            title="Agenda Inteligente"
            desc="Agendamento online 24/7. O paciente se agenda, você apenas confirma. Redução de 80% no tempo de secretaria."
            color="text-emerald-400"
          />
          <FeatureCard
            icon={Video}
            title="Telemedicina HD"
            desc="Videochamadas criptografadas integradas. Sem links externos, sem instalação. Tudo no navegador."
            color="text-sky-400"
          />
          <FeatureCard
            icon={Mic}
            title="AI Scribe"
            desc="Ouvimos sua consulta e a IA escreve o prontuário. Foco no paciente, não no teclado."
            color="text-indigo-400"
          />
          <FeatureCard
            icon={DollarSign}
            title="Gestão Financeira"
            desc="Controle de caixa, TISS, repasses médicos e boletos. Painéis claros de receita e despesa."
            color="text-amber-400"
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Segurança de Dados"
            desc="Conformidade total com LGPD. Seus dados criptografados e com backups diários automáticos."
            color="text-rose-400"
          />
          <FeatureCard
            icon={Users}
            title="CRM de Pacientes"
            desc="Fidelize com lembretes automáticos via WhatsApp e campanhas de retorno."
            color="text-purple-400"
          />
        </div>
      </section>

      {/* 5. ABOUT SECTION (#sobre) */}
      <section id="about" className="py-32 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Sobre o CheckMed</h2>
              <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                <p>
                  Nascemos com uma missão simples: <strong>devolver o tempo ao médico</strong>.
                </p>
                <p>
                  Observamos que clínicas modernas perdiam horas com tarefas manuais, planilhas desconexas e softwares antigos.
                  O CheckMed é a resposta: uma plataforma 100% nuvem, rápida e bonita.
                </p>
                <ul className="space-y-4 mt-8">
                  {[
                    "Foco na experiência do usuário (UX)",
                    "Tecnologia de ponta (Next.js + AI)",
                    "Suporte humanizado 24h"
                  ].map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Dr. Ricardo Silva</div>
                    <div className="text-sm text-slate-500">Cardiologista</div>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "O CheckMed transformou minha clínica. O Agendamento Online lotou minha agenda sem eu precisar de mais secretárias. A AI Scribe é mágica."
                </p>
                <div className="flex gap-1 mt-4 text-amber-500">
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                  <Star className="fill-current w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING (#pricing) */}
      <section id="pricing" className="py-32 container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Planos Transparentes</h2>
          <p className="text-slate-400 text-lg">Comece pequeno e cresça conosco. Sem contratos de fidelidade.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name="Starter"
            price="R$ 197"
            desc="Para consultórios individuais."
            features={["1 Médico", "Agenda & Prontuário", "Agendamento Online", "Suporte Email"]}
          />
          <PricingCard
            name="Pro"
            price="R$ 397"
            isPopular
            desc="Para clínicas em crescimento."
            features={["Até 5 Médicos", "Telemedicina Ilimitada", "AI Scribe (20h/mês)", "Financeiro Completo", "Suporte WhatsApp"]}
          />
          <PricingCard
            name="Enterprise"
            price="Sob Consulta"
            desc="Para hospitais e redes."
            features={["Médicos Ilimitados", "API Personalizada", "Gestor de Conta", "White-Label", "Treinamento Presencial"]}
          />
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-20 text-slate-500 text-sm">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <Activity className="w-5 h-5 text-emerald-500" /> CheckMed
            </div>
            <p>Transformando a saúde com tecnologia e design.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollTo('features')} className="hover:text-emerald-400">Funcionalidades</button></li>
              <li><button onClick={() => scrollTo('pricing')} className="hover:text-emerald-400">Preços</button></li>
              <li><button onClick={() => scrollTo('hero')} className="hover:text-emerald-400">Atualizações</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><button onClick={() => scrollTo('about')} className="hover:text-emerald-400">Sobre Nós</button></li>
              <li><a href="#" className="hover:text-emerald-400">Carreiras</a></li>
              <li><a href="#" className="hover:text-emerald-400">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-emerald-400">Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-slate-900">
          © {new Date().getFullYear()} CheckMed Systems. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

// Helpers
function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition hover:-translate-y-1 duration-300">
      <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ name, price, desc, features, isPopular }: any) {
  return (
    <div className={cn(
      "p-8 rounded-3xl border flex flex-col items-center text-center relative transition hover:-translate-y-2 duration-300",
      isPopular ? "bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-500/10" : "bg-slate-950 border-slate-800"
    )}>
      {isPopular && (
        <div className="absolute -top-4 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
          MAIS POPULAR
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-slate-400 text-sm mb-6">{desc}</p>
      <div className="text-4xl font-bold text-white mb-8">{price}<span className="text-lg text-slate-500 font-normal">/mês</span></div>

      <ul className="space-y-4 w-full mb-8 text-left">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <button className={cn(
        "w-full py-4 rounded-xl font-bold transition",
        isPopular ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
      )}>
        Escolher Plano
      </button>
    </div>
  )
}
