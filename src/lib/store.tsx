"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as seed from "./data";
import type { Role, User } from "./data";

const KEY = "ccms-demo-state-v3";
const USER_KEY = "ccms-demo-user";

function initialState() {
  return {
    projects: seed.projects,
    enquiries: seed.enquiries,
    bills: seed.bills,
    changeOrders: seed.changeOrders,
    delays: seed.delays,
    dprs: seed.dprs,
    workers: seed.workers,
    attendanceSaved: false,
    wageRows: seed.wageRows,
    stock: seed.stock,
    indents: seed.indents,
    pos: seed.pos,
    grns: seed.grns,
    tests: seed.tests,
    staff: seed.staff,
    payables: seed.payables,
    complaints: seed.complaints,
    jobCards: seed.jobCards,
    pmJobs: seed.pmJobs,
    units: seed.units,
    auditLog: seed.auditLog,
  };
}
export type DemoState = ReturnType<typeof initialState>;

type Ctx = {
  ready: boolean;
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  state: DemoState;
  update: (fn: (s: DemoState) => DemoState, log?: string) => void;
  reset: () => void;
  toast: string | null;
  notify: (msg: string) => void;
};

const DemoCtx = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<DemoState>(initialState);
  const [toast, setToast] = useState<string | null>(null);

  // Saved demo data lives in localStorage, which only exists after mount (avoids hydration mismatch).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState(), ...JSON.parse(raw) });
      const uid = localStorage.getItem(USER_KEY);
      if (uid) setUser(seed.users.find((u) => u.id === uid) ?? null);
    } catch { /* ignore broken storage */ }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const update = useCallback((fn: (s: DemoState) => DemoState, log?: string) => {
    setState((s) => {
      const next = fn(s);
      if (log && user) {
        const now = new Date();
        const at = `${seed.DEMO_TODAY} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return { ...next, auditLog: [{ at, user: user.name, action: log }, ...next.auditLog] };
      }
      return next;
    });
  }, [user]);

  const value = useMemo<Ctx>(() => ({
    ready, user, state, update, toast, notify,
    login: (u) => { localStorage.setItem(USER_KEY, u.id); setUser(u); },
    logout: () => { localStorage.removeItem(USER_KEY); setUser(null); },
    reset: () => { localStorage.removeItem(KEY); setState(initialState()); },
  }), [ready, user, state, update, toast, notify]);

  return <DemoCtx.Provider value={value}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo outside DemoProvider");
  return c;
}

/** Projects the current user may see. */
export function useMyProjects() {
  const { user, state } = useDemo();
  if (!user) return [];
  if (user.projects.includes("*")) return state.projects;
  return state.projects.filter((p) => user.projects.includes(p.id));
}

export function can(role: Role | undefined, ...roles: Role[]) {
  return !!role && roles.includes(role);
}
