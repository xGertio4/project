// src/lib/store.js
import { useState, useEffect, useCallback } from "react";

// ---- Generic localStorage hook ----
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}

// ---- Theme ----
export function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("dg_theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("dg_theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark];
}

// ---- Hash router for /admin ----
export function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return [route, navigate];
}

// ---- File → base64 ----
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

// ---- CSV export ----
export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(","))
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Toast system ----
let toastListeners = [];
export const toast = (msg, type = "success") => {
  toastListeners.forEach(fn => fn({ id: Date.now() + Math.random(), msg, type }));
};
export function useToasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fn = (t) => {
      setItems(prev => [...prev, t]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 3000);
    };
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(f => f !== fn); };
  }, []);
  return items;
}

// ---- Default solar config ----
export const DEFAULT_SOLAR = {
  kwhPriceEUR: 0.08, kwhPerPanelYear: 500, costPerPanelEUR: 250,
  savingsPct: 0.75, allToEur: 0.0088
};

// ---- Default settings ----
export const DEFAULT_SETTINGS = {
  companyName: "Dervishi Group",
  phone: "+355 68 203 3446",
  email: "info@dervishigroup.com",
  address: "Rruga 31 Gushti, Belsh, Albania",
  hours: "Mon-Sat 07:00-18:00",
  facebook: "https://www.facebook.com/hidrosanitare.saer/",
  instagram: "https://www.instagram.com/dervishi_group/",
  whatsapp: "355682033446",
};

// ---- Auth (sessionStorage so it clears on tab close) ----
export const ADMIN_CREDENTIALS = {
  email: "**REMOVED**",
  password: "**REMOVED**"
};

export function useAuth() {
  const [user, setUserState] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("dg_auth") || "null"); } catch { return null; }
  });
  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) sessionStorage.setItem("dg_auth", JSON.stringify(u));
    else sessionStorage.removeItem("dg_auth");
  }, []);
  return [user, setUser];
}