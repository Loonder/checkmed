"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold mb-2">Erro Crítico</h1>
                        <p className="text-slate-400">
                            Ocorreu um erro irrecuperável na aplicação.
                        </p>
                    </div>

                    <button
                        onClick={reset}
                        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition w-full"
                    >
                        Recarregar Aplicação
                    </button>
                </div>
            </body>
        </html>
    );
}
