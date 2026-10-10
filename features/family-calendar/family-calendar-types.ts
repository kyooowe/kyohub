export type FamilyAppointmentType = "Vaccination" | "Important date";

export type FamilyAppointment = {
	id: string;
	title: string;
	type: FamilyAppointmentType;
	notes: string;
	done: boolean;
};
