export type BabyNeedType = "Vaccination" | "Important date";

export type BabyNeed = {
	id: string;
	title: string;
	type: BabyNeedType;
	notes: string;
	done: boolean;
};
