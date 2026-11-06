"use client";

import { RoleDashboard } from "@/components/dashboards";
import { useDemo } from "@/lib/store";

export default function DashboardPage() {
  const { user } = useDemo();
  if (!user) return null;
  return <RoleDashboard role={user.role} />;
}
