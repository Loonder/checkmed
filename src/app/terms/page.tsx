"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-white">
            {/* Navbar */}
            <nav className="border-b border-white/5">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-4xl">
                    <Link href="/" className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="font-semibold">CheckMed</span>
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Termos de Uso</h1>
                <p className="text-slate-500 mb-12">Última atualização: Janeiro de 2026</p>

                <div className="prose prose-invert prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Ao acessar e usar o CheckMed, você concorda com estes Termos de Uso.
                            Se não concordar com algum termo, não utilize o serviço.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
                        <p className="text-slate-400 leading-relaxed">
                            O CheckMed é uma plataforma de gestão para clínicas e consultórios médicos,
                            oferecendo funcionalidades de agenda, prontuário eletrônico, telemedicina
                            e gestão financeira.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">3. Conta de Usuário</h2>
                        <ul className="text-slate-400 space-y-2 list-disc list-inside">
                            <li>Você é responsável por manter a segurança da sua conta</li>
                            <li>Não compartilhe suas credenciais de acesso</li>
                            <li>Notifique imediatamente sobre uso não autorizado</li>
                            <li>Você é responsável por todas as atividades em sua conta</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Uso Aceitável</h2>
                        <p className="text-slate-400 leading-relaxed mb-4">
                            Você concorda em não usar o CheckMed para:
                        </p>
                        <ul className="text-slate-400 space-y-2 list-disc list-inside">
                            <li>Violar leis ou regulamentos aplicáveis</li>
                            <li>Transmitir vírus ou código malicioso</li>
                            <li>Tentar acessar sistemas sem autorização</li>
                            <li>Usar para fins diferentes de gestão de saúde</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Pagamentos e Assinaturas</h2>
                        <ul className="text-slate-400 space-y-2 list-disc list-inside">
                            <li>Os planos são cobrados mensalmente</li>
                            <li>Você pode cancelar a qualquer momento</li>
                            <li>Não há reembolso para períodos parciais</li>
                            <li>Preços podem ser alterados com 30 dias de aviso</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">6. Propriedade Intelectual</h2>
                        <p className="text-slate-400 leading-relaxed">
                            O CheckMed e todo seu conteúdo, incluindo software, design e marca,
                            são propriedade exclusiva da CheckMed Systems. Você recebe uma licença
                            limitada e não exclusiva para usar o serviço conforme estes termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">7. Limitação de Responsabilidade</h2>
                        <p className="text-slate-400 leading-relaxed">
                            O CheckMed é fornecido "como está". Não garantimos que o serviço será
                            ininterrupto ou livre de erros. Não somos responsáveis por decisões
                            médicas tomadas com base em informações do sistema.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">8. Rescisão</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Podemos suspender ou encerrar sua conta por violação destes termos.
                            Você pode encerrar sua conta a qualquer momento através das configurações.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">9. Alterações nos Termos</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Podemos atualizar estes termos periodicamente. Alterações significativas
                            serão comunicadas por email com pelo menos 15 dias de antecedência.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">10. Legislação Aplicável</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Estes termos são regidos pelas leis da República Federativa do Brasil.
                            Qualquer disputa será resolvida no foro da comarca de São Paulo, SP.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">11. Contato</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Para dúvidas sobre estes termos, entre em contato: <a href="mailto:contato@checkmed.shop" className="text-emerald-400 hover:underline">contato@checkmed.shop</a>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-16">
                <div className="container mx-auto px-6 max-w-4xl flex justify-between items-center text-sm text-slate-500">
                    <span>© 2026 CheckMed</span>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white">Privacidade</Link>
                        <Link href="/terms" className="hover:text-white">Termos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
