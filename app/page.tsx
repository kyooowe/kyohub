"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Baby,
	Landmark as Bank,
	CalendarDays as CalendarBlank,
	Check,
	CircleCheck as CheckCircle,
	Eye,
	EyeOff as EyeSlash,
	Gamepad2 as GameController,
	Globe,
	Key,
	KeyRound as LockKey,
	Bell,
	Search as MagnifyingGlass,
	Pencil as PencilSimple,
	Plus,
	ShieldCheck,
	ShoppingCart as ShoppingCartSimple,
	Star,
	Syringe,
	Trash2 as Trash,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Category = "Social media" | "Banking" | "Games" | "Work" | "Other";
type PasswordEntry = {
	id: string;
	website: string;
	url: string;
	category: Category;
	username: string;
	password: string;
};
type GroceryItem = { id: string; name: string; done: boolean };
type BabyNeedType = "Vaccination" | "Important date";
type BabyNeed = { id: string; title: string; type: BabyNeedType; notes: string; done: boolean };

const categories: Category[] = ["Social media", "Banking", "Games", "Work", "Other"];
const passwordStorageKey = "daymark-passwords-v1";
const groceryStorageKey = "daymark-groceries-v1";
const babyNeedsStorageKey = "kyooowe-baby-needs-v1";
let fallbackIdCounter = 0;
const initialPasswords: PasswordEntry[] = [
	{ id: "demo-1", website: "Instagram", url: "instagram.com", category: "Social media", username: "alex.morgan", password: "Sunset!Garden284" },
	{ id: "demo-2", website: "Chase", url: "chase.com", category: "Banking", username: "alex.morgan@email.com", password: "Cedar$River921" },
	{ id: "demo-3", website: "Steam", url: "steampowered.com", category: "Games", username: "morganplays", password: "Pixel!Quest731" },
	{ id: "demo-4", website: "Notion", url: "notion.so", category: "Work", username: "alex.morgan@email.com", password: "Paper&Cloud482" },
];

function createId() {
	const cryptoApi = globalThis.crypto;
	if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
	if (typeof cryptoApi?.getRandomValues === "function") {
		const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}
	fallbackIdCounter += 1;
	return `${Date.now().toString(36)}-${fallbackIdCounter.toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getStrength(password: string) {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return {
		score,
		label: score < 3 ? "Weak" : score < 4 ? "Fair" : "Strong",
		color: score < 3 ? "bg-red-400" : score < 4 ? "bg-amber-400" : "bg-emerald-500",
		textColor: score < 3 ? "text-red-500" : score < 4 ? "text-amber-600" : "text-emerald-600",
	};
}

function getDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateLabel(date: Date, options: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat("en", options).format(date);
}

function categoryIcon(category: Category) {
	if (category === "Banking") return Bank;
	if (category === "Games") return GameController;
	return Globe;
}

export default function Home() {
	const [section, setSection] = useState<"passwords" | "groceries" | "baby">("passwords");
	const [passwords, setPasswords] = useState<PasswordEntry[]>(initialPasswords);
	const [groceries, setGroceries] = useState<Record<string, GroceryItem[]>>({});
	const [babyNeeds, setBabyNeeds] = useState<Record<string, BabyNeed[]>>({});
	const [ready, setReady] = useState(false);
	const [storageError, setStorageError] = useState("");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All");
	const [revealed, setRevealed] = useState<string[]>([]);
	const [passwordDialog, setPasswordDialog] = useState<PasswordEntry | "new" | null>(null);
	const [groceryDialog, setGroceryDialog] = useState(false);
	const [babyNeedDialog, setBabyNeedDialog] = useState<BabyNeed | "new" | null>(null);
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			try {
				const savedPasswords = localStorage.getItem(passwordStorageKey);
				const savedGroceries = localStorage.getItem(groceryStorageKey);
				const savedBabyNeeds = localStorage.getItem(babyNeedsStorageKey);
				if (savedPasswords) setPasswords(JSON.parse(savedPasswords) as PasswordEntry[]);
				if (savedGroceries) setGroceries(JSON.parse(savedGroceries) as Record<string, GroceryItem[]>);
				if (savedBabyNeeds) setBabyNeeds(JSON.parse(savedBabyNeeds) as Record<string, BabyNeed[]>);
			} catch {
				setStorageError("Saved data could not be loaded from this browser.");
			} finally {
				setReady(true);
			}
		}, 0);
		return () => window.clearTimeout(timeout);
	}, []);

	function persistPasswords(next: PasswordEntry[]) {
		setPasswords(next);
		try {
			localStorage.setItem(passwordStorageKey, JSON.stringify(next));
			setStorageError("");
		} catch {
			setStorageError("Password changes could not be saved. Check your browser storage settings.");
		}
	}

	function persistGroceries(next: Record<string, GroceryItem[]>) {
		setGroceries(next);
		try {
			localStorage.setItem(groceryStorageKey, JSON.stringify(next));
			setStorageError("");
		} catch {
			setStorageError("Grocery changes could not be saved. Check your browser storage settings.");
		}
	}

	function persistBabyNeeds(next: Record<string, BabyNeed[]>) {
		setBabyNeeds(next);
		try {
			localStorage.setItem(babyNeedsStorageKey, JSON.stringify(next));
			setStorageError("");
		} catch {
			setStorageError("Baby needs could not be saved. Check your browser storage settings.");
		}
	}

	const visibleEntries = useMemo(() => passwords.filter((entry) => {
		const matchesFilter = filter === "All" || entry.category === filter;
		const needle = query.toLowerCase().trim();
		const matchesSearch = !needle || [entry.website, entry.url, entry.username, entry.category].some((value) => value.toLowerCase().includes(needle));
		return matchesFilter && matchesSearch;
	}), [passwords, filter, query]);

	const dateKey = getDateKey(selectedDate);
	const dayItems = groceries[dateKey] ?? [];
	const doneCount = dayItems.filter((item) => item.done).length;
	const babyDayItems = babyNeeds[dateKey] ?? [];
	const todayKey = getDateKey(new Date());
	const upcomingVaccine = Object.entries(babyNeeds)
		.flatMap(([key, items]) => items.filter((item) => item.type === "Vaccination" && !item.done && key >= todayKey).map((item) => ({ ...item, dateKey: key })))
		.sort((first, second) => first.dateKey.localeCompare(second.dateKey))[0];
	const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
	const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
	const calendar = Array.from({ length: Math.ceil((firstWeekday + daysInMonth) / 7) * 7 }, (_, index) => {
		const day = index - firstWeekday + 1;
		return day > 0 && day <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), day) : null;
	});

	function submitPassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const entry: PasswordEntry = {
			id: passwordDialog !== "new" && passwordDialog ? passwordDialog.id : createId(),
			website: String(data.get("website")).trim(),
			url: String(data.get("url")).trim(),
			category: String(data.get("category")) as Category,
			username: String(data.get("username")).trim(),
			password: String(data.get("password")),
		};
		if (passwordDialog === "new") persistPasswords([entry, ...passwords]);
		else persistPasswords(passwords.map((item) => item.id === entry.id ? entry : item));
		setPasswordDialog(null);
	}

	function submitGrocery(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const name = String(data.get("item")).trim();
		if (!name) return;
		persistGroceries({ ...groceries, [dateKey]: [...dayItems, { id: createId(), name, done: false }] });
		setGroceryDialog(false);
	}

	function submitBabyNeed(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const title = String(data.get("title")).trim();
		const type = data.get("type");
		if (!title) {
			setStorageError("Enter a title for this baby reminder.");
			return;
		}
		if (type !== "Vaccination" && type !== "Important date") {
			setStorageError("Choose a valid baby reminder type.");
			return;
		}
		const entry: BabyNeed = {
			id: babyNeedDialog !== "new" && babyNeedDialog ? babyNeedDialog.id : createId(),
			title,
			type,
			notes: String(data.get("notes")).trim(),
			done: babyNeedDialog !== "new" && babyNeedDialog ? babyNeedDialog.done : false,
		};
		const nextDayItems = babyNeedDialog !== "new" && babyNeedDialog
			? babyDayItems.map((item) => item.id === entry.id ? entry : item)
			: [...babyDayItems, entry];
		persistBabyNeeds({ ...babyNeeds, [dateKey]: nextDayItems });
		setBabyNeedDialog(null);
	}

	function updateBabyNeed(id: string, update: (item: BabyNeed) => BabyNeed | null) {
		persistBabyNeeds({
			...babyNeeds,
			[dateKey]: babyDayItems.flatMap((item) => {
				if (item.id !== id) return [item];
				const updated = update(item);
				return updated ? [updated] : [];
			}),
		});
	}

	function updateItem(id: string, update: (item: GroceryItem) => GroceryItem | null) {
		persistGroceries({
			...groceries,
			[dateKey]: dayItems.flatMap((item) => {
				if (item.id !== id) return [item];
				const updated = update(item);
				return updated ? [updated] : [];
			}),
		});
	}

	return (
		<main className="min-h-screen bg-[#f5f4fb] text-slate-800 md:flex">
			<aside className="sticky top-0 z-40 flex w-full flex-col border-b border-violet-950/40 bg-linear-to-b from-[#211a3e] via-[#241d43] to-[#18152e] p-4 text-white md:static md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-5">
				<a href="#" className="mb-5 flex items-center gap-3 px-2 text-xl font-bold tracking-tight text-white md:mb-12">
					<span className="grid size-8 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-fuchsia-400 to-violet-400 p-1.5 shadow-lg shadow-fuchsia-500/20">
						<i className="rounded-sm bg-white" /><i className="rounded-sm bg-white/65" />
						<i className="rounded-sm bg-white/65" /><i className="rounded-sm bg-white" />
					</span>
					Kyohub<span className="-ml-3 text-fuchsia-300">.</span>
				</a>
				<p className="mb-2 hidden px-3 text-[10px] font-semibold tracking-[0.18em] text-violet-200/50 md:block">YOUR SPACE</p>
				<nav aria-label="Main navigation" className="grid grid-cols-3 gap-2 md:flex md:flex-col">
					<Button type="button" variant="ghost" className={`min-h-12 min-w-0 touch-manipulation flex-col justify-center gap-1 px-2 text-center text-[10px] leading-tight transition-all md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${section === "passwords" ? "bg-linear-to-r from-violet-500/25 to-fuchsia-500/10 text-white shadow-inner shadow-white/5 hover:from-violet-500/30 hover:to-fuchsia-500/15 hover:text-white" : "text-violet-100/65 hover:bg-white/5 hover:text-white"}`} onClick={() => setSection("passwords")}>
						<Key size={19} className={section === "passwords" ? "shrink-0 text-fuchsia-300" : "shrink-0"} /> <span>Password manager</span>
						<span className={`hidden rounded-md px-2 py-0.5 text-xs md:ml-auto md:inline ${section === "passwords" ? "bg-fuchsia-300/15 text-fuchsia-100" : "bg-white/5 text-violet-100/50"}`}>{passwords.length}</span>
					</Button>
					<Button type="button" variant="ghost" className={`min-h-12 min-w-0 touch-manipulation flex-col justify-center gap-1 px-2 text-center text-[10px] leading-tight transition-all md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${section === "groceries" ? "bg-linear-to-r from-blue-500/25 to-indigo-500/10 text-white shadow-inner shadow-white/5 hover:from-blue-500/30 hover:to-indigo-500/15 hover:text-white" : "text-violet-100/65 hover:bg-white/5 hover:text-white"}`} onClick={() => setSection("groceries")}>
						<ShoppingCartSimple size={19} className={section === "groceries" ? "shrink-0 text-blue-200" : "shrink-0"} /> <span>Grocery planner</span>
					</Button>
					<Button type="button" variant="ghost" className={`min-h-12 min-w-0 touch-manipulation flex-col justify-center gap-1 px-2 text-center text-[10px] leading-tight transition-all md:min-h-11 md:flex-row md:justify-start md:gap-3 md:px-3 md:text-left md:text-sm ${section === "baby" ? "bg-linear-to-r from-teal-500/25 to-cyan-500/10 text-white shadow-inner shadow-white/5 hover:from-teal-500/30 hover:to-cyan-500/15 hover:text-white" : "text-violet-100/65 hover:bg-white/5 hover:text-white"}`} onClick={() => setSection("baby")}>
						<Baby size={19} className={section === "baby" ? "shrink-0 text-teal-200" : "shrink-0"} /> <span>Kyooowe Needs</span>
					</Button>
				</nav>
				<div className="mt-auto hidden md:block">
					<div className="mb-4 rounded-xl border border-violet-300/10 bg-linear-to-br from-violet-400/10 to-fuchsia-400/5 p-4 text-sm leading-relaxed text-violet-100/70">
						<ShieldCheck size={19} className="mb-2 text-fuchsia-300" />
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
					<div className="text-sm text-slate-400">My space <span className="mx-2 text-violet-200">/</span><strong className="font-medium text-slate-700">{section === "passwords" ? "Password manager" : section === "groceries" ? "Grocery planner" : "Kyooowe Needs"}</strong></div>
					<div className="flex items-center gap-3 text-xs text-slate-400">{dateLabel(new Date(), { weekday: "short", month: "short", day: "numeric" })}<span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 font-semibold text-white shadow-md shadow-violet-300/40">AM</span></div>
				</header>

				<div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
					{storageError && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{storageError}</div>}
					{!ready && <p className="text-sm text-muted-foreground">Loading saved items…</p>}

					{section === "passwords" ? (
						<>
							<div className="flex flex-wrap items-end justify-between gap-4">
								<div>
									<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-violet-600"><span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-600"><LockKey size={14} /></span> YOUR DIGITAL LIFE</p>
									<h1 className="bg-linear-to-r from-slate-900 via-violet-950 to-violet-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Password manager</h1>
									<p className="mt-1 text-sm text-slate-500">All your logins, neatly in one place.</p>
								</div>
								<Button type="button" className="min-h-11 touch-manipulation border-0 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl hover:shadow-violet-400/40" onClick={() => setPasswordDialog("new")}><Plus size={17} /> Add password</Button>
							</div>

							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{/* Saved Logins */}
								<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-sky-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-sky-50 hover:shadow-xl hover:shadow-sky-200/70">
									{/* Decorative accent */}
									<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-sky-100/70 blur-2xl transition-all duration-300 group-hover:bg-sky-200/80" />

									<CardContent className="relative flex flex-row items-center gap-4 p-5">
										<span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-blue-200 transition-transform duration-200 group-hover:scale-105">
											<Key size={20} />
										</span>

										<div className="min-w-0">
											<p className="text-xs font-medium text-slate-500">
												Saved logins
											</p>

											<p className="text-2xl font-bold tracking-tight text-slate-800">
												{passwords.length}
											</p>
										</div>

										<span className="ml-auto flex h-8 items-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
											{[12, 20, 15, 25, 18, 30].map((height, index) => (
												<i
													key={index}
													className="w-1.5 rounded-t-full bg-sky-200 transition-all duration-200 group-hover:bg-sky-300"
													style={{ height }}
												/>
											))}
										</span>
									</CardContent>
								</Card>

								{/* Strong Passwords */}
								<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-emerald-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-emerald-50 hover:shadow-xl hover:shadow-emerald-200/70">
									{/* Decorative accent */}
									<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-emerald-100/60 blur-2xl transition-all duration-300 group-hover:bg-emerald-200/70" />

									<CardContent className="relative flex flex-row items-center gap-4 p-5">
										<span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-200 transition-transform duration-200 group-hover:scale-105">
											<ShieldCheck size={20} />
										</span>

										<div className="min-w-0">
											<p className="text-xs font-medium text-slate-500">
												Strong passwords
											</p>

											<p className="text-2xl font-bold tracking-tight text-slate-800">
												{
													passwords.filter(
														(entry) => getStrength(entry.password).score >= 4,
													).length
												}

												<span className="ml-1 text-xs font-normal text-slate-400">
													of {passwords.length}
												</span>
											</p>
										</div>

										<div className="ml-auto flex flex-col items-end gap-1">
											<div className="h-1.5 w-12 overflow-hidden rounded-full bg-emerald-100">
												<div
													className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
													style={{
														width: `${passwords.length
															? Math.min(
																100,
																(passwords.filter(
																	(entry) =>
																		getStrength(entry.password).score >= 4,
																).length /
																	passwords.length) *
																100,
															)
															: 0
															}%`,
													}}
												/>
											</div>

											<span className="text-[9px] font-medium uppercase tracking-wider text-emerald-500">
												Secure
											</span>
										</div>
									</CardContent>
								</Card>

								{/* Categories */}
								<Card className="group relative overflow-hidden border-0 bg-linear-to-br from-white via-white to-amber-100/80 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:to-amber-50 hover:shadow-xl hover:shadow-amber-200/70">
									{/* Decorative accent */}
									<div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-2xl transition-all duration-300 group-hover:bg-amber-200/70" />

									<CardContent className="relative flex flex-row items-center gap-4 p-5">
										<span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200 transition-transform duration-200 group-hover:scale-105">
											<Globe size={20} />
										</span>

										<div className="min-w-0">
											<p className="text-xs font-medium text-slate-500">
												Categories
											</p>

											<p className="text-2xl font-bold tracking-tight text-slate-800">
												{new Set(passwords.map((entry) => entry.category)).size}
											</p>
										</div>

										<span className="ml-auto flex items-center gap-1.5">
											<i className="size-2 rounded-full bg-violet-400 shadow-sm shadow-violet-200" />
											<i className="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
											<i className="size-2 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />
											<i className="size-2 rounded-full bg-fuchsia-400 shadow-sm shadow-fuchsia-200" />
										</span>
									</CardContent>
								</Card>
							</div>

							<Card className="overflow-hidden border-0 bg-transparent shadow-none ring-0">
								<CardHeader className="p-0">
									<div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#34226f] via-[#5637ad] to-[#8055d9] px-5 py-5 text-white shadow-lg shadow-violet-300/30">
										<div className="pointer-events-none absolute -right-8 -top-14 size-44 rounded-full border-24 border-white/5" />
										<div className="pointer-events-none absolute right-20 -top-20 size-40 rounded-full bg-fuchsia-300/10 blur-2xl" />
										<div className="relative flex items-center justify-between gap-4">
											<div className="flex min-w-0 items-center gap-3.5">
												<div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-fuchsia-100 shadow-inner shadow-white/10 backdrop-blur-sm">
													<Key size={21} />
												</div>
												<div className="min-w-0">
													<CardTitle className="text-base font-semibold tracking-tight text-white sm:text-lg">
														Your passwords
													</CardTitle>
													<p className="mt-1 text-xs text-violet-100/75">
														{passwords.length} saved login
														{passwords.length === 1 ? "" : "s"} · all in one place
													</p>
												</div>
											</div>
											<div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-sm sm:flex">
												<span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
												Saved locally
											</div>
										</div>
									</div>
								</CardHeader>

								<CardContent className="p-4 md:p-5">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<label className="relative block w-full max-w-sm">
											<MagnifyingGlass
												size={17}
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
											/>

											<Input
												value={query}
												onChange={(event) => setQuery(event.target.value)}
												placeholder="Search passwords..."
												aria-label="Search passwords"
												className="h-9 border-slate-200 bg-white pl-9 text-sm text-slate-900 shadow-sm shadow-slate-200/40 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/10"
											/>
										</label>

										<div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5">
											{["All", ...categories].map((category) => {
												const active = filter === category;

												return (
													<Button
														key={category}
														size="sm"
														variant="outline"
														className={
															active
																? "h-8 border-violet-200 bg-white px-3 text-xs font-semibold text-violet-700 shadow-sm shadow-violet-200/70 hover:bg-white hover:text-violet-800"
																: "h-8 border-transparent bg-white/75 px-3 text-xs font-medium text-slate-600 shadow-none hover:border-slate-200 hover:bg-white hover:text-violet-700"
														}
														onClick={() => setFilter(category)}
													>
														{category}
													</Button>
												);
											})}
										</div>
									</div>

									<div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
										{visibleEntries.map((entry) => {
											const SiteIcon = categoryIcon(entry.category);
											const strength = getStrength(entry.password);
											const showPassword = revealed.includes(entry.id);

											return (
												<Card
													key={entry.id}
													className="group overflow-hidden border-0 bg-linear-to-br from-white via-white to-slate-50 shadow-lg shadow-slate-300/60 ring-0 transition-all duration-200 hover:-translate-y-1 hover:from-white hover:via-white hover:to-slate-100 hover:shadow-xl hover:shadow-slate-400/40"
												>
													<CardContent className="space-y-4 py-2 px-4 sm:px-5">
														{/* Website */}
														<div className="flex items-start gap-3">
															<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-50">
																<SiteIcon size={19} />
															</div>

															<div className="min-w-0 flex-1 pt-0.5">
																<p className="truncate text-sm font-semibold text-slate-900">
																	{entry.website}
																</p>

																<a
																	href={`https://${entry.url}`}
																	target="_blank"
																	rel="noreferrer"
																	className="block truncate text-xs text-slate-400 transition-colors hover:text-blue-600"
																>
																	{entry.url}
																</a>
															</div>

															<div className="flex shrink-0 items-center">
																<Button
																	variant="ghost"
																	size="icon-sm"
																	className="text-slate-400 opacity-60 transition-colors hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
																	onClick={() => setPasswordDialog(entry)}
																	aria-label={`Edit ${entry.website}`}
																>
																	<PencilSimple size={16} />
																</Button>

																<Button
																	variant="ghost"
																	size="icon-sm"
																	className="text-slate-400 opacity-60 transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
																	onClick={() => {
																		if (
																			window.confirm(
																				`Delete the ${entry.website} login?`,
																			)
																		) {
																			persistPasswords(
																				passwords.filter(
																					(item) => item.id !== entry.id,
																				),
																			);
																		}
																	}}
																	aria-label={`Delete ${entry.website}`}
																>
																	<Trash size={16} />
																</Button>
															</div>
														</div>

														{/* Category + Username */}
														<div className="flex items-center justify-between gap-2">
															<span
																className={`w-fit rounded-md px-2 py-1 text-[10px] font-semibold ${entry.category === "Banking"
																	? "bg-emerald-50 text-emerald-700"
																	: entry.category === "Games"
																		? "bg-fuchsia-50 text-fuchsia-700"
																		: entry.category === "Work"
																			? "bg-amber-50 text-amber-700"
																			: "bg-blue-50 text-blue-700"
																	}`}
															>
																{entry.category}
															</span>

															<span className="truncate text-xs text-slate-500">
																{entry.username}
															</span>
														</div>

														{/* Password */}
														<div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-3 py-2 shadow-inner shadow-slate-100/60">
															<span className="truncate font-mono text-xs text-slate-600">
																{showPassword ? entry.password : "••••••••••••"}
															</span>

															<Button
																variant="ghost"
																size="icon-xs"
																className="shrink-0 text-slate-400 hover:bg-white hover:text-blue-600"
																onClick={() =>
																	setRevealed((current) =>
																		showPassword
																			? current.filter((id) => id !== entry.id)
																			: [...current, entry.id],
																	)
																}
																aria-label={
																	showPassword
																		? "Hide password"
																		: "Reveal password"
																}
															>
																{showPassword ? (
																	<EyeSlash size={15} />
																) : (
																	<Eye size={15} />
																)}
															</Button>
														</div>

														{/* Password Strength */}
														<div className="flex items-center justify-between gap-2 pt-1">
															<span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
																Password strength
															</span>

															<span className="flex items-center gap-2">
																<span className="flex gap-0.5">
																	{Array.from(
																		{ length: 5 },
																		(_, index) => (
																			<i
																				key={index}
																				className={`h-1 w-3 rounded-full ${strength.score > index
																					? strength.color
																					: "bg-slate-200"
																					}`}
																			/>
																		),
																	)}
																</span>

																<span
																	className={`text-[10px] font-medium ${strength.textColor}`}
																>
																	{strength.label}
																</span>
															</span>
														</div>
													</CardContent>
												</Card>
											);
										})}

										{/* Empty State */}
										{visibleEntries.length === 0 && (
											<div className="py-12 text-center sm:col-span-2 xl:col-span-3">
												<MagnifyingGlass
													size={24}
													className="mx-auto mb-3 text-slate-300"
												/>

												<p className="text-sm font-medium text-slate-700">
													No passwords found
												</p>

												<p className="mt-1 text-xs text-slate-400">
													Try another search or category.
												</p>
											</div>
										)}
									</div>

									{/* Footer */}
									<div className="mt-5 flex flex-wrap justify-between gap-2 pt-3 text-xs text-slate-400">
										<span>
											Showing {visibleEntries.length} of {passwords.length} passwords
										</span>

										<span className="flex items-center gap-1 text-emerald-600">
											<CheckCircle size={14} />
											Saved in this browser
										</span>
									</div>
									<p className="mt-3 flex items-start gap-2 rounded-lg border border-violet-100 bg-linear-to-r from-violet-50 to-fuchsia-50/50 px-3 py-2 text-xs leading-relaxed text-slate-600"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-violet-600" /><span><strong className="text-violet-900">Private family space</strong> Securely store and manage your passwords with your family.</span></p>
								</CardContent>
							</Card>

						</>
					) : section === "groceries" ? (
						<>
							<div className="flex flex-wrap items-end justify-between gap-4">
								<div>
									<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-700"><span className="grid size-6 place-items-center rounded-md bg-blue-100 text-blue-700"><CalendarBlank size={14} /></span> PLAN YOUR WEEK</p>
									<h1 className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Grocery planner</h1>
									<p className="mt-1 text-sm text-slate-500">A little list-making goes a long way.</p>
								</div>
								<Button type="button" className="min-h-11 touch-manipulation border-0 bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-400/40" onClick={() => setGroceryDialog(true)}><Plus size={17} /> Add grocery</Button>
							</div>
							<div className="grid items-start gap-5 lg:grid-cols-2">
								<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
									<CardHeader className="gap-4 border-b border-blue-900/10 bg-linear-to-r from-blue-800 via-indigo-800 to-violet-800 p-5 text-white">
										<div className="flex items-center justify-between gap-3">
											<div><CardTitle className="text-white">Your calendar</CardTitle><p className="mt-1 text-xs text-blue-100/80">Select a day to see its grocery list.</p></div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
												<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
												<Button variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="p-5 pt-0">
										<div className="grid grid-cols-7 gap-1 text-center">
											{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-8 place-items-center text-xs font-semibold text-slate-400">{day}</span>)}
											{calendar.map((date, index) => {
												if (!date) return <span key={index} />;
												const selected = getDateKey(date) === dateKey;
												const today = getDateKey(date) === getDateKey(new Date());
												const hasItems = (groceries[getDateKey(date)]?.length ?? 0) > 0;
												return <button key={index} onClick={() => setSelectedDate(date)} aria-label={`${dateLabel(date, { dateStyle: "full" })}${hasItems ? ", has grocery items" : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-all hover:bg-blue-100 ${selected ? "bg-linear-to-br from-blue-700 via-indigo-700 to-violet-700 font-semibold text-white shadow-lg shadow-indigo-300 hover:from-blue-800 hover:via-indigo-800 hover:to-violet-800" : today ? "bg-blue-100 font-semibold text-blue-900 ring-1 ring-inset ring-blue-300" : "text-slate-700"}`}>
													{date.getDate()}{hasItems && <i className={`absolute bottom-1.5 size-1 rounded-full ${selected ? "bg-white" : "bg-indigo-500"}`} />}
												</button>;
											})}
										</div>
										<div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-blue-600 ring-2 ring-blue-100" /> Today</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-indigo-600" /> Has groceries</span></div>
									</CardContent>
								</Card>
								<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
									<CardHeader className="flex flex-row items-center gap-3 border-b border-blue-900/10 bg-linear-to-r from-blue-800 via-indigo-800 to-violet-800 p-5">
										<span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
										<div className="min-w-0 flex-1"><CardTitle className="text-white">{getDateKey(selectedDate) === getDateKey(new Date()) ? "Today’s list" : dateLabel(selectedDate, { weekday: "long" })}</CardTitle><p className="mt-1 text-xs text-blue-100/80">{dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p></div>
										<Button type="button" variant="outline" size="icon-sm" className="size-8 shrink-0 touch-manipulation rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setGroceryDialog(true)} aria-label="Add an item"><Plus size={16} strokeWidth={2.5} /></Button>
									</CardHeader>
									<CardContent className="p-5">
										<div className="mb-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-slate-500"><span>{doneCount} of {dayItems.length} completed</span><span>{dayItems.length ? Math.round(doneCount / dayItems.length * 100) : 0}%</span><div className="col-span-2 h-1 overflow-hidden rounded-full bg-blue-100"><i className="block h-full rounded-full bg-linear-to-r from-blue-600 via-indigo-600 to-violet-500 transition-all" style={{ width: `${dayItems.length ? doneCount / dayItems.length * 100 : 0}%` }} /></div></div>
										<div className="min-h-44 divide-y">
											{dayItems.map((item) => <div key={item.id} className="flex min-h-11 items-center gap-3">
												<button aria-label={item.done ? `Mark ${item.name} incomplete` : `Mark ${item.name} complete`} onClick={() => updateItem(item.id, (current) => ({ ...current, done: !current.done }))} className={`grid size-4 place-items-center rounded border transition-colors ${item.done ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white hover:border-blue-400"}`}>{item.done && <Check size={12} />}</button>
												<span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.name}</span>
												<Button variant="ghost" size="icon-xs" onClick={() => updateItem(item.id, () => null)} aria-label={`Remove ${item.name}`}><X size={15} /></Button>
											</div>)}
											{dayItems.length === 0 && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-muted-foreground"><ShoppingCartSimple size={24} /><p className="text-sm font-medium text-foreground">Your list is clear</p><p className="text-xs">Add groceries for this day to get started.</p></div>}
										</div>
										<Button type="button" variant="outline" className="mt-3 min-h-11 w-full touch-manipulation border-dashed border-blue-200 bg-blue-50/40 text-blue-700 hover:border-blue-300 hover:bg-blue-50" onClick={() => setGroceryDialog(true)}><Plus size={16} /> Add an item</Button>
										{dayItems.length > 0 && doneCount === dayItems.length && <p className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-700"><CheckCircle size={15} /> Everything on your list is done!</p>}
									</CardContent>
								</Card>
							</div>
							<p className="flex items-center gap-2 rounded-lg border border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50/50 p-3 text-xs text-blue-950/70"><CalendarBlank size={16} className="text-blue-600" /> Choose a day on the calendar to create and view its own saved grocery list.</p>
						</>
					) : (
						<>
							<div className="flex flex-wrap items-end justify-between gap-4">
								<div>
									<p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-teal-700"><span className="grid size-6 place-items-center rounded-md bg-teal-100 text-teal-700"><Baby size={15} /></span> BABY NEEDS</p>
									<h1 className="bg-linear-to-r from-slate-900 via-teal-950 to-cyan-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">Kyooowe Needs</h1>
									<p className="mt-1 text-sm text-slate-500">Keep vaccinations and important little milestones in one place.</p>
								</div>
								<Button type="button" className="min-h-11 touch-manipulation border-0 bg-linear-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-300/50 ring-1 ring-inset ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl hover:shadow-teal-400/40" onClick={() => setBabyNeedDialog("new")}><Plus size={17} /> Add baby need</Button>
							</div>

							<div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${upcomingVaccine ? "border-amber-200 bg-linear-to-r from-amber-50 to-orange-50" : "border-teal-100 bg-linear-to-r from-white to-teal-50"}`}>
								<span className={`grid size-10 shrink-0 place-items-center rounded-xl ${upcomingVaccine ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
									{upcomingVaccine ? <Syringe size={19} /> : <Bell size={19} />}
								</span>
								<div className="min-w-0">
									<p className={`text-xs font-semibold uppercase tracking-wide ${upcomingVaccine ? "text-amber-700" : "text-teal-700"}`}>{upcomingVaccine ? "Next vaccine" : "Vaccine reminder"}</p>
									<p className="truncate text-sm font-semibold text-slate-800">{upcomingVaccine ? upcomingVaccine.title : "No upcoming vaccines scheduled"}</p>
								</div>
								{upcomingVaccine && <span className="ml-auto shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">{dateLabel(new Date(`${upcomingVaccine.dateKey}T00:00:00`), { month: "short", day: "numeric", year: "numeric" })}</span>}
							</div>

							<div className="grid items-start gap-5 lg:grid-cols-2">
								<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
									<CardHeader className="gap-4 border-b border-teal-900/10 bg-linear-to-r from-teal-800 via-teal-700 to-cyan-700 p-5 text-white">
										<div className="flex items-center justify-between gap-3">
											<div><CardTitle className="text-white">Baby calendar</CardTitle><p className="mt-1 text-xs text-teal-100/85">Vaccines and important dates at a glance.</p></div>
											<div className="flex items-center gap-2">
												<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} strokeWidth={2.5} /></Button>
												<span className="min-w-28 text-center text-sm font-bold text-white">{dateLabel(month, { month: "long", year: "numeric" })}</span>
												<Button type="button" variant="outline" size="icon-sm" className="rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} strokeWidth={2.5} /></Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="p-5 pt-0">
										<div className="grid grid-cols-7 gap-1 text-center">
											{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="grid h-8 place-items-center text-xs font-semibold text-slate-400">{day}</span>)}
											{calendar.map((date, index) => {
												if (!date) return <span key={index} />;
												const key = getDateKey(date);
												const selected = key === dateKey;
												const today = key === todayKey;
												const needs = babyNeeds[key] ?? [];
												const hasVaccine = needs.some((item) => item.type === "Vaccination" && !item.done);
												const hasImportantDate = needs.some((item) => item.type === "Important date" && !item.done);
												const markers = [hasVaccine ? "upcoming vaccine" : "", hasImportantDate ? "important date" : ""].filter(Boolean).join(" and ");
												return <button type="button" key={index} onClick={() => setSelectedDate(date)} aria-label={`${dateLabel(date, { dateStyle: "full" })}${markers ? `, ${markers}` : ""}`} className={`relative grid aspect-square place-items-center rounded-xl text-sm transition-all hover:bg-teal-100 ${selected ? "bg-linear-to-br from-teal-700 via-teal-700 to-cyan-700 font-semibold text-white shadow-lg shadow-teal-300 hover:from-teal-800 hover:to-cyan-800" : hasVaccine ? "bg-amber-50 font-semibold text-amber-900 ring-1 ring-inset ring-amber-200" : hasImportantDate ? "bg-rose-50 font-semibold text-rose-900 ring-1 ring-inset ring-rose-200" : today ? "bg-teal-50 font-semibold text-teal-900 ring-1 ring-inset ring-teal-300" : "text-slate-700"}`}>
													{date.getDate()}
													{(hasVaccine || hasImportantDate) && <span className="absolute bottom-1.5 flex gap-0.5">{hasVaccine && <i className={`size-1 rounded-full ${selected ? "bg-amber-200" : "bg-amber-500"}`} />}{hasImportantDate && <i className={`size-1 rounded-full ${selected ? "bg-rose-200" : "bg-rose-500"}`} />}</span>}
												</button>;
											})}
										</div>
										<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
											<span className="flex items-center gap-2"><i className="size-2 rounded-full bg-teal-600 ring-2 ring-teal-100" /> Today</span>
											<span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" /> Vaccine</span>
											<span className="flex items-center gap-2"><i className="size-2 rounded-full bg-rose-500" /> Important date</span>
										</div>
									</CardContent>
								</Card>

								<Card className="overflow-hidden border-0 bg-white py-0 shadow-lg shadow-slate-300/40 ring-0">
									<CardHeader className="flex flex-row items-center gap-3 border-b border-teal-900/10 bg-linear-to-r from-teal-800 via-teal-700 to-cyan-700 p-5">
										<span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10"><span className="text-[9px] font-semibold uppercase">{dateLabel(selectedDate, { month: "short" })}</span><strong className="text-lg leading-5">{selectedDate.getDate()}</strong></span>
										<div className="min-w-0 flex-1"><CardTitle className="text-white">{dateKey === todayKey ? "Today’s needs" : "Baby’s needs"}</CardTitle><p className="mt-1 text-xs text-teal-100/85">{dateLabel(selectedDate, { month: "long", day: "numeric", year: "numeric" })}</p></div>
										<Button type="button" variant="outline" size="icon-sm" className="size-8 shrink-0 touch-manipulation rounded-xl border border-white/20 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-lg" onClick={() => setBabyNeedDialog("new")} aria-label="Add a baby need"><Plus size={16} strokeWidth={2.5} /></Button>
									</CardHeader>
									<CardContent className="p-5">
										<p className="mb-3 text-xs text-slate-500">{babyDayItems.length} saved {babyDayItems.length === 1 ? "item" : "items"} · {babyDayItems.filter((item) => item.done).length} completed</p>
										<div className="min-h-44 divide-y divide-slate-100">
											{babyDayItems.map((item) => {
												const ItemIcon = item.type === "Vaccination" ? Syringe : Star;
												return <div key={item.id} className="flex min-h-16 items-center gap-3 py-2">
													<button type="button" aria-label={item.done ? `Mark ${item.title} not completed` : `Mark ${item.title} completed`} onClick={() => updateBabyNeed(item.id, (current) => ({ ...current, done: !current.done }))} className={`grid size-8 shrink-0 place-items-center rounded-xl transition-colors ${item.done ? "bg-teal-100 text-teal-700" : item.type === "Vaccination" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}>{item.done ? <Check size={16} /> : <ItemIcon size={16} />}</button>
													<div className="min-w-0 flex-1">
														<p className={`truncate text-sm font-semibold ${item.done ? "text-slate-400 line-through" : "text-slate-800"}`}>{item.title}</p>
														<p className="mt-0.5 text-xs text-slate-500">{item.type}{item.notes ? ` · ${item.notes}` : ""}</p>
													</div>
													<Button type="button" variant="ghost" size="icon-sm" className="size-9 shrink-0 text-slate-400 hover:bg-teal-50 hover:text-teal-700" onClick={() => setBabyNeedDialog(item)} aria-label={`Edit ${item.title}`}><PencilSimple size={15} /></Button>
													<Button type="button" variant="ghost" size="icon-sm" className="size-9 shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => updateBabyNeed(item.id, () => null)} aria-label={`Delete ${item.title}`}><Trash size={15} /></Button>
												</div>;
											})}
											{babyDayItems.length === 0 && <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-slate-400"><Baby size={26} /><p className="text-sm font-medium text-slate-700">Nothing planned for this day</p><p className="text-xs">Add a vaccine or an important date to remember.</p></div>}
										</div>
										<Button type="button" variant="outline" className="mt-3 min-h-11 w-full touch-manipulation border-dashed border-teal-200 bg-teal-50/50 text-teal-700 hover:border-teal-300 hover:bg-teal-50" onClick={() => setBabyNeedDialog("new")}><Plus size={16} /> Add a baby need</Button>
									</CardContent>
								</Card>
							</div>
							<p className="flex items-center gap-2 rounded-lg border border-teal-100 bg-linear-to-r from-teal-50 to-cyan-50/50 p-3 text-xs text-teal-950/70"><CalendarBlank size={16} className="shrink-0 text-teal-700" /> Select a date to record a vaccination, schedule the next one, or highlight another important day.</p>
						</>
					)}
				</div>
			</section>

			<Dialog open={passwordDialog !== null} onOpenChange={(open) => { if (!open) setPasswordDialog(null); }}>
				<DialogContent className="max-w-lg overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10 sm:rounded-2xl">
					{passwordDialog && (
						<>
							<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
								<div className="flex items-start gap-3.5">
									<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
										<Key size={18} />
									</div>

									<div>
										<DialogTitle className="text-base font-semibold text-slate-900">
											{passwordDialog === "new" ? "Add a password" : "Edit password"}
										</DialogTitle>

										<DialogDescription className="mt-1 text-sm text-slate-500">
											Keep your login details together.
										</DialogDescription>
									</div>
								</div>

								<DialogClose
									aria-label="Close dialog"
									className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
								>
									<X size={17} />
								</DialogClose>
							</div>

							<div className="px-6 py-5">
								<PasswordForm
									key={passwordDialog === "new" ? "new" : passwordDialog.id}
									entry={passwordDialog}
									onSubmit={submitPassword}
									onCancel={() => setPasswordDialog(null)}
								/>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={groceryDialog} onOpenChange={setGroceryDialog}>
				<DialogContent className="max-w-sm overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10 sm:rounded-2xl">
					<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
						<div className="flex items-start gap-3.5">
							<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-200">
								<ShoppingCartSimple size={18} />
							</div>

							<div>
								<DialogTitle className="text-base font-semibold text-slate-900">
									Add to your list
								</DialogTitle>

								<DialogDescription className="mt-1 text-sm text-slate-500">
									{dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}
								</DialogDescription>
							</div>
						</div>

						<DialogClose
							aria-label="Close dialog"
							className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
						>
							<X size={17} />
						</DialogClose>
					</div>

					<form onSubmit={submitGrocery} className="space-y-5 px-6 py-5">
						<label className="block space-y-2 text-sm font-medium text-slate-800">
							Grocery item
							<Input
								required
								name="item"
								placeholder="e.g. Fresh strawberries"
								className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
							/>
						</label>

						<div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
							<Button
								type="button"
								variant="outline"
								className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
								onClick={() => setGroceryDialog(false)}
							>
								Cancel
							</Button>

							<Button
								type="submit"
								className="bg-linear-to-r from-blue-700 to-indigo-700 text-white shadow-sm shadow-blue-200 hover:from-blue-800 hover:to-indigo-800"
							>
								<Plus size={16} />
								Add item
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={babyNeedDialog !== null} onOpenChange={(open) => { if (!open) setBabyNeedDialog(null); }}>
				<DialogContent className="max-w-sm overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/10 sm:rounded-2xl">
					{babyNeedDialog && (
						<>
							<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
								<div className="flex items-start gap-3.5">
									<div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-teal-700 to-cyan-700 text-white shadow-sm shadow-teal-200">
										<Baby size={18} />
									</div>
									<div>
										<DialogTitle className="text-base font-semibold text-slate-900">
											{babyNeedDialog === "new" ? "Add a baby need" : "Edit baby need"}
										</DialogTitle>
										<DialogDescription className="mt-1 text-sm text-slate-500">
											{dateLabel(selectedDate, { weekday: "long", month: "long", day: "numeric" })}
										</DialogDescription>
									</div>
								</div>
								<DialogClose
									aria-label="Close dialog"
									className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
								>
									<X size={17} />
								</DialogClose>
							</div>

							<form key={babyNeedDialog === "new" ? "new" : babyNeedDialog.id} onSubmit={submitBabyNeed} className="space-y-4 px-6 py-5">
								<label className="block text-sm font-medium text-slate-900">
									What do you need to remember?
									<Input required name="title" placeholder="e.g. First dose of vaccine" defaultValue={babyNeedDialog === "new" ? "" : babyNeedDialog.title} className="mt-2 h-10 border-teal-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20" />
								</label>
								<label className="block text-sm font-medium text-slate-900">
									Type
									<select name="type" defaultValue={babyNeedDialog === "new" ? "Vaccination" : babyNeedDialog.type} className="mt-2 h-10 w-full rounded-xl border border-teal-200 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20">
										<option value="Vaccination">Vaccination</option>
										<option value="Important date">Important date</option>
									</select>
								</label>
								<label className="block text-sm font-medium text-slate-900">
									Notes <span className="font-normal text-slate-400">(optional)</span>
									<Input name="notes" placeholder="e.g. Clinic, dose, or a little reminder" defaultValue={babyNeedDialog === "new" ? "" : babyNeedDialog.notes} className="mt-2 h-10 border-teal-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20" />
								</label>
								<div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
									<Button type="button" variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => setBabyNeedDialog(null)}>Cancel</Button>
									<Button type="submit" className="bg-linear-to-r from-teal-700 to-cyan-700 text-white shadow-sm shadow-teal-200 hover:from-teal-800 hover:to-cyan-800">{babyNeedDialog === "new" ? <><Plus size={16} /> Add reminder</> : "Save changes"}</Button>
								</div>
							</form>
						</>
					)}
				</DialogContent>
			</Dialog>

		</main>
	);
}

function PasswordForm({ entry, onSubmit, onCancel }: {
	entry: PasswordEntry | "new";
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onCancel: () => void;
}) {
	const [password, setPassword] = useState(entry === "new" ? "" : entry.password);
	const [show, setShow] = useState(false);
	const strength = getStrength(password);
	return <form onSubmit={onSubmit} className="space-y-4">
		<label className="block text-sm font-medium text-slate-900">Website name<Input required name="website" placeholder="e.g. Instagram" defaultValue={entry === "new" ? "" : entry.website} className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200" /></label>
		<label className="block text-sm font-medium text-slate-900">Website URL<Input required name="url" placeholder="e.g. instagram.com" defaultValue={entry === "new" ? "" : entry.url} className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200" /></label>
		<label className="block text-sm font-medium text-slate-900">Category<select name="category" defaultValue={entry === "new" ? "Social media" : entry.category} className="mt-2 h-9 w-full rounded-md border border-violet-200 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-violet-300">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
		<label className="block text-sm font-medium text-slate-900">Username or email<Input required name="username" placeholder="Your username" defaultValue={entry === "new" ? "" : entry.username} className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200" /></label>
		<label className="block text-sm font-medium text-slate-900">Password<span className="relative mt-2 block"><Input required name="password" type={show ? "text" : "password"} placeholder="Enter a strong password" value={password} onChange={(event) => setPassword(event.target.value)} className="border-violet-200 bg-white pr-10 text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200" /><Button type="button" variant="ghost" size="icon-sm" className="absolute right-1 top-0.5 text-violet-500 hover:bg-violet-50 hover:text-violet-800" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeSlash size={17} /> : <Eye size={17} />}</Button></span><span className="mt-1 flex items-center gap-2 text-xs font-normal"><span className="flex gap-0.5">{Array.from({ length: 5 }, (_, index) => <i key={index} className={`h-1 w-4 rounded-full ${password && strength.score > index ? strength.color : "bg-violet-100"}`} />)}</span><span className={password ? strength.textColor : "text-violet-400"}>{password ? `${strength.label} password` : "Add a password to check its strength"}</span></span></label>
		<div className="flex justify-end gap-2 border-t border-violet-100 pt-4"><Button type="button" variant="outline" className="border-violet-200 bg-white text-violet-800 hover:bg-violet-50" onClick={onCancel}>Cancel</Button><Button type="submit" className="border-0 bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-300/40 hover:from-violet-700 hover:to-fuchsia-700">{entry === "new" ? "Save password" : "Save changes"}</Button></div>
	</form>;
}
