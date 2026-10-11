import { getStrength } from "@/features/passwords/lib/password-utils";

export function PasswordStrength({ password }: { password: string }) {
	const strength = getStrength(password);
	const labelStyle = strength.score < 3
		? "text-red-600 dark:text-red-300"
		: strength.score < 4
			? "text-amber-700 dark:text-amber-300"
			: "text-emerald-700 dark:text-emerald-300";
	return <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
		<span className="flex w-20 flex-none gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={5} aria-valuenow={strength.score} aria-valuetext={strength.label}>
			{Array.from({ length: 5 }, (_, index) => <i key={index} aria-hidden="true" className={`h-2 flex-1 rounded-full ${strength.score > index ? strength.color : "bg-slate-200 dark:bg-slate-700"}`} />)}
		</span>
		<span className={`min-w-12 px-1 py-1 text-center text-[11px] font-semibold ${labelStyle}`}>{strength.label}</span>
	</div>;
}
