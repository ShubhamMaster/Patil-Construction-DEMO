"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Card, PageHeader, Progress, Icon, inputCls } from "@/components/ui";
import { fdate, inrShort } from "@/lib/format";
import { useDemo, useMyProjects } from "@/lib/store";

const cats = ["All", "Client Contract", "Own Project", "Maintenance", "Renovation", "Reconstruction", "Interior"];

export default function ProjectsPage() {
  const { user } = useDemo();
  const router = useRouter();
  const list = useMyProjects();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  useEffect(() => { if (user?.role === "client") router.replace("/projects/P-A"); }, [user, router]);
  const rows = list.filter((p) => (cat === "All" || p.category === cat) && (p.name + p.client + p.location).toLowerCase().includes(q.toLowerCase()));
  const showMoney = user && !["site", "supervisor", "store"].includes(user.role);

  return (
    <>
      <PageHeader title="Projects" sub="All projects of the company - client contracts, own projects and maintenance" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{c}</button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Icon name="Search" className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input className={`${inputCls} pl-8`} placeholder="Search project, client, place" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="group">
            <Card className="h-full transition group-hover:border-orange-300 group-hover:shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">{p.code}</div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Icon name="MapPin" className="h-3 w-3" />{p.location}</div>
                </div>
                <Badge>{p.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone="orange">{p.category}</Badge><Badge>{p.type}</Badge></div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Progress {p.progress}%</span><span>Planned {p.planned}%</span></div>
                <Progress value={p.progress} planned={p.planned} tone={p.progress + 3 < p.planned ? "bg-amber-500" : "bg-emerald-500"} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div><div className="text-slate-400">{p.category === "Own Project" ? "Sale value" : "Value"}</div><div className="font-semibold">{showMoney ? inrShort(p.value) : "—"}</div></div>
                <div><div className="text-slate-400">Client</div><div className="truncate font-medium">{p.client}</div></div>
                <div><div className="text-slate-400">Finish</div><div className="font-medium">{fdate(p.end)}</div></div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
