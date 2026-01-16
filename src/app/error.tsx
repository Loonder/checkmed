"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to Sentry or console
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-lg w-full glass-dark p-8 rounded-2xl border border-white/5 text-center shadow-2xl"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    Ops! Algo deu errado.
                </h2>
                <p className="text-slate-400 mb-8 whitespace-pre-wrap">
                    {process.env.NODE_ENV === 'development'
                        ? error.message
                        : "Não foi possível carregar esta página. Nossa equipe já foi notificada."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Tentar Novamente
                    </button>
                    <Link
                        href="/"
                        className="flex-1 px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Início
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-6 text-xs text-slate-600 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
