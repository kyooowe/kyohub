export const familyAppointmentTypes = ["Vaccination", "Important date", "Holiday", "Birthday"] as const;

export type FamilyAppointmentType = (typeof familyAppointmentTypes)[number];

export function isFamilyAppointmentType(value: unknown): value is FamilyAppointmentType {
	return typeof value === "string" && familyAppointmentTypes.some((type) => type === value);
}

export type FamilyAppointment = {
	id: string;
	title: string;
	type: FamilyAppointmentType;
	notes: string;
	done: boolean;
};
