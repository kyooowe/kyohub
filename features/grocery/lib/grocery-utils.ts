export function getDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateLabel(date: Date, options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat("en", options).format(date);
}
