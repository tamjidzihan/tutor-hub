import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
    dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
let nextToastId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = nextToastId++;
        setToasts((current) => [...current, { id, message, type }].slice(-4));
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return undefined;
        const timeout = window.setTimeout(() => dismissToast(toasts[0].id), 4500);
        return () => window.clearTimeout(timeout);
    }, [toasts, dismissToast]);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast }}>
            {children}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(calc(100vw-2rem),24rem)] flex-col gap-3" aria-live="polite" aria-atomic="true">
                {toasts.map((toast) => {
                    const styles = {
                        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
                        error: 'border-red-200 bg-red-50 text-red-900',
                        info: 'border-sky-200 bg-sky-50 text-sky-900',
                    }[toast.type];
                    const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;

                    return (
                        <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${styles}`} role="status">
                            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                            <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
                            <button type="button" onClick={() => dismissToast(toast.id)} className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100" aria-label="Dismiss notification">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
