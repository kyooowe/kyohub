import { getStrength } from "@/features/passwords/lib/password-utils";

export function PasswordStrength({ password }: { password: string }) {
	const strength = getStrength(password);
	return <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
		<span className="flex w-14 flex-none gap-1" aria-label={`Password strength: ${strength.label}`}>
			{Array.from({ length: 5 }, (_, index) => <i key={index} className={`h-1.5 flex-1 rounded-full ${strength.score > index ? strength.color : "bg-slate-200 dark:bg-slate-700"}`} />)}
		</span>
		<span className={`text-[11px] font-semibold ${strength.textColor}`}>{strength.label}</span>
	</div>;
}
