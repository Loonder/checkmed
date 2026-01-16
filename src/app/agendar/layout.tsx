export default function PublicBookingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30">
            {/* Simple Header for Trust */}
            <header className="bg-white border-b border-slate-200 py-4">
                <div className="container mx-auto px-4 flex justify-center">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xl">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                        </div>
                        CheckMed
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {children}
            </main>
            <footer className="text-center py-8 text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} CheckMed Saúde - Agendamento Seguro</p>
            </footer>
        </div>
    );
}
