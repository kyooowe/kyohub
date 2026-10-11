import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardLoading } from "@/components/layout/dashboard-loading";
import { getPasswordEntries } from "@/features/passwords/actions/password-actions";
import { PasswordManager } from "@/features/passwords/components/password-manager";
import type { PasswordEntry } from "@/features/passwords/types";

export const instant = false;

async function PasswordsContent() {
	await connection();
	let initialEntries: PasswordEntry[] = [];
	let initialError = "";
	try {
		initialEntries = await getPasswordEntries();
	} catch (error) {
		initialError = error instanceof Error ? `Could not load passwords: ${error.message}` : "Could not load passwords from the database.";
	}
	return <PasswordManager initialEntries={initialEntries} initialError={initialError} />;
}

export default function PasswordsPage() {
	return (
		<Suspense fallback={<DashboardLoading />}>
			<PasswordsContent />
		</Suspense>
	);
}
