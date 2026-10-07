import type { ReactNode } from "react";
import Dashboard from "@/components/layout/dashboard";
import { PinGate } from "@/features/auth/components/pin-gate";
import { isAuthenticated } from "@/features/auth/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
	if (!(await isAuthenticated())) return <PinGate />;
	return <Dashboard>{children}</Dashboard>;
}
