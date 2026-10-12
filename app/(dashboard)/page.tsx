import { Suspense } from "react";
import { connection } from "next/server";
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
	return <PasswordManager initialEntries={initialEntries} initialError={initialError} />;
}

export default function DashboardPage() {
	return (
		<Suspense fallback={null}>
			<DashboardContent />
		</Suspense>
	);
}
