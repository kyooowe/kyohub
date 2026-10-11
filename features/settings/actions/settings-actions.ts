"use server";

import { db } from "@/prisma/db";
import { requireAuth } from "@/features/auth/lib/session";
import { defaultSettings, parseAppSettings, type AppSettings } from "@/components/settings/settings-model";

const sharedSettingsId = "shared";

export async function fetchAppSettings(): Promise<{ settings: AppSettings; isStored: boolean }> {
	await requireAuth();
	const row = await db.orm.public.AppSetting.first({ id: sharedSettingsId });
	if (!row) return { settings: defaultSettings, isStored: false };

	try {
		return { settings: parseAppSettings(JSON.parse(row.value)), isStored: true };
	} catch (error) {
		throw new Error("Could not load saved settings from the database.", { cause: error });
	}
}

export async function saveAppSettings(value: unknown): Promise<void> {
	await requireAuth();
	const settings = parseAppSettings(value);
	const serialized = JSON.stringify(settings);

	await db.orm.public.AppSetting.upsert({
		create: { id: sharedSettingsId, value: serialized },
		update: { value: serialized },
	});
}
