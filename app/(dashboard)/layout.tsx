import type { ReactNode } from "react";
import Dashboard from "@/components/layout/dashboard";
import { PinGate } from "@/features/auth/components/pin-gate";
import { getSessionUser } from "@/features/auth/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
	const user = await getSessionUser();
	if (!user) return <PinGate />;
	return <Dashboard user={user}>{children}</Dashboard>;
}
