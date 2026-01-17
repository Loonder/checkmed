"use client";

import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold mb-2">Política de Privacidade</h1>
                <p className="text-slate-500 mb-12">Última atualização: Janeiro de 2026</p>

                <div className="prose prose-invert prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">1. Informações que Coletamos</h2>
                        <p className="text-slate-400 leading-relaxed">
                            O CheckMed coleta informações fornecidas diretamente por você ao criar uma conta,
                            como nome, email, telefone e dados da clínica. Também coletamos dados de uso do
                            sistema para melhorar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">2. Como Usamos Suas Informações</h2>
                        <ul className="text-slate-400 space-y-2 list-disc list-inside">
                            <li>Fornecer e manter o serviço CheckMed</li>
                            <li>Enviar notificações importantes sobre sua conta</li>
                            <li>Responder a solicitações de suporte</li>
                            <li>Melhorar a experiência do usuário</li>
                            <li>Cumprir obrigações legais</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">3. Proteção de Dados (LGPD)</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
                            garantimos que seus dados pessoais são tratados com segurança e transparência.
                            Você tem direito a:
                        </p>
                        <ul className="text-slate-400 space-y-2 list-disc list-inside mt-4">
                            <li>Acessar seus dados pessoais</li>
                            <li>Corrigir dados incompletos ou desatualizados</li>
                            <li>Solicitar a exclusão de seus dados</li>
                            <li>Revogar consentimentos dados anteriormente</li>
                            <li>Portabilidade dos dados para outro serviço</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">4. Dados de Pacientes</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Os dados de pacientes inseridos no sistema são de responsabilidade da clínica
                            usuária. O CheckMed atua como operador desses dados, implementando medidas
                            técnicas de segurança, mas a clínica é a controladora perante seus pacientes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">5. Segurança</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Utilizamos criptografia SSL/TLS em todas as comunicações, armazenamento
                            seguro em servidores no Brasil, backups automáticos diários e controle de
                            acesso baseado em funções (RBAC).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">6. Cookies</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Utilizamos cookies essenciais para funcionamento do sistema e cookies
                            analíticos para entender como você usa o CheckMed. Você pode desabilitar
                            cookies no seu navegador, mas algumas funcionalidades podem ser afetadas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">7. Retenção de Dados</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Mantemos seus dados enquanto sua conta estiver ativa. Após cancelamento,
                            os dados são retidos por 30 dias para possível recuperação, depois são
                            permanentemente excluídos, exceto quando a lei exigir retenção maior.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">8. Contato</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em
                            contato pelo email: <a href="mailto:privacidade@checkmed.shop" className="text-emerald-400 hover:underline">privacidade@checkmed.shop</a>
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
