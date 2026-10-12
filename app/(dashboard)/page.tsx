import { connection } from "next/server";
import { DashboardNavigationReady } from "@/components/layout/dashboard-navigation-progress";
import { getPasswordEntries } from "@/features/passwords/actions/password-actions";
import { PasswordManager } from "@/features/passwords/components/password-manager";
import type { PasswordEntry } from "@/features/passwords/types";

export const instant = false;

async function DashboardContent() {
	await connection();
	let initialEntries: PasswordEntry[] = [];
	let initialError = "";
	try {
		initialEntries = await getPasswordEntries();
	} catch (error) {
		initialError = error instanceof Error ? `Could not load passwords: ${error.message}` : "Could not load passwords from the database.";
	}
	return (
		<>
			<DashboardNavigationReady href="/" />
			<PasswordManager initialEntries={initialEntries} initialError={initialError} />
		</>
	);
}

export default function DashboardPage() {
	return <DashboardContent />;
}
