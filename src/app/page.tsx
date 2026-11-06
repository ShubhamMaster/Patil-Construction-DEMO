"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/store";

export default function Home() {
  const { ready, user } = useDemo();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(user ? "/dashboard" : "/login");
  }, [ready, user, router]);
  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Loading…</div>;
}
