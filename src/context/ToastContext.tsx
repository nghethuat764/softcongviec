import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number; // duration in ms, default 3000ms
  id?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  show: (type: ToastType, title: string, description?: string, options?: ToastOptions) => string;
  success: (title: string, description?: string, options?: ToastOptions) => string;
  error: (title: string, description?: string, options?: ToastOptions) => string;
  warning: (title: string, description?: string, options?: ToastOptions) => string;
  info: (title: string, description?: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const DEFAULT_DURATION = 3000;
const MAX_CONCURRENT_TOASTS = 5;

// Singleton event dispatcher for standalone toast.* calls
type ToastListener = (action: { type: 'show'; toast: ToastItem } | { type: 'dismiss'; id: string } | { type: 'dismissAll' }) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  show: (type: ToastType, title: string, description?: string, options?: ToastOptions): string => {
    const id = options?.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const item: ToastItem = {
      id,
      type,
      title,
      description,
      duration: options?.duration !== undefined ? options.duration : DEFAULT_DURATION,
    };
    listeners.forEach((listener) => listener({ type: 'show', toast: item }));
    return id;
  },
  success: (title: string, description?: string, options?: ToastOptions) =>
    toast.show('success', title, description, options),
  error: (title: string, description?: string, options?: ToastOptions) =>
    toast.show('error', title, description, options),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    toast.show('warning', title, description, options),
  info: (title: string, description?: string, options?: ToastOptions) =>
    toast.show('info', title, description, options),
  dismiss: (id: string) => {
    listeners.forEach((listener) => listener({ type: 'dismiss', id }));
  },
  dismissAll: () => {
    listeners.forEach((listener) => listener({ type: 'dismissAll' }));
  },
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Individual Toast Component with hover pause/resume & animated progress bar
const ToastCard: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const [remainingTime, setRemainingTime] = useState(item.duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const totalDuration = item.duration;

  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Give time for fade-out animation before actual removal
    setTimeout(() => {
      onDismiss(item.id);
    }, 200);
  }, [isExiting, item.id, onDismiss]);

  // Main countdown timer logic
  useEffect(() => {
    if (isPaused || isExiting) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTime);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, remainingTime, handleClose, isExiting]);

  // Smooth progress bar update via requestAnimationFrame
  useEffect(() => {
    if (isPaused || isExiting) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let active = true;
    const updateProgress = () => {
      if (!active) return;
      const elapsedSinceResume = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTime - elapsedSinceResume);
      
      // Update at smooth intervals
      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, remainingTime, isExiting]);

  const handleMouseEnter = () => {
    if (isExiting) return;
    const elapsedSinceResume = Date.now() - startTimeRef.current;
    const updatedRemaining = Math.max(0, remainingTime - elapsedSinceResume);
    setRemainingTime(updatedRemaining);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (isExiting) return;
    setIsPaused(false);
  };

  // Status-specific themes
  const config = {
    success: {
      borderColor: 'border-emerald-300 dark:border-emerald-800/80',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      barColor: 'bg-emerald-500',
      shadowColor: 'shadow-emerald-900/10',
      icon: CheckCircle2,
      role: 'status' as const,
    },
    error: {
      borderColor: 'border-rose-300 dark:border-rose-800/80',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeText: 'text-rose-600 dark:text-rose-400',
      barColor: 'bg-rose-500',
      shadowColor: 'shadow-rose-900/10',
      icon: XCircle,
      role: 'alert' as const,
    },
    warning: {
      borderColor: 'border-amber-300 dark:border-amber-800/80',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeText: 'text-amber-600 dark:text-amber-400',
      barColor: 'bg-amber-500',
      shadowColor: 'shadow-amber-900/10',
      icon: AlertTriangle,
      role: 'alert' as const,
    },
    info: {
      borderColor: 'border-sky-300 dark:border-sky-800/80',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
      badgeText: 'text-sky-600 dark:text-sky-400',
      barColor: 'bg-sky-500',
      shadowColor: 'shadow-sky-900/10',
      icon: Info,
      role: 'status' as const,
    },
  }[item.type];

  const StatusIcon = config.icon;

  return (
    <div
      role={config.role}
      aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`app-toast-item pointer-events-auto relative w-full sm:w-[380px] max-w-[calc(100vw-32px)] bg-white/95 dark:bg-[#131c31]/95 backdrop-blur-md rounded-2xl border ${config.borderColor} shadow-xl ${config.shadowColor} overflow-hidden transition-all duration-200 select-none ${
        isExiting ? 'app-toast-exit' : 'app-toast-enter'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Status Icon Badge */}
        <div className={`w-9 h-9 rounded-xl ${config.badgeBg} ${config.badgeText} flex items-center justify-center shrink-0 shadow-xs border border-black/5 dark:border-white/5`}>
          <StatusIcon className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 leading-tight tracking-tight line-clamp-1">
              {item.title}
            </h4>
          </div>
          {item.description && (
            <p className="text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300 mt-1 break-words line-clamp-3 font-normal">
              {item.description}
            </p>
          )}
        </div>

        {/* Manual Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng thông báo"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer shrink-0 mt-0.5"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Progress Bar with pause state animation */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${config.barColor} app-toast-progress-bar`}
          style={{
            animationDuration: `${totalDuration}ms`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const show = useCallback(
    (type: ToastType, title: string, description?: string, options?: ToastOptions): string => {
      const id = options?.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = options?.duration !== undefined ? options.duration : DEFAULT_DURATION;
      const newToast: ToastItem = {
        id,
        type,
        title,
        description,
        duration,
      };

      // Stack: Newest toast appears at the top, limit to MAX_CONCURRENT_TOASTS
      setToasts((prev) => [newToast, ...prev.filter((t) => t.id !== id)].slice(0, MAX_CONCURRENT_TOASTS));
      return id;
    },
    []
  );

  const success = useCallback((title: string, description?: string, options?: ToastOptions) => {
    return show('success', title, description, options);
  }, [show]);

  const error = useCallback((title: string, description?: string, options?: ToastOptions) => {
    return show('error', title, description, options);
  }, [show]);

  const warning = useCallback((title: string, description?: string, options?: ToastOptions) => {
    return show('warning', title, description, options);
  }, [show]);

  const info = useCallback((title: string, description?: string, options?: ToastOptions) => {
    return show('info', title, description, options);
  }, [show]);

  // Connect singleton toast listeners to state
  useEffect(() => {
    const handleAction: ToastListener = (action) => {
      if (action.type === 'show') {
        setToasts((prev) => [action.toast, ...prev.filter((t) => t.id !== action.toast.id)].slice(0, MAX_CONCURRENT_TOASTS));
      } else if (action.type === 'dismiss') {
        setToasts((prev) => prev.filter((t) => t.id !== action.id));
      } else if (action.type === 'dismissAll') {
        setToasts([]);
      }
    };

    listeners.add(handleAction);
    return () => {
      listeners.delete(handleAction);
    };
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Global Toast Container positioned at bottom-right viewport */}
      <div
        className="app-toast-container fixed bottom-14 right-4 sm:bottom-14 sm:right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-32px)] sm:w-auto"
        aria-label="Thông báo hệ thống"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, fallback to standalone singleton
    return {
      toasts: [],
      show: toast.show,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      dismiss: toast.dismiss,
      dismissAll: toast.dismissAll,
    };
  }
  return context;
};
