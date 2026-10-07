import type { ReactNode } from "react";
import Dashboard from "@/components/layout/dashboard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <Dashboard>{children}</Dashboard>;
}
