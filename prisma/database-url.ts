const legacySslModes = new Set(["prefer", "require", "verify-ca"]);

export function getDatabaseUrl() {
	const value = process.env["DATABASE_URL"];
	if (!value) throw new Error("DATABASE_URL is not set.");

	const url = new URL(value);
	const sslMode = url.searchParams.get("sslmode")?.toLowerCase();
	if (sslMode && legacySslModes.has(sslMode)) {
		url.searchParams.set("sslmode", "verify-full");
	}

	return url.toString();
}
