// Loading Skeleton Components
// Reusable skeleton components for professional loading states

import { motion } from "framer-motion";

// Base Skeleton Component
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] rounded ${className}`}
            style={{ animation: "shimmer 2s infinite" }}
        />
    );
}

// Calendar Month Skeleton
export function MonthViewSkeleton() {
    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden p-6 space-y-4">
            {/* Header Days */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square">
                        <Skeleton className="w-full h-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Week View Skeleton
export function WeekViewSkeleton() {
    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 gap-4 p-4 bg-slate-900/50 border-b border-slate-700/50">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                ))}
            </div>

            {/* Timeline */}
            <div className="space-y-2 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-8 gap-4">
                        <Skeleton className="h-20" />
                        {Array.from({ length: 7 }).map((_, j) => (
                            <Skeleton key={j} className="h-20" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Dashboard Card Skeleton
export function DashboardCardSkeleton() {
    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-4 w-full" />
        </div>
    );
}

// Appointment List Skeleton
export function AppointmentListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Table Skeleton
export function TableSkeleton({ rows = 10, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-700/30 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid gap-4 p-4 border-b border-slate-700/30 bg-slate-900/50" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-6" />
                ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-700/30">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton key={j} className="h-5" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Shimmer animation CSS (add to global CSS)
const shimmerStyles = `
@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}
`;

export { shimmerStyles };
