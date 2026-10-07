import { getStrength } from "@/features/passwords/lib/password-utils";

export function PasswordStrength({ password }: { password: string }) {
	const strength = getStrength(password);
	return <div className="flex items-center justify-between gap-2 pt-1"><span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Password strength</span><span className="flex items-center gap-2"><span className="flex gap-0.5">{Array.from({ length: 5 }, (_, index) => <i key={index} className={`h-1 w-3 rounded-full ${strength.score > index ? strength.color : "bg-slate-200"}`} />)}</span><span className={`text-[10px] font-medium ${strength.textColor}`}>{strength.label}</span></span></div>;
}
