"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Baby, Key, ShoppingCart } from "lucide-react";

const navigation = [
	{ href: "/passwords", label: "Password manager", icon: Key },
	{ href: "/grocery", label: "Grocery planner", icon: ShoppingCart },
	{ href: "/baby-needs", label: "Kyooowe Needs", icon: Baby },
];

export default function Dashboard({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const current = navigation.find((item) => pathname.startsWith(item.href)) ?? navigation[0];

	return (
		<main className="min-h-screen bg-[#f5f4fb] text-slate-800 md:flex">
			<aside className="sticky top-0 z-40 flex w-full flex-col border-b border-violet-950/40 bg-linear-to-b from-[#211a3e] via-[#241d43] to-[#18152e] p-4 text-white md:static md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-5">
				<Link href="/" className="mb-5 flex items-center gap-3 px-2 text-xl font-bold tracking-tight text-white md:mb-12">
					<span className="grid size-8 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-fuchsia-400 to-violet-400 p-1.5 shadow-lg shadow-fuchsia-500/20">
						<i className="rounded-sm bg-white" /><i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white/65" /><i className="rounded-sm bg-white" />
					</span>
					Kyohub<span className="-ml-3 text-fuchsia-300">.</span>
				</Link>
				<p className="mb-2 hidden px-3 text-[10px] font-semibold tracking-[0.18em] text-violet-200/50 md:block">YOUR SPACE</p>
				<nav aria-label="Main navigation" className="grid grid-cols-3 gap-2 md:flex md:flex-col">
					{navigation.map(({ href, label, icon: Icon }) => {
						const active = current.href === href;
						return (
							<Link
								key={href}
								href={href}
								aria-current={active ? "page" : undefined}
								className={`inline-flex min-h-12 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-md px-2 text-center text-[10px] leading-tight transition-all md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${active ? "bg-linear-to-r from-violet-500/25 to-fuchsia-500/10 text-white shadow-inner shadow-white/5" : "text-violet-100/65 hover:bg-white/5 hover:text-white"}`}
							>
								<Icon size={19} className="shrink-0" />
								<span>{label}</span>
							</Link>
						);
					})}
				</nav>
				<div className="mt-auto hidden md:block">
					<div className="mb-4 rounded-xl border border-violet-300/10 bg-linear-to-br from-violet-400/10 to-fuchsia-400/5 p-4 text-sm leading-relaxed text-violet-100/70">
						A little more organized, a little less to remember.
					</div>
					<div className="flex items-center gap-3 border-t border-white/10 pt-4">
						<div className="grid size-9 place-items-center rounded-full bg-linear-to-br from-fuchsia-300 to-violet-400 text-xs font-bold text-violet-950 ring-2 ring-white/10">AM</div>
						<div><p className="text-sm font-medium text-white">Alex Morgan</p><p className="text-xs text-violet-200/50">Personal space</p></div>
					</div>
				</div>
			</aside>
			<section className="min-w-0 flex-1">
				<header className="flex h-14 items-center justify-between border-b border-violet-100 bg-white/80 px-5 shadow-[0_1px_8px_rgba(68,48,125,0.04)] backdrop-blur md:px-10">
					<div className="text-sm text-slate-400">My space <span className="mx-2 text-violet-200">/</span><strong className="font-medium text-slate-700">{current.label}</strong></div>
					<div className="flex items-center gap-3 text-xs text-slate-400">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date())}<span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 font-semibold text-white shadow-md shadow-violet-300/40">AM</span></div>
				</header>
				<div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">{children}</div>
			</section>
		</main>
	);
}
