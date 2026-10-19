"use server";

import { db } from "@/prisma/db";
import { updateTag, unstable_cache } from "next/cache";
import { requireAuth } from "@/features/auth/lib/session";
import type {
	BabyGender,
	BabyProfile,
	BabyTrackerData,
	DiaperType,
	MedicalNoteCategory,
	MedicineStatus,
	StoolAmount,
	StoolColor,
	StoolConsistency,
	VaccineStatus,
} from "../types";
import { standardChildhoodVaccines, BLOOD_TYPES } from "../types";

const getCachedBabyTrackerData = unstable_cache(
	async (): Promise<BabyTrackerData> => {
		const [profiles, stoolLogs, vaccines, medicines, growthRecords, medicalNotes] = await Promise.all([
			db.orm.public.BabyProfile
				.select("id", "name", "birthDate", "gender", "bloodType", "birthWeight", "birthHeight", "pediatrician", "pediatricianPhone", "allergies", "notes", "createdAt")
				.orderBy([(p) => p.createdAt.asc()])
				.all(),
			db.orm.public.BabyStoolLog
				.select("id", "loggedAt", "type", "consistency", "color", "amount", "notes", "createdAt")
				.orderBy([(s) => s.loggedAt.desc(), (s) => s.id.desc()])
				.limit(100)
				.all(),
			db.orm.public.BabyVaccine
				.select("id", "vaccineName", "vaccineDate", "status", "dose", "administeredBy", "notes", "createdAt")
				.orderBy([(v) => v.vaccineDate.asc(), (v) => v.id.asc()])
				.all(),
			db.orm.public.BabyMedicine
				.select("id", "name", "dosage", "instructions", "startDate", "endDate", "frequency", "status", "notes", "createdAt")
				.orderBy([(m) => m.startDate.desc(), (m) => m.id.desc()])
				.all(),
			db.orm.public.BabyGrowth
				.select("id", "recordedDate", "monthAge", "heightCm", "weightKg", "headCircumferenceCm", "notes", "createdAt")
				.orderBy([(g) => g.monthAge.asc(), (g) => g.recordedDate.asc()])
				.all(),
			db.orm.public.BabyMedicalNote
				.select("id", "noteDate", "title", "symptoms", "doctorAdvice", "doctorName", "clinicName", "category", "createdAt")
				.orderBy([(n) => n.noteDate.desc(), (n) => n.id.desc()])
				.all(),
		]);

		const profile: BabyProfile | null = profiles.length > 0 ? {
			id: profiles[0].id,
			name: profiles[0].name,
			birthDate: profiles[0].birthDate,
			gender: profiles[0].gender as BabyGender,
			bloodType: profiles[0].bloodType,
			birthWeight: profiles[0].birthWeight,
			birthHeight: profiles[0].birthHeight,
			pediatrician: profiles[0].pediatrician,
			pediatricianPhone: profiles[0].pediatricianPhone,
			allergies: profiles[0].allergies,
			notes: profiles[0].notes,
			createdAt: profiles[0].createdAt,
		} : null;

		return {
			profile,
			stoolLogs: stoolLogs.map((log) => ({
				id: log.id,
				loggedAt: log.loggedAt,
				type: log.type as DiaperType,
				consistency: log.consistency as StoolConsistency,
				color: log.color as StoolColor,
				amount: log.amount as StoolAmount,
				notes: log.notes,
				createdAt: log.createdAt,
			})),
			vaccines: vaccines.map((v) => ({
				id: v.id,
				vaccineName: v.vaccineName,
				vaccineDate: v.vaccineDate,
				status: v.status as VaccineStatus,
				dose: v.dose,
				administeredBy: v.administeredBy,
				notes: v.notes,
				createdAt: v.createdAt,
			})),
			medicines: medicines.map((m) => ({
				id: m.id,
				name: m.name,
				dosage: m.dosage,
				instructions: m.instructions,
				startDate: m.startDate,
				endDate: m.endDate,
				frequency: m.frequency,
				status: m.status as MedicineStatus,
				notes: m.notes,
				createdAt: m.createdAt,
			})),
			growthRecords: growthRecords.map((g) => ({
				id: g.id,
				recordedDate: g.recordedDate,
				monthAge: g.monthAge,
				heightCm: g.heightCm,
				weightKg: g.weightKg,
				headCircumferenceCm: g.headCircumferenceCm,
				notes: g.notes,
				createdAt: g.createdAt,
			})),
			medicalNotes: medicalNotes.map((n) => ({
				id: n.id,
				noteDate: n.noteDate,
				title: n.title,
				symptoms: n.symptoms,
				doctorAdvice: n.doctorAdvice,
				doctorName: n.doctorName,
				clinicName: n.clinicName,
				category: n.category as MedicalNoteCategory,
				createdAt: n.createdAt,
			})),
		};
	},
	["baby-tracker"],
	{ tags: ["baby-tracker"], revalidate: 60 },
);

export async function getBabyTrackerData(): Promise<BabyTrackerData> {
	await requireAuth();
	return getCachedBabyTrackerData();
}

/* -------------------------------------------------------------------------- */
/*                               Baby Profile                                 */
/* -------------------------------------------------------------------------- */

export async function saveBabyProfile(data: {
	id?: string;
	name: string;
	birthDate: string;
	gender?: BabyGender;
	bloodType?: string;
	birthWeight?: string;
	birthHeight?: string;
	pediatrician?: string;
	pediatricianPhone?: string;
	allergies?: string;
	notes?: string;
}): Promise<void> {
	await requireAuth();
	if (!data.name?.trim()) throw new Error("Baby name is required.");
	if (!data.birthDate?.trim()) throw new Error("Birth date is required.");

	if (data.bloodType && data.bloodType.trim()) {
		const raw = data.bloodType.trim();
		const isValid = (BLOOD_TYPES as readonly string[]).includes(raw) || raw === "unknown";
		if (!isValid) {
			throw new Error("Invalid blood type. Please select a valid blood type.");
		}
	}

	const cleanedWeight = data.birthWeight ? data.birthWeight.replace(/[^0-9.]/g, "").trim() : "";
	const cleanedHeight = data.birthHeight ? data.birthHeight.replace(/[^0-9.]/g, "").trim() : "";

	if (cleanedWeight && isNaN(Number(cleanedWeight))) {
		throw new Error("Birth weight must be a valid number (kg).");
	}
	if (cleanedHeight && isNaN(Number(cleanedHeight))) {
		throw new Error("Birth height must be a valid number (cm).");
	}

	const existing = await db.orm.public.BabyProfile.first();

	if (existing) {
		await db.orm.public.BabyProfile.where({ id: existing.id }).update({
			name: data.name.trim(),
			birthDate: data.birthDate.trim(),
			gender: data.gender ?? existing.gender,
			bloodType: (data.bloodType ?? existing.bloodType).trim(),
			birthWeight: data.birthWeight !== undefined ? cleanedWeight : existing.birthWeight,
			birthHeight: data.birthHeight !== undefined ? cleanedHeight : existing.birthHeight,
			pediatrician: (data.pediatrician ?? existing.pediatrician).trim(),
			pediatricianPhone: (data.pediatricianPhone ?? existing.pediatricianPhone).trim(),
			allergies: (data.allergies ?? existing.allergies).trim(),
			notes: (data.notes ?? existing.notes).trim(),
		});
	} else {
		await db.orm.public.BabyProfile.create({
			name: data.name.trim(),
			birthDate: data.birthDate.trim(),
			gender: data.gender ?? "unspecified",
			bloodType: (data.bloodType ?? "").trim(),
			birthWeight: cleanedWeight,
			birthHeight: cleanedHeight,
			pediatrician: (data.pediatrician ?? "").trim(),
			pediatricianPhone: (data.pediatricianPhone ?? "").trim(),
			allergies: (data.allergies ?? "").trim(),
			notes: (data.notes ?? "").trim(),
		});
	}

	updateTag("baby-tracker");
}

/* -------------------------------------------------------------------------- */
/*                                Stool Counter                               */
/* -------------------------------------------------------------------------- */

export async function createStoolLog(data: {
	type: DiaperType;
	consistency?: StoolConsistency;
	color?: StoolColor;
	amount?: StoolAmount;
	notes?: string;
	loggedAt?: string;
}): Promise<void> {
	await requireAuth();

	await db.orm.public.BabyStoolLog.create({
		type: data.type,
		consistency: data.consistency ?? "soft",
		color: data.color ?? "yellow",
		amount: data.amount ?? "medium",
		notes: (data.notes ?? "").trim(),
		...(data.loggedAt ? { loggedAt: data.loggedAt } : {}),
	});

	updateTag("baby-tracker");
}

export async function quickLogDiaper(type: DiaperType): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyStoolLog.create({
		type,
		consistency: "soft",
		color: "yellow",
		amount: "medium",
		notes: "Quick log",
	});
	updateTag("baby-tracker");
}

export async function deleteStoolLog(id: string): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyStoolLog.where({ id }).delete();
	updateTag("baby-tracker");
}

/* -------------------------------------------------------------------------- */
/*                              Vaccine Tracker                               */
/* -------------------------------------------------------------------------- */

export async function createVaccine(data: {
	vaccineName: string;
	vaccineDate: string;
	status?: VaccineStatus;
	dose?: string;
	administeredBy?: string;
	notes?: string;
}): Promise<void> {
	await requireAuth();
	if (!data.vaccineName?.trim()) throw new Error("Vaccine name is required.");
	if (!data.vaccineDate?.trim()) throw new Error("Vaccine date is required.");

	await db.orm.public.BabyVaccine.create({
		vaccineName: data.vaccineName.trim(),
		vaccineDate: data.vaccineDate.trim(),
		status: data.status ?? "upcoming",
		dose: (data.dose ?? "").trim(),
		administeredBy: (data.administeredBy ?? "").trim(),
		notes: (data.notes ?? "").trim(),
	});

	updateTag("baby-tracker");
}

export async function updateVaccine(
	id: string,
	data: {
		vaccineName?: string;
		vaccineDate?: string;
		status?: VaccineStatus;
		dose?: string;
		administeredBy?: string;
		notes?: string;
	},
): Promise<void> {
	await requireAuth();
	const existing = await db.orm.public.BabyVaccine.first({ id });
	if (!existing) throw new Error("Vaccine record not found.");

	await db.orm.public.BabyVaccine.where({ id }).update({
		vaccineName: (data.vaccineName ?? existing.vaccineName).trim(),
		vaccineDate: (data.vaccineDate ?? existing.vaccineDate).trim(),
		status: data.status ?? existing.status,
		dose: (data.dose ?? existing.dose).trim(),
		administeredBy: (data.administeredBy ?? existing.administeredBy).trim(),
		notes: (data.notes ?? existing.notes).trim(),
	});

	updateTag("baby-tracker");
}

export async function toggleVaccineStatus(id: string, status: VaccineStatus): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyVaccine.where({ id }).update({ status });
	updateTag("baby-tracker");
}

export async function deleteVaccine(id: string): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyVaccine.where({ id }).delete();
	updateTag("baby-tracker");
}

export async function seedStandardVaccines(): Promise<void> {
	await requireAuth();
	const profile = await db.orm.public.BabyProfile.first();
	const baseDate = profile?.birthDate ? new Date(profile.birthDate) : new Date();

	for (const preset of standardChildhoodVaccines) {
		const targetDate = new Date(baseDate);
		targetDate.setMonth(targetDate.getMonth() + preset.ageMonths);
		const dateStr = targetDate.toISOString().split("T")[0];

		// Check if already exists to avoid duplicates
		const exists = await db.orm.public.BabyVaccine.first({
			vaccineName: preset.vaccineName,
			dose: preset.dose,
		});

		if (!exists) {
			const isPast = targetDate < new Date();
			await db.orm.public.BabyVaccine.create({
				vaccineName: preset.vaccineName,
				vaccineDate: dateStr,
				dose: preset.dose,
				status: isPast ? "completed" : "upcoming",
				notes: preset.notes,
				administeredBy: "",
			});
		}
	}

	updateTag("baby-tracker");
}

/* -------------------------------------------------------------------------- */
/*                              Medicine Tracker                              */
/* -------------------------------------------------------------------------- */

export async function createMedicine(data: {
	name: string;
	dosage: string;
	instructions: string;
	startDate: string;
	endDate?: string;
	frequency?: string;
	status?: MedicineStatus;
	notes?: string;
}): Promise<void> {
	await requireAuth();
	if (!data.name?.trim()) throw new Error("Medicine name is required.");
	if (!data.dosage?.trim()) throw new Error("Dosage is required.");
	if (!data.instructions?.trim()) throw new Error("Instructions are required.");
	if (!data.startDate?.trim()) throw new Error("Start date is required.");

	await db.orm.public.BabyMedicine.create({
		name: data.name.trim(),
		dosage: data.dosage.trim(),
		instructions: data.instructions.trim(),
		startDate: data.startDate.trim(),
		endDate: (data.endDate ?? "").trim(),
		frequency: (data.frequency ?? "").trim(),
		status: data.status ?? "active",
		notes: (data.notes ?? "").trim(),
	});

	updateTag("baby-tracker");
}

export async function updateMedicine(
	id: string,
	data: {
		name?: string;
		dosage?: string;
		instructions?: string;
		startDate?: string;
		endDate?: string;
		frequency?: string;
		status?: MedicineStatus;
		notes?: string;
	},
): Promise<void> {
	await requireAuth();
	const existing = await db.orm.public.BabyMedicine.first({ id });
	if (!existing) throw new Error("Medicine record not found.");

	await db.orm.public.BabyMedicine.where({ id }).update({
		name: (data.name ?? existing.name).trim(),
		dosage: (data.dosage ?? existing.dosage).trim(),
		instructions: (data.instructions ?? existing.instructions).trim(),
		startDate: (data.startDate ?? existing.startDate).trim(),
		endDate: (data.endDate ?? existing.endDate).trim(),
		frequency: (data.frequency ?? existing.frequency).trim(),
		status: data.status ?? existing.status,
		notes: (data.notes ?? existing.notes).trim(),
	});

	updateTag("baby-tracker");
}

export async function toggleMedicineStatus(id: string, status: MedicineStatus): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyMedicine.where({ id }).update({ status });
	updateTag("baby-tracker");
}

export async function deleteMedicine(id: string): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyMedicine.where({ id }).delete();
	updateTag("baby-tracker");
}

/* -------------------------------------------------------------------------- */
/*                               Growth Tracker                               */
/* -------------------------------------------------------------------------- */

export async function createGrowthRecord(data: {
	recordedDate: string;
	monthAge: number;
	heightCm: number;
	weightKg: number;
	headCircumferenceCm?: number | null;
	notes?: string;
}): Promise<void> {
	await requireAuth();
	if (!data.recordedDate?.trim()) throw new Error("Measurement date is required.");
	if (data.heightCm <= 0) throw new Error("Height must be greater than 0.");
	if (data.weightKg <= 0) throw new Error("Weight must be greater than 0.");

	await db.orm.public.BabyGrowth.create({
		recordedDate: data.recordedDate.trim(),
		monthAge: Number(data.monthAge),
		heightCm: Number(data.heightCm),
		weightKg: Number(data.weightKg),
		headCircumferenceCm: data.headCircumferenceCm ? Number(data.headCircumferenceCm) : null,
		notes: (data.notes ?? "").trim(),
	});

	updateTag("baby-tracker");
}

export async function updateGrowthRecord(
	id: string,
	data: {
		recordedDate?: string;
		monthAge?: number;
		heightCm?: number;
		weightKg?: number;
		headCircumferenceCm?: number | null;
		notes?: string;
	},
): Promise<void> {
	await requireAuth();
	const existing = await db.orm.public.BabyGrowth.first({ id });
	if (!existing) throw new Error("Growth record not found.");

	await db.orm.public.BabyGrowth.where({ id }).update({
		recordedDate: (data.recordedDate ?? existing.recordedDate).trim(),
		monthAge: data.monthAge !== undefined ? Number(data.monthAge) : existing.monthAge,
		heightCm: data.heightCm !== undefined ? Number(data.heightCm) : existing.heightCm,
		weightKg: data.weightKg !== undefined ? Number(data.weightKg) : existing.weightKg,
		headCircumferenceCm: data.headCircumferenceCm !== undefined ? (data.headCircumferenceCm ? Number(data.headCircumferenceCm) : null) : existing.headCircumferenceCm,
		notes: (data.notes ?? existing.notes).trim(),
	});

	updateTag("baby-tracker");
}

export async function deleteGrowthRecord(id: string): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyGrowth.where({ id }).delete();
	updateTag("baby-tracker");
}

/* -------------------------------------------------------------------------- */
/*                            Simple Medical Notes                            */
/* -------------------------------------------------------------------------- */

export async function createMedicalNote(data: {
	noteDate: string;
	title?: string;
	symptoms: string;
	doctorAdvice: string;
	doctorName?: string;
	clinicName?: string;
	category?: MedicalNoteCategory;
}): Promise<void> {
	await requireAuth();
	if (!data.noteDate?.trim()) throw new Error("Date is required.");
	if (!data.symptoms?.trim()) throw new Error("Symptoms are required.");
	if (!data.doctorAdvice?.trim()) throw new Error("Doctor advice is required.");

	await db.orm.public.BabyMedicalNote.create({
		noteDate: data.noteDate.trim(),
		title: (data.title ?? "").trim(),
		symptoms: data.symptoms.trim(),
		doctorAdvice: data.doctorAdvice.trim(),
		doctorName: (data.doctorName ?? "").trim(),
		clinicName: (data.clinicName ?? "").trim(),
		category: data.category ?? "general",
	});

	updateTag("baby-tracker");
}

export async function updateMedicalNote(
	id: string,
	data: {
		noteDate?: string;
		title?: string;
		symptoms?: string;
		doctorAdvice?: string;
		doctorName?: string;
		clinicName?: string;
		category?: MedicalNoteCategory;
	},
): Promise<void> {
	await requireAuth();
	const existing = await db.orm.public.BabyMedicalNote.first({ id });
	if (!existing) throw new Error("Medical note not found.");

	await db.orm.public.BabyMedicalNote.where({ id }).update({
		noteDate: (data.noteDate ?? existing.noteDate).trim(),
		title: (data.title ?? existing.title).trim(),
		symptoms: (data.symptoms ?? existing.symptoms).trim(),
		doctorAdvice: (data.doctorAdvice ?? existing.doctorAdvice).trim(),
		doctorName: (data.doctorName ?? existing.doctorName).trim(),
		clinicName: (data.clinicName ?? existing.clinicName).trim(),
		category: data.category ?? existing.category,
	});

	updateTag("baby-tracker");
}

export async function deleteMedicalNote(id: string): Promise<void> {
	await requireAuth();
	await db.orm.public.BabyMedicalNote.where({ id }).delete();
	updateTag("baby-tracker");
}
