"use client";

import { createContext, startTransition, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { saveAppSettings } from "@/features/settings/actions/settings-actions";
import { normalizeAppSettings, type AppSettings } from "@/components/settings/settings-model";

export type { AppSettings, NavigationHref, BudgetMode } from "@/components/settings/settings-model";
export type { PagePalette } from "@/components/settings/page-palettes";
export { navigationItems } from "@/components/settings/settings-model";

const storageKey = "kyohub-settings";

type SettingsContextValue = {
	settings: AppSettings;
	updateSettings: (update: (current: AppSettings) => AppSettings) => void;
	saveError: string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children, initialSettings, migrateLocalSettings }: { children: ReactNode; initialSettings: AppSettings; migrateLocalSettings: boolean }) {
	const [settings, setSettings] = useState(initialSettings);
	const [saveError, setSaveError] = useState("");
	const settingsRef = useRef(settings);
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const saveQueue = useRef(Promise.resolve());
	const sequence = useRef(0);

	const updateSettings = useCallback((update: (current: AppSettings) => AppSettings) => {
		const nextSettings = update(settingsRef.current);
		if (nextSettings === settingsRef.current) return;

		settingsRef.current = nextSettings;
		setSettings(nextSettings);
		setSaveError("");
		const requestSequence = ++sequence.current;
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			saveQueue.current = saveQueue.current
				.then(() => new Promise<void>((resolve, reject) => {
					startTransition(async () => {
						try {
							await saveAppSettings(nextSettings);
							resolve();
						} catch (error) {
							reject(error);
						}
					});
				}))
				.then(() => {
					if (requestSequence === sequence.current) setSaveError("");
				})
				.catch((error: unknown) => {
					if (requestSequence === sequence.current) {
						setSaveError(error instanceof Error ? `Could not save settings: ${error.message}` : "Could not save settings.");
					}
				});
		}, 250);
	}, []);

	useEffect(() => {
		if (!migrateLocalSettings) return;
		try {
			const stored = localStorage.getItem(storageKey);
			if (!stored) return;
			const legacySettings: unknown = JSON.parse(stored);
			const migratedSettings = normalizeAppSettings(legacySettings);
			if (JSON.stringify(migratedSettings) !== JSON.stringify(settingsRef.current)) {
				updateSettings(() => migratedSettings);
			}
		} catch (error) {
			const message = error instanceof Error ? `Could not migrate saved settings: ${error.message}` : "Could not migrate saved settings.";
			queueMicrotask(() => setSaveError(message));
		}
	}, [migrateLocalSettings, updateSettings]);

	const value = { settings, updateSettings, saveError };
	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings() {
	const context = useContext(SettingsContext);
	if (!context) throw new Error("useAppSettings must be used within SettingsProvider.");
	return context;
}
