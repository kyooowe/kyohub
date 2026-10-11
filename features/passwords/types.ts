export type Category = "Social media" | "Banking" | "Games" | "Work" | "Other";

export type PasswordEntry = {
	id: string;
	website: string;
	url: string;
	category: Category;
	username: string;
	password: string;
	favorite: boolean;
};
