import type { Role } from "./data";

export type NavItem = { href: string; label: string; icon: string };

const ALL: Record<string, NavItem> = {
  dashboard: { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  approvals: { href: "/approvals", label: "Approvals", icon: "CheckSquare" },
  projects: { href: "/projects", label: "Projects", icon: "Building2" },
  own: { href: "/own-projects", label: "Own Projects & Sales", icon: "Home" },
  enquiries: { href: "/enquiries", label: "Enquiries & Quotes", icon: "Briefcase" },
  dpr: { href: "/daily-reports", label: "Daily Reports", icon: "ClipboardList" },
  attendance: { href: "/attendance", label: "Attendance", icon: "Users" },
  store: { href: "/store", label: "Store & Purchase", icon: "Package" },
  quality: { href: "/quality", label: "Quality & Delays", icon: "ShieldCheck" },
  billing: { href: "/billing", label: "Billing & Collections", icon: "Receipt" },
  co: { href: "/change-orders", label: "Change Orders", icon: "FilePen" },
  payments: { href: "/payments", label: "Payments & Payroll", icon: "Wallet" },
  maintenance: { href: "/maintenance", label: "Maintenance", icon: "Wrench" },
  reports: { href: "/reports", label: "Reports & MIS", icon: "BarChart3" },
  admin: { href: "/admin", label: "Admin & Masters", icon: "Settings" },
  alerts: { href: "/alerts", label: "Alerts", icon: "Bell" },
};

const byRole: Record<Role, string[]> = {
  owner: ["dashboard", "approvals", "projects", "own", "enquiries", "billing", "co", "payments", "store", "quality", "maintenance", "reports", "admin", "alerts"],
  admin: ["dashboard", "admin", "projects", "reports", "alerts"],
  sales: ["dashboard", "enquiries", "own", "maintenance", "projects", "alerts"],
  pm: ["dashboard", "approvals", "projects", "dpr", "attendance", "quality", "co", "store", "maintenance", "reports", "alerts"],
  site: ["dashboard", "projects", "dpr", "attendance", "store", "quality", "alerts"],
  supervisor: ["dashboard", "attendance", "dpr", "alerts"],
  store: ["dashboard", "store", "alerts"],
  billing: ["dashboard", "billing", "co", "projects", "quality", "alerts"],
  accountant: ["dashboard", "payments", "billing", "reports", "alerts"],
  technician: ["dashboard", "maintenance", "alerts"],
  client: ["dashboard", "projects", "billing", "co", "maintenance", "alerts"],
};

export const clientLabels: Record<string, string> = {
  "/projects": "My Project",
  "/billing": "Bills & Payments",
  "/change-orders": "Change Approvals",
  "/maintenance": "Complaints",
};

export function navFor(role: Role): NavItem[] {
  return byRole[role].map((k) => {
    const n = ALL[k];
    return role === "client" && clientLabels[n.href] ? { ...n, label: clientLabels[n.href] } : n;
  });
}

export function allowed(role: Role, path: string) {
  if (path === "/dashboard") return true;
  return byRole[role].some((k) => path === ALL[k].href || path.startsWith(ALL[k].href + "/"));
}
