import { connection } from "next/server";
import { redirect } from "next/navigation";
import { fetchAppSettings } from "@/features/settings/actions/settings-actions";

export const instant = false;

export default async function DashboardPage() {
	await connection();
	let targetHref = "/passwords";

	try {
		const { settings } = await fetchAppSettings();
		if (settings?.navigationOrder?.[0]) {
			targetHref = settings.navigationOrder[0];
		}
	} catch {
		// Fallback to default passwords page if settings cannot be loaded
	}

	redirect(targetHref);
}

