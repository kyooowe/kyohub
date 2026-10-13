"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/features/passwords/components/password-strength";
import { categories } from "@/features/passwords/lib/password-utils";
import type { Category, PasswordEntry } from "@/features/passwords/types";

export function PasswordForm({ entry, onSubmit, submitting = false }: { entry: PasswordEntry | "new"; onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting?: boolean }) {
	const [password, setPassword] = useState(entry === "new" ? "" : entry.password);
	const [show, setShow] = useState(false);
	const formCategories: Category[] = entry !== "new" && entry.category === "Other" ? [...categories, "Other"] : categories;
	return <form onSubmit={onSubmit} className="space-y-4">
		<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Website name<Input required name="website" defaultValue={entry === "new" ? "" : entry.website} placeholder="e.g. Instagram" className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
		<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Website URL<Input required name="url" defaultValue={entry === "new" ? "" : entry.url} placeholder="e.g. instagram.com" className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
		<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Category<select name="category" defaultValue={entry === "new" ? "Social media" : entry.category} className="mt-2 h-9 w-full rounded-md border border-violet-200 bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-violet-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">{formCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
		<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Username or email<Input required name="username" defaultValue={entry === "new" ? "" : entry.username} placeholder="Your username" className="mt-2 border-violet-200 bg-white text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
		<label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Password<span className="relative mt-2 block"><Input required name="password" type={show ? "text" : "password"} placeholder="Enter a strong password" value={password} onChange={(event) => setPassword(event.target.value)} className="border-violet-200 bg-white pr-10 text-slate-900 focus-visible:border-violet-400 focus-visible:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /><Button type="button" variant="ghost" size="icon-sm" className="absolute right-1 top-0.5 text-violet-500 hover:bg-violet-50 hover:text-violet-800 dark:text-violet-300 dark:hover:bg-slate-700 dark:hover:text-violet-100" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</Button></span><PasswordStrength password={password} /></label>
		<div className="flex flex-wrap justify-end gap-2 border-t border-violet-100 pt-4 dark:border-violet-800"><Button type="submit" variant="ghost" disabled={submitting} className="palette-action-button palette-dialog-footer-button border font-medium transition-colors duration-150">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}{entry === "new" ? "Save password" : "Save changes"}</Button></div>
	</form>;
}
