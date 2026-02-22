"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

// Global toast event system
const listeners: ((toast: ToastMessage) => void)[] = [];

export function showToast(message: string, type: ToastType = "success") {
  const toast: ToastMessage = { id: Date.now().toString(), message, type };
  listeners.forEach(l => l(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastMessage & { exiting?: boolean })[]>([]);

  useEffect(() => {
    const handler = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 300);
      }, 3000);
    };
    listeners.push(handler);
    return () => { const i = listeners.indexOf(handler); if (i > -1) listeners.splice(i, 1); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "8px" }}>
      {toasts.map(t => {
        const colors = {
          success: { bg: "#052e16", border: "rgba(34,197,94,0.3)", text: "#4ade80", icon: "✓" },
          error:   { bg: "#2d0a0a", border: "rgba(239,68,68,0.3)",  text: "#f87171", icon: "✕" },
          info:    { bg: "#0c1a2e", border: "rgba(201,168,76,0.3)", text: "var(--gold-light)", icon: "·" },
        }[t.type];
        return (
          <div key={t.id} className={t.exiting ? "toast-exit" : "toast-enter"} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 18px", borderRadius: "12px",
            background: colors.bg, border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            minWidth: "240px", maxWidth: "340px",
          }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: colors.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: colors.text, fontWeight: 700, flexShrink: 0 }}>{colors.icon}</span>
            <p style={{ fontSize: "13px", color: colors.text, fontWeight: 400, lineHeight: "1.4" }}>{t.message}</p>
          </div>
        );
      })}
    </div>
  );
}
