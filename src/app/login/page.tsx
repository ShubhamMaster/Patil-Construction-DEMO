"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, inputCls } from "@/components/ui";
import { roleLabel, users, type User } from "@/lib/data";
import { useDemo } from "@/lib/store";

const roleIcon: Record<string, string> = {
  owner: "Crown", admin: "Settings", sales: "Briefcase", pm: "ClipboardCheck", site: "HardHat", supervisor: "Users",
  store: "Package", billing: "Receipt", accountant: "Wallet", technician: "Wrench", client: "UserRound",
};
const roleHint: Record<string, string> = {
  owner: "All projects, money, approvals", admin: "Users, masters, licences", sales: "Enquiries, quotes, flat sales",
  pm: "Sites, approvals, delays", site: "Daily report, indents, tests", supervisor: "Attendance, site work",
  store: "Stock, GRN, purchase", billing: "Bills, change orders", accountant: "Payments, payroll, receipts",
  technician: "Complaints, maintenance jobs", client: "Progress, bills, approvals",
};

export default function LoginPage() {
  const { login, user, ready } = useDemo();
  const router = useRouter();
  const [email, setEmail] = useState(users[0].email);
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  useEffect(() => { if (ready && user) router.replace("/dashboard"); }, [ready, user, router]);

  const go = (u: User) => { login(u); router.push("/dashboard"); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || password !== "demo123") { setError("Wrong email or password. Demo password is demo123."); return; }
    go(u);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.15fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600"><Icon name="HardHat" className="h-6 w-6" /></div>
          <div>
            <div className="text-lg font-semibold">Patil Constructions</div>
            <div className="text-sm text-slate-400">Company Management System</div>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-3xl font-semibold leading-tight">One owner. Every project.<br />Every rupee in one place.</h1>
          <p className="mt-4 max-w-md text-slate-400">Contract works, own projects, maintenance and payments - from enquiry to final retention, on web and mobile.</p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {[["6", "Live projects"], ["₹12.15 Cr", "Work in hand"], ["11", "User roles"]].map(([a, b]) => (
              <div key={b} className="rounded-xl bg-white/5 p-3"><div className="text-xl font-semibold text-orange-400">{a}</div><div className="text-xs text-slate-400">{b}</div></div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-500">Demo build · sample data only</div>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white"><Icon name="HardHat" className="h-5 w-5" /></div>
            <div><div className="font-semibold">Patil Constructions</div><div className="text-xs text-slate-500">Company Management System</div></div>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use your work email, or pick a role below for a quick demo login.</p>

          <form onSubmit={submit} className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Email</span>
              <select className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)}>
                {users.map((u) => <option key={u.id} value={u.email}>{u.email} - {roleLabel[u.role]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Password</span>
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">Sign in</button>
            <p className="text-center text-xs text-slate-400">Demo password for all users: <b className="text-slate-600">demo123</b></p>
          </form>

          <div className="mt-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick demo login</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {users.map((u) => (
                <button key={u.id} onClick={() => go(u)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-orange-400 hover:shadow">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${u.role === "client" ? "bg-sky-100 text-sky-700" : "bg-orange-50 text-orange-700"} group-hover:bg-orange-600 group-hover:text-white`}>
                    <Icon name={roleIcon[u.role]} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{roleLabel[u.role]}</span>
                    <span className="block truncate text-xs text-slate-500">{u.name} · {roleHint[u.role]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
