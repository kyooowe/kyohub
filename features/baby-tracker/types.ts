export type BabyGender = "boy" | "girl" | "other" | "unspecified";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodType = (typeof BLOOD_TYPES)[number] | "unknown" | "";

export type BabyProfile = {
	id: string;
	name: string;
	birthDate: string; // YYYY-MM-DD
	gender: BabyGender;
	bloodType: string;
	birthWeight: string; // number only in kg (e.g. "3.4")
	birthHeight: string; // number only in cm (e.g. "50")
	pediatrician: string;
	pediatricianPhone: string;
	allergies: string;
	notes: string;
	createdAt?: string;
};

export type DiaperType = "stool" | "wet" | "both";
export type StoolConsistency = "soft" | "seedy" | "watery" | "hard" | "normal";
export type StoolColor = "yellow" | "mustard" | "brown" | "green" | "black" | "clay" | "other";
export type StoolAmount = "small" | "medium" | "large";

export type BabyStoolLog = {
	id: string;
	loggedAt: string; // ISO string
	type: DiaperType;
	consistency: StoolConsistency;
	color: StoolColor;
	amount: StoolAmount;
	notes: string;
	createdAt?: string;
};

export type VaccineStatus = "completed" | "upcoming" | "overdue" | "skipped";

export type BabyVaccine = {
	id: string;
	vaccineName: string;
	vaccineDate: string; // YYYY-MM-DD
	status: VaccineStatus;
	dose: string;
	administeredBy: string;
	notes: string;
	createdAt?: string;
};

export type MedicineStatus = "active" | "completed" | "paused";

export type BabyMedicine = {
	id: string;
	name: string;
	dosage: string;
	instructions: string;
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD or empty
	frequency: string;
	status: MedicineStatus;
	notes: string;
	createdAt?: string;
};

export type BabyGrowthRecord = {
	id: string;
	recordedDate: string; // YYYY-MM-DD
	monthAge: number; // 0 for newborn, 1, 2, 3...
	heightCm: number;
	weightKg: number;
	headCircumferenceCm?: number | null;
	notes: string;
	createdAt?: string;
};

export type MedicalNoteCategory = "checkup" | "fever" | "teething" | "allergy" | "colic" | "general";

export type BabyMedicalNote = {
	id: string;
	noteDate: string; // YYYY-MM-DD
	title: string;
	symptoms: string;
	doctorAdvice: string;
	doctorName: string;
	clinicName: string;
	category: MedicalNoteCategory;
	createdAt?: string;
};

export type SleepType = "night" | "nap";
export type SleepStatus = "sleeping" | "completed";

export type BabySleepLog = {
	id: string;
	startTime: string; // ISO string
	endTime: string | null; // ISO string or null if currently sleeping
	durationMinutes: number | null;
	sleepType: SleepType;
	status: SleepStatus;
	notes: string;
	createdAt?: string;
};

export type MilkStatus = "completed" | "leftover";
export type MilkType = "formula" | "breast_milk" | "cow_milk" | "other";

export type BabyMilkLog = {
	id: string;
	loggedAt: string; // ISO string
	preparedOz: number;
	status: MilkStatus;
	leftoverOz: number;
	drankOz: number;
	milkType: MilkType;
	notes: string;
	createdAt?: string;
};

export type BabyTrackerData = {
	profile: BabyProfile | null;
	stoolLogs: BabyStoolLog[];
	vaccines: BabyVaccine[];
	medicines: BabyMedicine[];
	growthRecords: BabyGrowthRecord[];
	medicalNotes: BabyMedicalNote[];
	sleepLogs: BabySleepLog[];
	milkLogs: BabyMilkLog[];
};

export const standardChildhoodVaccines: Array<{
	vaccineName: string;
	dose: string;
	ageMonths: number;
	notes: string;
}> = [
	{ vaccineName: "BCG (Tuberculosis)", dose: "Birth dose", ageMonths: 0, notes: "Recommended at birth" },
	{ vaccineName: "Hepatitis B (HepB)", dose: "Dose 1", ageMonths: 0, notes: "Given within 24 hours of birth" },
	{ vaccineName: "DTaP-HepB-IPV (Hexavalent)", dose: "Dose 1", ageMonths: 2, notes: "Diphtheria, Tetanus, Pertussis, Hep B, Polio" },
	{ vaccineName: "Rotavirus (RV)", dose: "Dose 1", ageMonths: 2, notes: "Oral rotavirus protection" },
	{ vaccineName: "Pneumococcal (PCV)", dose: "Dose 1", ageMonths: 2, notes: "Pneumococcal conjugate" },
	{ vaccineName: "DTaP-HepB-IPV (Hexavalent)", dose: "Dose 2", ageMonths: 4, notes: "Second dose at 4 months" },
	{ vaccineName: "Rotavirus (RV)", dose: "Dose 2", ageMonths: 4, notes: "Second oral dose" },
	{ vaccineName: "Pneumococcal (PCV)", dose: "Dose 2", ageMonths: 4, notes: "Second dose" },
	{ vaccineName: "DTaP-HepB-IPV (Hexavalent)", dose: "Dose 3", ageMonths: 6, notes: "Third dose at 6 months" },
	{ vaccineName: "Influenza (Flu)", dose: "Dose 1", ageMonths: 6, notes: "First seasonal flu vaccine" },
	{ vaccineName: "Measles, Mumps, Rubella (MMR)", dose: "Dose 1", ageMonths: 12, notes: "First MMR dose around 1 year" },
	{ vaccineName: "Varicella (Chickenpox)", dose: "Dose 1", ageMonths: 12, notes: "First chickenpox vaccine" },
	{ vaccineName: "Hepatitis A (HepA)", dose: "Dose 1", ageMonths: 12, notes: "First Hep A dose" },
];
