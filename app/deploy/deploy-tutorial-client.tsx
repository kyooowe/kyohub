"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import {
	Database,
	Terminal,
	Server,
	CheckCircle2,
	Copy,
	Check,
	ExternalLink,
	Sparkles,
	Key,
	ArrowRight,
	HelpCircle,
	Info,
	FileText,
	ChevronRight,
	Compass,
	AlertTriangle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Authentic KyoHub 4-dot brand emblem in green
function KyoHubBrandLogo({ className = "size-8" }: { className?: string }) {
	return (
		<div
			className={`grid grid-cols-2 gap-1 rounded-xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-500/25 ${className}`}
			aria-label="KyoHub logo"
		>
			<span className="rounded-[3px] bg-white" />
			<span className="rounded-[3px] bg-white/60" />
			<span className="rounded-[3px] bg-white/60" />
			<span className="rounded-[3px] bg-white" />
		</div>
	);
}

interface StepItem {
	id: string;
	number: string;
	title: string;
	description: string;
	code?: string;
	command?: string;
	actionUrl?: string;
	actionLabel?: string;
	tip?: string;
	substeps?: string[];
	highlight?: boolean;
}

interface StepPhase {
	id: "database" | "project" | "vercel";
	badge: string;
	title: string;
	subtitle: string;
	icon: any;
	color: string;
	accentBg: string;
	accentBorder: string;
	steps: StepItem[];
}

export function DeployTutorialClient() {
	const [activeTab, setActiveTab] = useState<"all" | "database" | "project" | "vercel">("all");
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
	const [showGlossary, setShowGlossary] = useState(false);
	const [envBuilderOpen, setEnvBuilderOpen] = useState(false);

	// Interactive .env generator state
	const [envValues, setEnvValues] = useState({
		databaseUrl: "postgresql://user:password@cloud.prisma.io/mydb",
		pins: "123456,654321",
		users: "123456:Alex,654321:Partner",
		authSecret: "super-secret-random-key-change-this-string-32chars",
		cronSecret: "long-random-cron-secret-change-this-too",
		publicVapid: "BF_public_key_generated_from_npx_web_push...",
		privateVapid: "private_key_generated_from_npx_web_push...",
		email: "your-email@example.com",
	});

	const copyToClipboard = (text: string, keyId: string) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(keyId);
		setTimeout(() => setCopiedKey(null), 2200);
	};

	const phases: StepPhase[] = [
		{
			id: "database",
			badge: "Phase 1",
			title: "Database Setup",
			subtitle: "Create your free PostgreSQL cloud database with Prisma so your family's data has a safe, private home.",
			icon: Database,
			color: "text-teal-600 dark:text-teal-400",
			accentBg: "from-teal-500/10 via-cyan-500/5 to-transparent",
			accentBorder: "border-teal-500/20",
			steps: [
				{
					id: "db-1",
					number: "1",
					title: "Go to Prisma Cloud & Log In",
					description: "Visit prisma.io in your browser. You can sign in using GitHub, Google, or your regular email. No credit card required.",
					actionUrl: "https://prisma.io",
					actionLabel: "Open prisma.io",
					tip: "If you don't have an account yet, sign up takes less than 30 seconds.",
				},
				{
					id: "db-2",
					number: "2",
					title: "Click 'New Project'",
					description: "Once inside your Prisma dashboard, locate and click the 'New Project' button in the top right corner.",
				},
				{
					id: "db-3",
					number: "3",
					title: "Name Your Project",
					description: "Type in a project name (such as 'kyohub-family') and click 'Create Project' / 'Create Account'.",
				},
				{
					id: "db-4",
					number: "4",
					title: "Click 'Add a Database'",
					description: "In your newly created project screen, click the 'Add a Database' button to provision your database server.",
				},
				{
					id: "db-5",
					number: "5",
					title: "Enter Database Name & Create",
					description: "Enter a database name (e.g. 'kyohub-db'), select the region closest to you, and click 'Create Database'.",
				},
				{
					id: "db-6",
					number: "6",
					title: "Copy the connectionString",
					description: "Prisma will show you a connection string starting with postgresql://. Click the copy icon to save it safely to your clipboard.",
					tip: "Keep this connection string private! You will paste it into your configuration file in Phase 2.",
					highlight: true,
				},
			],
		},
		{
			id: "project",
			badge: "Phase 2",
			title: "Project Setup & Keys",
			subtitle: "Download the code, configure your personal family security PINs, and generate push notification keys.",
			icon: Terminal,
			color: "text-teal-700 dark:text-teal-300",
			accentBg: "from-[#0c2340]/10 via-teal-500/5 to-transparent",
			accentBorder: "border-teal-600/20",
			steps: [
				{
					id: "proj-1",
					number: "1",
					title: "Clone the Project",
					description: "Download the KyoHub codebase to your computer using Git. Paste this command into your terminal or PowerShell:",
					command: "git clone https://github.com/kyooowe/kyohub.git",
					tip: "This creates a 'kyohub' folder on your machine with all the app files.",
				},
				{
					id: "proj-2",
					number: "2",
					title: "Install the Free Tools (Node.js & VS Code)",
					description: "If you don't have them yet, install these two free, industry-standard tools:",
					substeps: [
						"2.1 Node.js (LTS recommended) — Click 'Open nodejs.org' below and run the installer.",
						"2.2 Visual Studio Code — The popular free code editor from Microsoft.",
					],
					actionUrl: "https://nodejs.org",
					actionLabel: "Download Node.js",
				},
				{
					id: "proj-3",
					number: "3",
					title: "Open in VS Code & Launch Terminal",
					description: "Open VS Code, choose File > Open Folder..., select the 'kyohub' folder, and press Ctrl + Shift + ` (or Cmd + Shift + ` on Mac) to open the built-in terminal at the bottom.",
					tip: "You can also open terminal by clicking 'Terminal' in the top menu bar, then 'New Terminal'.",
				},
				{
					id: "proj-4",
					number: "4",
					title: "Install Dependencies with npm i",
					description: "Type this command into the VS Code terminal and press Enter to download the libraries KyoHub needs:",
					command: "npm i",
					tip: "Wait 10-30 seconds until you see the cursor prompt reappear. If you see warnings, don't worry—that is normal.",
				},
				{
					id: "proj-5",
					number: "5",
					title: "Create .env and .env.local Files",
					description: "Look at the left file explorer in VS Code. Rename '.env.example' to '.env'. Then create a brand new file named '.env.local'.",
					tip: "⚠️ Important rule: Keep both .env and .env.local synchronized with the exact same values so your app runs seamlessly in all environments.",
					highlight: true,
				},
				{
					id: "proj-6",
					number: "6",
					title: "Paste connectionString & Initialize Database",
					description: "In your .env and .env.local files, replace the DATABASE_URL value with the connectionString you copied from Prisma in Step 6.",
					code: 'DATABASE_URL="postgresql://user:password@host:5432/dbname"',
					substeps: [
						"6.1 Once saved, run this in your terminal to create all tables and schema automatically:",
					],
					command: "npx prisma db init",
					tip: "Prisma will automatically create your grocery lists, appointments, and credentials tables in seconds!",
				},
				{
					id: "proj-7",
					number: "7",
					title: "Configure Family PINs & Member Names",
					description: "Set the 6-digit PINs and member names for you and your family. Each person gets their own 6-digit PIN and profile name:",
					code: `AUTH_PINS="123456,654321"\nAUTH_USERS="123456:Alex Morgan,654321:Partner"`,
					tip: "You can add as many family members as you want, separated by commas!",
				},
				{
					id: "proj-8",
					number: "8",
					title: "Add Long Keys to AUTH_SECRET & CRON_SECRET",
					description: "Provide long random secret strings to encrypt cookies and secure scheduled reminders:",
					code: `AUTH_SECRET="put-any-long-random-string-or-passphrase-here-32-chars"\nCRON_SECRET="another-long-random-string-for-cron-notifications"`,
					tip: "You can mash your keyboard or use any long 32+ character sentence.",
				},
				{
					id: "proj-9",
					number: "9",
					title: "Generate Push Notification Keys",
					description: "Run this command in the terminal to generate your web push VAPID keys for reminders:",
					command: "npx web-push generate-vapid-keys",
					tip: "This will output a 'Public Key' and a 'Private Key' in your terminal window.",
				},
				{
					id: "proj-10",
					number: "10",
					title: "Copy VAPID Keys to Your .env",
					description: "Copy the generated keys from the terminal into both .env and .env.local like this:",
					code: `NEXT_PUBLIC_VAPID_PUBLIC_KEY="paste_public_key_here"\nVAPID_PUBLIC_KEY="paste_same_public_key_here"\nVAPID_PRIVATE_KEY="paste_private_key_here"`,
				},
				{
					id: "proj-11",
					number: "11",
					title: "Add Your Email to VAPID_SUBJECT",
					description: "Put your contact email with a mailto: prefix in VAPID_SUBJECT:",
					code: `VAPID_SUBJECT="mailto:your-email@example.com"`,
					tip: "Web push services require an email address in case of notification delivery issues.",
				},
			],
		},
		{
			id: "vercel",
			badge: "Phase 3",
			title: "Deploy to Vercel (Going Live 🚀)",
			subtitle: "Host your app on the cloud for free with HTTPS, automatic updates, and 24/7 uptime.",
			icon: Server,
			color: "text-teal-600 dark:text-teal-400",
			accentBg: "from-teal-500/10 via-emerald-500/5 to-transparent",
			accentBorder: "border-teal-500/20",
			steps: [
				{
					id: "ver-12",
					number: "12",
					title: "Install Vercel CLI",
					description: "Install the official Vercel command line tool globally by running this command in your terminal:",
					command: "npm install -g vercel",
					tip: "This allows you to manage deployments directly from your terminal.",
				},
				{
					id: "ver-13",
					number: "13",
					title: "Log In to Vercel",
					description: "Run this command to log in or create a free Vercel account:",
					command: "vercel login",
					tip: "Terminal will show login options (GitHub, GitLab, or Email). Choose whichever you prefer and complete verification.",
				},
				{
					id: "ver-14",
					number: "14",
					title: "Run Initial Deployment",
					description: "Once login succeeds, kick off your first build by running:",
					command: "vercel --prod",
					substeps: [
						"14.1 When asked: Select 'Set up and deploy? [Y/n]' -> press Enter (Y)",
						"14.2 'Which scope?' -> press Enter",
						"14.3 'Link to existing project? [y/N]' -> press Enter (N)",
						"14.4 'What's your project's name?' -> type 'kyohub' and press Enter",
						"14.5 For all other prompts -> simply hit Enter to accept the smart defaults!",
					],
				},
				{
					id: "ver-15",
					number: "15",
					title: "Add Environment Variables to Vercel",
					description: "Now sync your secret keys to Vercel so your cloud app can access your database and authentication.",
					substeps: [
						"✨ Easier Way (Non-Techy Recommended): Go to vercel.com > Log in > Click your 'kyohub' project > Go to Settings > Environment Variables > Add each key and value from your .env one by one!",
						"⚡ Terminal Way: Run each command in terminal and paste matching values. All 9 commands are located on the \"All Vercel Environment Variable Commands\" card below!",
					],
					tip: "💡 Crucial rule: Whenever you add or edit environment variables on Vercel, you must redeploy by running 'vercel --prod' to apply changes!",
					highlight: true,
				},
				{
					id: "ver-16",
					number: "16",
					title: "Final Production Deploy & Live URL 🎉",
					description: "After adding all environment variables, run the production deploy command one final time:",
					command: "vercel --prod",
					tip: "When completed, Vercel will print your 'Aliased URL' (e.g. https://kyohub.vercel.app). Click it to open your brand new, private KyoHub instance!",
					highlight: true,
				},
			],
		},
	];

	const allSteps = phases.flatMap((phase) => phase.steps);
	const totalStepsCount = allSteps.length;
	const completedCount = Object.values(completedSteps).filter(Boolean).length;
	const progressPercent = Math.round((completedCount / totalStepsCount) * 100);

	const completeAndNext = (stepId: string) => {
		const isCurrentlyDone = !!completedSteps[stepId];
		const nextState = !isCurrentlyDone;

		setCompletedSteps((prev) => ({
			...prev,
			[stepId]: nextState,
		}));

		// If user completed this step, auto-scroll and center the next step card
		if (nextState) {
			const currentIndex = allSteps.findIndex((s) => s.id === stepId);
			const nextStep = allSteps[currentIndex + 1];

			if (nextStep) {
				const nextPhase = phases.find((p) => p.steps.some((s) => s.id === nextStep.id));
				if (activeTab !== "all" && nextPhase && activeTab !== nextPhase.id) {
					setActiveTab(nextPhase.id);
				}

				setTimeout(() => {
					const nextEl = document.getElementById(`step-card-${nextStep.id}`);
					if (nextEl) {
						nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
						nextEl.classList.add("ring-2", "ring-teal-500", "ring-offset-2");
						setTimeout(() => {
							nextEl.classList.remove("ring-2", "ring-teal-500", "ring-offset-2");
						}, 1400);
					}
				}, 100);
			} else {
				// Final step completed! Scroll to celebration banner
				setTimeout(() => {
					const banner = document.getElementById("deployment-success-banner");
					if (banner) {
						banner.scrollIntoView({ behavior: "smooth", block: "center" });
					}
				}, 100);
			}
		}
	};

	const envCommands = [
		"vercel env add DATABASE_URL production",
		"vercel env add AUTH_PINS production",
		"vercel env add AUTH_USERS production",
		"vercel env add AUTH_SECRET production",
		"vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY production",
		"vercel env add VAPID_PUBLIC_KEY production",
		"vercel env add VAPID_PRIVATE_KEY production",
		"vercel env add VAPID_SUBJECT production",
		"vercel env add CRON_SECRET production",
	];

	const fullEnvTemplate = `# PostgreSQL connection from Prisma
DATABASE_URL="${envValues.databaseUrl}"

# Comma-separated 6-digit PINs
AUTH_PINS="${envValues.pins}"

# Map each PIN to a family member name
AUTH_USERS="${envValues.users}"

# Long random string used to sign session cookies
AUTH_SECRET="${envValues.authSecret}"

# Web Push Notifications (generated by: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="${envValues.publicVapid}"
VAPID_PUBLIC_KEY="${envValues.publicVapid}"
VAPID_PRIVATE_KEY="${envValues.privateVapid}"
VAPID_SUBJECT="mailto:${envValues.email}"

# Secret for background cron reminders
CRON_SECRET="${envValues.cronSecret}"`;

	return (
		<div
			style={{ "--action-accent": "#17756D", "--page-accent-base": "#17756D" } as CSSProperties}
			className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100"
		>
			{/* Top Navbar */}
			<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-3">
						<Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
							<KyoHubBrandLogo className="size-8 drop-shadow-xs transition-transform group-hover:scale-105" />
							<span className="text-xl font-bold tracking-tight">
								<span className="text-[#0c2340] dark:text-white">Kyo</span>
								<span className="text-[#17756D] dark:text-teal-400">hub</span>
							</span>
						</Link>

						<span className="hidden items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 sm:inline-flex dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
							<Sparkles className="size-3 text-teal-600 dark:text-teal-400" /> Deployment Tutorial
						</span>
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<button
							type="button"
							onClick={() => setShowGlossary(!showGlossary)}
							className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/80 px-3 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
							title="Non-techy explanations"
						>
							<HelpCircle className="size-3.5 text-teal-600 dark:text-teal-400" />
							<span className="hidden sm:inline">Beginner Glossary</span>
						</button>

						<ThemeToggle className="size-[34px]" />

						<Link
							href="/"
							className="palette-action-button inline-flex h-[34px] items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold transition-all active:scale-95"
						>
							<span>Go to App</span>
							<ArrowRight className="size-3.5" />
						</Link>
					</div>
				</div>
			</header>

			{/* Beginner Glossary Modal / Drawer */}
			{showGlossary && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
					<div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
						<div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-teal-50 p-1.5 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
									<HelpCircle className="size-5" />
								</div>
								<div>
									<h2 className="text-base font-bold text-slate-900 dark:text-white">Non-Techy Dictionary</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400">Simple everyday analogies for tech terms</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowGlossary(false)}
								className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
							>
								✕
							</button>
						</div>

						<div className="space-y-3.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
							<div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
								<p className="font-semibold text-slate-900 dark:text-white">🗄️ Database (Prisma)</p>
								<p className="mt-1 text-slate-500 dark:text-slate-400">
									Think of it as a private, secure digital filing cabinet in the cloud where your grocery list items, appointments, and password cards are safely stored.
								</p>
							</div>

							<div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
								<p className="font-semibold text-slate-900 dark:text-white">💻 Terminal / Command Prompt</p>
								<p className="mt-1 text-slate-500 dark:text-slate-400">
									A simple text window where you give instructions to your computer by pasting commands and pressing Enter. You don&apos;t need to write code!
								</p>
							</div>

							<div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
								<p className="font-semibold text-slate-900 dark:text-white">🔒 .env (Environment Variables)</p>
								<p className="mt-1 text-slate-500 dark:text-slate-400">
									A secret notepad on your computer that holds private keys, database passwords, and PINs. It is never uploaded publicly so your data stays 100% yours.
								</p>
							</div>

							<div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
								<p className="font-semibold text-slate-900 dark:text-white">☁️ Vercel</p>
								<p className="mt-1 text-slate-500 dark:text-slate-400">
									The free cloud hosting company that runs your website online 24/7 so you can access KyoHub from your phone, laptop, or tablet anywhere in the world.
								</p>
							</div>

							<div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
								<p className="font-semibold text-slate-900 dark:text-white">🔔 VAPID Keys</p>
								<p className="mt-1 text-slate-500 dark:text-slate-400">
									A pair of security keys that allow KyoHub to send push notifications (like baby reminder alerts) directly to your mobile phone or browser safely.
								</p>
							</div>
						</div>

						<div className="mt-5 text-right">
							<button
								type="button"
								onClick={() => setShowGlossary(false)}
								className="palette-action-button rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all active:scale-95"
							>
								Got it!
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b border-slate-200/70 bg-linear-to-b from-teal-50/60 via-white to-slate-50 px-4 py-12 sm:px-6 lg:py-16 dark:border-slate-800 dark:from-teal-950/20 dark:via-slate-950 dark:to-slate-950">
				<div className="absolute inset-x-0 -top-40 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
					<div className="aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-teal-400 to-[#17756D] opacity-20 dark:opacity-10" />
				</div>

				<div className="mx-auto max-w-4xl text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-3.5 py-1 text-xs font-medium text-teal-800 shadow-xs dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300">
						<span className="flex size-2 rounded-full bg-teal-500 animate-pulse" />
						Self-Hosting Made Simple • Beginner Friendly
					</div>

					<h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-950 dark:text-white">
						How to Deploy{" "}
						<span className="bg-linear-to-r from-[#0c2340] via-teal-600 to-[#17756D] bg-clip-text text-transparent dark:from-teal-200 dark:via-teal-400 dark:to-cyan-400">
							KyoHub
						</span>{" "}
						on Your Own
					</h1>

					<p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
						No technical background required! Follow this friendly, step-by-step tutorial to get your private family hub up and running in under 15 minutes for free.
					</p>

					{/* Prerequisites Pills */}
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400" /> Free Prisma Cloud Account
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400" /> Free Vercel Account
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400" /> Windows, Mac, or Linux Computer
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400" /> ~15 Minutes of Time
						</div>
					</div>

					{/* Interactive Progress Bar */}
					<div className="mx-auto mt-8 max-w-xl rounded-2xl border border-teal-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-center justify-between text-xs font-semibold">
							<span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
								<Compass className="size-3.5 text-teal-600 dark:text-teal-400" /> Your Deployment Progress
							</span>
							<span className="rounded-full bg-teal-50 px-2 py-0.5 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
								{completedCount} of {totalStepsCount} steps ({progressPercent}%)
							</span>
						</div>
						<div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
							<div
								className="h-full bg-linear-to-r from-teal-500 to-[#17756D] transition-all duration-300 ease-out"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
						{progressPercent === 100 && (
							<p className="mt-2 text-center text-xs font-medium text-teal-700 dark:text-teal-300">
								🎉 You&apos;re completely ready! Your KyoHub is live and ready for family use!
							</p>
						)}
					</div>
				</div>
			</section>

			{/* Navigation Tabs & Filter Bar */}
			<section className="sticky top-[57px] z-30 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
				<div className="mx-auto flex max-w-4xl items-center justify-between gap-2 overflow-x-auto">
					{/* Sleek Segmented Control for Phase Tabs */}
					<div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80">
						<button
							type="button"
							onClick={() => setActiveTab("all")}
							className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "all"
								? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
								: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
								}`}
						>
							All Steps ({totalStepsCount})
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("database")}
							className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "database"
								? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
								: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
								}`}
						>
							<Database className="size-3.5" />
							<span>1. Database Setup</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("project")}
							className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "project"
								? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
								: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
								}`}
						>
							<Terminal className="size-3.5" />
							<span>2. Project Setup</span>
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("vercel")}
							className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "vercel"
								? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
								: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
								}`}
						>
							<Server className="size-3.5" />
							<span>3. Vercel Deploy</span>
						</button>
					</div>

					{/* .env Helper Button */}
					<button
						type="button"
						onClick={() => setEnvBuilderOpen(!envBuilderOpen)}
						className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 ${envBuilderOpen
							? "border-teal-300 bg-teal-100/90 text-teal-900 dark:border-teal-700 dark:bg-teal-950/80 dark:text-teal-200"
							: "border-slate-200/90 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
							}`}
					>
						<FileText className={`size-3.5 ${envBuilderOpen ? "text-teal-700 dark:text-teal-300" : "text-teal-600 dark:text-teal-400"}`} />
						<span>{envBuilderOpen ? "Hide .env Helper" : ".env Helper"}</span>
					</button>
				</div>
			</section>

			{/* Interactive .env Config Helper (Collapsible) */}
			{envBuilderOpen && (
				<section className="border-b border-teal-100 bg-linear-to-b from-teal-50/50 to-white px-4 py-6 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950">
					<div className="mx-auto max-w-4xl">
						<div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
								<div>
									<div className="flex items-center gap-2">
										<span className="rounded-lg bg-teal-100 p-1 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
											<Key className="size-4" />
										</span>
										<h2 className="text-base font-bold text-slate-900 dark:text-white">
											Interactive .env & .env.local Generator
										</h2>
									</div>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										Fill in your custom details below to generate a ready-to-paste configuration for both your <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-teal-700 dark:bg-slate-800 dark:text-teal-300">.env</code> and <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-teal-700 dark:bg-slate-800 dark:text-teal-300">.env.local</code> files.
									</p>
								</div>

								<button
									type="button"
									onClick={() => copyToClipboard(fullEnvTemplate, "full-env")}
									className="palette-action-button inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95"
								>
									{copiedKey === "full-env" ? (
										<>
											<Check className="size-3.5" />
											<span>Copied to Clipboard!</span>
										</>
									) : (
										<>
											<Copy className="size-3.5" />
											<span>Copy Full .env Template</span>
										</>
									)}
								</button>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
								<div>
									<label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
										Prisma DATABASE_URL
									</label>
									<input
										type="text"
										value={envValues.databaseUrl}
										onChange={(e) => setEnvValues({ ...envValues, databaseUrl: e.target.value })}
										placeholder="postgresql://..."
										className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
									/>
								</div>

								<div>
									<label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
										Notification Email (VAPID_SUBJECT)
									</label>
									<input
										type="email"
										value={envValues.email}
										onChange={(e) => setEnvValues({ ...envValues, email: e.target.value })}
										placeholder="your-email@example.com"
										className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
									/>
								</div>

								<div>
									<label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
										6-Digit PINs (Comma separated)
									</label>
									<input
										type="text"
										value={envValues.pins}
										onChange={(e) => setEnvValues({ ...envValues, pins: e.target.value })}
										placeholder="123456,654321"
										className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
									/>
								</div>

								<div>
									<label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
										User Mapping (PIN:Name)
									</label>
									<input
										type="text"
										value={envValues.users}
										onChange={(e) => setEnvValues({ ...envValues, users: e.target.value })}
										placeholder="123456:Alex,654321:Partner"
										className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
									/>
								</div>
							</div>

							<div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-slate-200 dark:border-slate-800">
								<div className="flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400 border-b border-slate-800">
									<span>Preview (.env & .env.local)</span>
									<span className="text-teal-400">100% synchronized</span>
								</div>
								<pre className="mt-2.5 max-h-48 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 selection:bg-teal-600">
									{fullEnvTemplate}
								</pre>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Main Step Flow Content */}
			<main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
				<div className="space-y-12">
					{phases
						.filter((phase) => activeTab === "all" || activeTab === phase.id)
						.map((phase) => {
							const PhaseIcon = phase.icon;
							return (
								<section key={phase.id} className="scroll-mt-24" id={phase.id}>
									{/* Phase Header */}
									<div className={`rounded-2xl border p-5 sm:p-6 bg-linear-to-r ${phase.accentBg} ${phase.accentBorder} shadow-xs`}>
										<div className="flex items-center gap-3">
											<div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-slate-900">
												<PhaseIcon className={`size-6 ${phase.color}`} />
											</div>
											<div>
												<div className="flex items-center gap-2">
													<span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-300">
														{phase.badge}
													</span>
													<h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
														{phase.title}
													</h2>
												</div>
												<p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
													{phase.subtitle}
												</p>
											</div>
										</div>
									</div>

									{/* Step Cards List */}
									<div className="mt-4 space-y-3.5">
										{phase.steps.map((step) => {
											const isDone = !!completedSteps[step.id];
											return (
												<div
													key={step.id}
													id={`step-card-${step.id}`}
													className={`group relative scroll-mt-28 rounded-xl border transition-all duration-300 ${isDone
														? "border-teal-300/80 bg-teal-50/20 dark:border-teal-900/40 dark:bg-teal-950/10"
														: step.highlight
															? "border-teal-300 bg-white shadow-xs dark:border-teal-800/80 dark:bg-slate-900"
															: "border-slate-200 bg-white shadow-2xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
														} p-4 sm:p-5`}
												>
													<div className="flex items-start justify-between gap-3">
														<div className="flex items-start gap-3 sm:gap-4 flex-1">
															{/* Checkbox / Step Number Button */}
															<button
																type="button"
																onClick={() => completeAndNext(step.id)}
																className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all ${isDone
																	? "border-teal-600 bg-teal-600 text-white shadow-xs shadow-teal-600/20"
																	: "border-slate-300 bg-slate-50 text-slate-700 hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
																	}`}
																title={isDone ? "Mark as incomplete" : "Mark as done & scroll to next"}
															>
																{isDone ? <Check className="size-4 stroke-[3]" /> : step.number}
															</button>

															<div className="space-y-1.5 flex-1">
																<div className="flex flex-wrap items-center gap-2">
																	<h3
																		className={`text-sm sm:text-base font-bold ${isDone
																			? "line-through text-slate-400 dark:text-slate-500"
																			: "text-slate-900 dark:text-white"
																			}`}
																	>
																		{step.title}
																	</h3>
																	{step.highlight && (
																		<span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
																			Key Step
																		</span>
																	)}
																</div>

																<p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
																	{step.description}
																</p>

																{/* Substeps if present */}
																{step.substeps && (
																	<ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
																		{step.substeps.map((sub, idx) => (
																			<li key={idx} className="flex items-start gap-1.5">
																				<ChevronRight className="size-3.5 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
																				<span>{sub}</span>
																			</li>
																		))}
																	</ul>
																)}

																{/* Step 15 specific callout pointing to the All Vercel Environment Variable Commands card */}
																{step.id === "ver-15" && (
																	<div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-teal-300 bg-teal-50/90 p-3.5 text-xs text-teal-950 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">
																		<div className="flex items-start gap-2.5">
																			<Info className="size-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
																			<div className="leading-relaxed">
																				<p className="font-semibold text-teal-900 dark:text-teal-100">
																					Where to find the commands:
																				</p>
																				<p className="mt-0.5 text-teal-800 dark:text-teal-300">
																					All 9 terminal commands can be found on the <strong>&ldquo;All Vercel Environment Variable Commands&rdquo;</strong> card below.
																				</p>
																			</div>
																		</div>

																		<button
																			type="button"
																			onClick={() => {
																				const el = document.getElementById("all-vercel-env-commands");
																				if (el) {
																					el.scrollIntoView({ behavior: "smooth", block: "center" });
																					el.classList.add("ring-2", "ring-teal-500", "ring-offset-2");
																					setTimeout(() => el.classList.remove("ring-2", "ring-teal-500", "ring-offset-2"), 1500);
																				}
																			}}
																			className="palette-action-button shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
																		>
																			<span>View Commands Card</span>
																			<ArrowRight className="size-3.5" />
																		</button>
																	</div>
																)}

																{/* Single Command Box */}
																{step.command && (
																	<div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-100">
																		<div className="flex items-center gap-2 overflow-x-auto pr-2">
																			<span className="text-teal-400 select-none">$</span>
																			<span className="selection:bg-teal-700">{step.command}</span>
																		</div>
																		<button
																			type="button"
																			onClick={() => copyToClipboard(step.command!, step.id)}
																			className="shrink-0 flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-sans font-medium text-slate-200 transition-colors hover:bg-slate-700 active:scale-95"
																			title="Copy command"
																		>
																			{copiedKey === step.id ? (
																				<>
																					<Check className="size-3 text-teal-400" />
																					<span className="text-teal-400">Copied</span>
																				</>
																			) : (
																				<>
																					<Copy className="size-3" />
																					<span>Copy</span>
																				</>
																			)}
																		</button>
																	</div>
																)}

																{/* Code snippet block */}
																{step.code && (
																	<div className="mt-3 relative rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
																		<div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-sans text-slate-400">
																			<span>Configuration Snippet</span>
																			<button
																				type="button"
																				onClick={() => copyToClipboard(step.code!, `${step.id}-code`)}
																				className="flex items-center gap-1 text-teal-700 hover:text-teal-800 dark:text-teal-400"
																			>
																				{copiedKey === `${step.id}-code` ? (
																					<>
																						<Check className="size-3 text-teal-600 dark:text-teal-400" />
																						<span>Copied!</span>
																					</>
																				) : (
																					<>
																						<Copy className="size-3" />
																						<span>Copy code</span>
																					</>
																				)}
																			</button>
																		</div>
																		<pre className="overflow-x-auto leading-relaxed">{step.code}</pre>
																	</div>
																)}

																{/* Tip callout */}
																{step.tip && (
																	<div className="mt-2.5 flex items-start gap-2 rounded-lg bg-teal-500/10 p-2.5 text-xs text-teal-900 dark:bg-teal-950/20 dark:text-teal-200">
																		<Info className="size-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
																		<span>{step.tip}</span>
																	</div>
																)}

																{/* Step 16 specific callout: 404 error troubleshooting */}
																{step.id === "ver-16" && (
																	<div className="mt-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
																		<div className="flex items-start gap-3">
																			<div className="rounded-xl bg-amber-100 p-1.5 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
																				<AlertTriangle className="size-4.5" />
																			</div>
																			<div className="w-full space-y-2 leading-relaxed">
																				<div>
																					<p className="font-bold text-amber-900 dark:text-amber-100 text-xs sm:text-sm">
																						Encountering a 404 error on your Vercel &ldquo;Aliased&rdquo; URL?
																					</p>
																					<p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
																						If your live link returns a 404 Not Found error, Vercel needs to be set to the Next.js framework preset. Follow these quick steps to fix it:
																					</p>
																				</div>

																				<div className="grid gap-1.5 pt-1">
																					<div className="flex items-start gap-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/30">
																						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
																							1
																						</span>
																						<span className="text-amber-950 dark:text-amber-200">
																							Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 dark:hover:text-white">vercel.com</a> and select your project.
																						</span>
																					</div>

																					<div className="flex items-start gap-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/30">
																						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
																							2
																						</span>
																						<span className="text-amber-950 dark:text-amber-200">
																							In the left navigation tab, click <strong>Settings</strong>.
																						</span>
																					</div>

																					<div className="flex items-start gap-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/30">
																						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
																							3
																						</span>
																						<span className="text-amber-950 dark:text-amber-200">
																							In the left sidebar menu, select <strong>Build and Deployment</strong>.
																						</span>
																					</div>

																					<div className="flex items-start gap-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/30">
																						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
																							4
																						</span>
																						<span className="text-amber-950 dark:text-amber-200">
																							Under <strong>Framework Settings</strong>, change the framework preset to <strong>&ldquo;Next.js&rdquo;</strong>.
																						</span>
																					</div>

																					<div className="flex items-start gap-2 rounded-lg bg-amber-100/50 p-2 dark:bg-amber-900/30">
																						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
																							5
																						</span>
																						<span className="text-amber-950 dark:text-amber-200">
																							Click <strong>Save</strong>, then redeploy by running <code className="rounded bg-amber-200/80 px-1.5 py-0.5 font-mono text-[11px] text-amber-950 dark:bg-amber-900 dark:text-amber-100">vercel --prod</code> again in your terminal redeploy in vercel app.
																						</span>
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																)}

																{/* Step Card Bottom Action Bar */}
																<div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800/80">
																	<div className="flex items-center gap-2">
																		{step.actionUrl && (
																			<a
																				href={step.actionUrl}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="palette-action-button inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
																			>
																				<span>{step.actionLabel || "Open website"}</span>
																				<ExternalLink className="size-3" />
																			</a>
																		)}
																	</div>

																	<button
																		type="button"
																		onClick={() => completeAndNext(step.id)}
																		className="palette-action-button inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
																	>
																		{isDone ? (
																			<>
																				<Check className="size-3.5 stroke-[2.5]" />
																				<span>Completed</span>
																			</>
																		) : (
																			<>
																				<span>Complete Step</span>
																				<ArrowRight className="size-3.5" />
																			</>
																		)}
																	</button>
																</div>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>

									{/* Dedicated Phase 3 Vercel Environment Variables Box */}
									{phase.id === "vercel" && (
										<div
											id="all-vercel-env-commands"
											className="mt-6 scroll-mt-28 rounded-2xl border border-teal-200/80 bg-linear-to-b from-teal-50/50 to-white p-5 sm:p-6 shadow-sm dark:border-teal-950/60 dark:from-teal-950/20 dark:to-slate-900"
										>
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3 dark:border-teal-950">
												<div>
													<div className="flex items-center gap-2">
														<span className="rounded-lg bg-teal-100 p-1 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
															<Server className="size-4" />
														</span>
														<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
															All Vercel Environment Variable Commands
														</h3>
													</div>
													<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
														Run each of these in your terminal. You will be prompted to paste your corresponding value from <code className="font-mono text-teal-700 dark:text-teal-300">.env</code>:
													</p>
												</div>

												<button
													type="button"
													onClick={() => copyToClipboard(envCommands.join("\n"), "all-vercel-env")}
													className="palette-action-button inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
												>
													{copiedKey === "all-vercel-env" ? (
														<>
															<Check className="size-3.5" />
															<span>All 9 Commands Copied!</span>
														</>
													) : (
														<>
															<Copy className="size-3.5" />
															<span>Copy All 9 Commands</span>
														</>
													)}
												</button>
											</div>

											<div className="mt-3.5 space-y-1.5">
												{envCommands.map((cmd, idx) => (
													<div
														key={idx}
														className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-xs font-mono dark:border-slate-800 dark:bg-slate-950"
													>
														<div className="flex items-center gap-2 overflow-x-auto text-slate-800 dark:text-slate-200">
															<span className="text-teal-600 dark:text-teal-400 font-bold select-none">{idx + 1}.</span>
															<span>{cmd}</span>
														</div>
														<button
															type="button"
															onClick={() => copyToClipboard(cmd, `vcmd-${idx}`)}
															className="shrink-0 ml-2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
															title="Copy command"
														>
															{copiedKey === `vcmd-${idx}` ? (
																<Check className="size-3.5 text-teal-600 dark:text-teal-400" />
															) : (
																<Copy className="size-3.5" />
															)}
														</button>
													</div>
												))}
											</div>

											{/* Easy GUI Alternative Callout */}
											<div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200">
												<p className="font-semibold flex items-center gap-1.5">
													<Sparkles className="size-3.5 text-teal-700 dark:text-teal-400" /> Prefer clicking on a website instead of terminal?
												</p>
												<p className="mt-1 leading-relaxed text-teal-800/90 dark:text-teal-300">
													You can do this directly on the web: Visit <strong>vercel.com</strong> &gt; Log in &gt; Click your project &gt; Click <strong>Settings</strong> (top tab) &gt; Click <strong>Environment Variables</strong> (left sidebar) &gt; Paste each variable name and value!
												</p>
											</div>
										</div>
									)}
								</section>
							);
						})}
				</div>

				{/* 404 Troubleshooting Callout at the very bottom after Step 16 */}
				<div className="mt-8 rounded-2xl border border-amber-300/80 bg-linear-to-b from-amber-50/90 to-white p-5 sm:p-6 text-xs text-amber-950 shadow-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:to-slate-900 dark:text-amber-200">
					<div className="flex items-start gap-3">
						<div className="rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
							<AlertTriangle className="size-5" />
						</div>
						<div className="w-full space-y-2.5 leading-relaxed">
							<div>
								<h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
									Troubleshooting: Encountering a 404 error on your Vercel &ldquo;Aliased&rdquo; URL?
								</h3>
								<p className="mt-0.5 text-amber-900/90 dark:text-amber-300/90">
									If your live URL opens to a 404 Not Found page, Vercel needs to be configured with the Next.js framework preset:
								</p>
							</div>

							<div className="grid gap-2 pt-1 sm:grid-cols-2">
								<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
										1
									</span>
									<span className="text-amber-950 dark:text-amber-200">
										Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 dark:hover:text-white">vercel.com</a> and select your project.
									</span>
								</div>

								<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
										2
									</span>
									<span className="text-amber-950 dark:text-amber-200">
										In the left navigation tab, click <strong>Settings</strong>.
									</span>
								</div>

								<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
										3
									</span>
									<span className="text-amber-950 dark:text-amber-200">
										In the left sidebar menu, click <strong>Build and Deployment</strong>.
									</span>
								</div>

								<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
										4
									</span>
									<span className="text-amber-950 dark:text-amber-200">
										Under <strong>Framework Settings</strong>, change the preset to <strong>&ldquo;Next.js&rdquo;</strong>.
									</span>
								</div>

								<div className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
										5
									</span>
									<span className="text-amber-950 dark:text-amber-200">
										Click <strong>Save</strong>, then redeploy by running <code className="rounded bg-amber-200/80 px-1.5 py-0.5 font-mono text-[11px] text-amber-950 dark:bg-amber-900 dark:text-amber-100">vercel --prod</code> again in your terminal or redeploy in vercel app.
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Success Banner / Summary */}
				<div
					id="deployment-success-banner"
					className="mt-14 scroll-mt-28 rounded-3xl border border-teal-700/30 bg-linear-to-br from-[#0c2340] via-[#17756D] to-[#0E5E57] p-8 text-center text-white shadow-xl shadow-teal-950/20"
				>
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
						<Sparkles className="size-7 text-teal-200" />
					</div>
					<h2 className="mt-4 text-2xl font-bold tracking-tight">Congratulations on Your Deployment!</h2>
					<p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-teal-100">
						You now have a fully private, autonomous household hub for grocery lists, baby appointments, household passwords, and family budgets.
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
						<Link
							href="/"
							className="palette-action-button inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
						>
							<span>Launch KyoHub</span>
							<ArrowRight className="size-4" />
						</Link>
						<a
							href="https://github.com/kyooowe/kyohub"
							target="_blank"
							rel="noopener noreferrer"
							className="palette-action-button inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
						>
							<span>Star on GitHub</span>
							<ExternalLink className="size-3.5" />
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}
