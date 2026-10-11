import { Suspense } from "react";
import type { ReactNode } from "react";
import { connection } from "next/server";
import Dashboard from "@/components/layout/dashboard";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { PinGate } from "@/features/auth/components/pin-gate";
import { getSessionUser } from "@/features/auth/lib/session";
import { fetchAppSettings } from "@/features/settings/actions/settings-actions";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<Suspense fallback={<LoadingIndicator label="Loading your space" />}>
			<AuthenticatedDashboard>{children}</AuthenticatedDashboard>
		</Suspense>
	);
}

async function AuthenticatedDashboard({ children }: { children: ReactNode }) {
	await connection();
	const user = await getSessionUser();
	if (!user) return <PinGate />;
	const { settings, isStored } = await fetchAppSettings();
	return <Dashboard user={user} initialSettings={settings} migrateLocalSettings={!isStored}>{children}</Dashboard>;
}
