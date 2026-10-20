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
	Code2,
	type LucideIcon,
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
	icon: LucideIcon;
	color: string;
	accentBg: string;
	accentBorder: string;
	steps: StepItem[];
}

export function DeployTutorialClient() {
	const [activeTab, setActiveTab] = useState<"all" | "database" | "project" | "vercel" | "developer">("all");
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

	const devEnvVariables = [
		{
			key: "DATABASE_URL",
			purpose: "PostgreSQL connection string.",
			how: "From Prisma Cloud, Supabase, Neon, or local Postgres.",
			example: "postgresql://user:password@localhost:5432/mydb",
			isCommand: false,
		},
		{
			key: "AUTH_PINS",
			purpose: "Comma-separated 6-digit PINs allowed to sign in.",
			how: "Choose any 6-digit PINs (e.g. 123456,654321).",
			example: "123456,654321",
			isCommand: false,
		},
		{
			key: "AUTH_USERS",
			purpose: "Comma-separated PIN:Name pairs mapping allowed PINs to profile names.",
			how: "Pair each allowed PIN to a user profile name.",
			example: "123456:Alex,654321:Sam",
			isCommand: false,
		},
		{
			key: "AUTH_SECRET",
			purpose: "Cryptographic secret used to HMAC-sign session cookies.",
			how: "openssl rand -hex 32",
			example: "openssl rand -hex 32",
			isCommand: true,
		},
		{
			key: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
			purpose: "Public Web Push key accessible to the client browser.",
			how: "npx web-push generate-vapid-keys",
			example: "npx web-push generate-vapid-keys",
			isCommand: true,
		},
		{
			key: "VAPID_PUBLIC_KEY",
			purpose: "Server-side Web Push public key (must match NEXT_PUBLIC_VAPID_PUBLIC_KEY).",
			how: "npx web-push generate-vapid-keys",
			example: "npx web-push generate-vapid-keys",
			isCommand: true,
		},
		{
			key: "VAPID_PRIVATE_KEY",
			purpose: "Server-side Web Push private key for signing notification payloads.",
			how: "npx web-push generate-vapid-keys",
			example: "npx web-push generate-vapid-keys",
			isCommand: true,
		},
		{
			key: "VAPID_SUBJECT",
			purpose: "Contact email or URL required by web-push notification services.",
			how: "mailto:your-email@example.com",
			example: "mailto:admin@example.com",
			isCommand: false,
		},
		{
			key: "CRON_SECRET",
			purpose: "Secret token used to authorize the scheduled reminder API endpoint.",
			how: "openssl rand -hex 32",
			example: "openssl rand -hex 32",
			isCommand: true,
		},
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
			className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden"
		>
			{/* Top Navbar */}
			<header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
					<div className="flex items-center gap-2.5 sm:gap-3">
						<Link href="/" className="group flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90">
							<KyoHubBrandLogo className="size-7 sm:size-8 drop-shadow-xs transition-transform group-hover:scale-105" />
							<span className="text-lg sm:text-xl font-bold tracking-tight">
								<span className="text-[#0c2340] dark:text-white">Kyo</span>
								<span className="text-[#17756D] dark:text-teal-400">hub</span>
							</span>
						</Link>

						<span className="hidden items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 sm:inline-flex dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
							<Sparkles className="size-3 text-teal-600 dark:text-teal-400" /> Deployment Tutorial
						</span>
					</div>

					<div className="flex items-center gap-1.5 sm:gap-3">
						<button
							type="button"
							onClick={() => setShowGlossary(!showGlossary)}
							className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/80 px-2.5 sm:px-3 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
							title="Non-techy explanations"
							aria-label="Beginner Glossary"
						>
							<HelpCircle className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
							<span className="hidden xs:inline sm:inline">Glossary</span>
							<span className="hidden md:inline">&nbsp;Dictionary</span>
						</button>

						<ThemeToggle className="size-[34px]" />
					</div>
				</div>
			</header>

			{/* Beginner Glossary Modal / Drawer */}
			{showGlossary && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
					<div className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
						<div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
							<div className="flex items-center gap-2">
								<div className="rounded-lg bg-teal-50 p-1.5 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
									<HelpCircle className="size-5" />
								</div>
								<div>
									<h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Non-Techy Dictionary</h2>
									<p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Simple everyday analogies for tech terms</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowGlossary(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
								aria-label="Close glossary"
							>
								✕
							</button>
						</div>

						<div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
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
								className="palette-action-button w-full sm:w-auto justify-center rounded-lg border px-4 py-2 sm:py-1.5 text-xs font-semibold transition-all active:scale-95"
							>
								Got it!
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Hero Section */}
			<section className="relative overflow-hidden border-b border-slate-200/70 bg-linear-to-b from-teal-50/60 via-white to-slate-50 px-3.5 py-8 sm:px-6 sm:py-12 lg:py-16 dark:border-slate-800 dark:from-teal-950/20 dark:via-slate-950 dark:to-slate-950">
				<div className="absolute inset-x-0 -top-40 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
					<div className="aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-teal-400 to-[#17756D] opacity-20 dark:opacity-10" />
				</div>

				<div className="mx-auto max-w-4xl text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-3 py-1 text-[11px] sm:text-xs font-medium text-teal-800 shadow-xs dark:border-teal-900/60 dark:bg-teal-950/50 dark:text-teal-300">
						<span className="flex size-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
						<span>Self-Hosting Made Simple • Beginner Friendly</span>
					</div>

					<h1 className="mt-3.5 text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-950 dark:text-white break-words">
						How to Deploy{" "}
						<span className="bg-linear-to-r from-[#0c2340] via-teal-600 to-[#17756D] bg-clip-text text-transparent dark:from-teal-200 dark:via-teal-400 dark:to-cyan-400">
							KyoHub
						</span>{" "}
						on Your Own
					</h1>

					<p className="mx-auto mt-3 max-w-2xl text-xs sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
						No technical background required! Follow this friendly, step-by-step tutorial to get your private family hub up and running in under 15 minutes for free.
					</p>

					{/* Prerequisites Pills */}
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> Free Prisma Cloud Account
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> Free Vercel Account
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> Windows, Mac, or Linux
						</div>
						<div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
							<CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> ~15 Minutes of Time
						</div>
					</div>

					{/* Interactive Progress Bar */}
					<div className="mx-auto mt-6 sm:mt-8 max-w-xl rounded-2xl border border-teal-100 bg-white p-3.5 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-center justify-between text-xs font-semibold gap-2">
							<span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 truncate">
								<Compass className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> Your Deployment Progress
							</span>
							<span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] sm:text-xs text-teal-800 dark:bg-teal-950 dark:text-teal-300">
								{completedCount} of {totalStepsCount} ({progressPercent}%)
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
			<section className="sticky top-[53px] sm:top-[57px] z-30 border-b border-slate-200 bg-white/95 px-3 sm:px-4 py-2 sm:py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
				<div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
					{/* Sleek Segmented Control for Phase Tabs - Smoothly scrollable on mobile */}
					<div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 shrink min-w-0">
						<div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80 whitespace-nowrap">
							<button
								type="button"
								onClick={() => setActiveTab("all")}
								className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "all"
									? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
									}`}
							>
								All ({totalStepsCount})
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("database")}
								className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "database"
									? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
									}`}
							>
								<Database className="size-3.5" />
								<span className="sm:hidden">1. Database</span>
								<span className="hidden sm:inline">1. Database Setup</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("project")}
								className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "project"
									? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
									}`}
							>
								<Terminal className="size-3.5" />
								<span className="sm:hidden">2. Project</span>
								<span className="hidden sm:inline">2. Project Setup</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("vercel")}
								className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "vercel"
									? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
									}`}
							>
								<Server className="size-3.5" />
								<span className="sm:hidden">3. Vercel</span>
								<span className="hidden sm:inline">3. Vercel Deploy</span>
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("developer")}
								className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === "developer"
									? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
									}`}
							>
								<Code2 className="size-3.5 text-teal-600 dark:text-teal-400" />
								<span className="sm:hidden">CLI</span>
								<span className="hidden sm:inline">⚡ Developer / CLI</span>
							</button>
						</div>
					</div>

					{/* .env Helper Button - Always visible on right */}
					<button
						type="button"
						onClick={() => setEnvBuilderOpen(!envBuilderOpen)}
						className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 ${envBuilderOpen
							? "border-teal-300 bg-teal-100/90 text-teal-900 dark:border-teal-700 dark:bg-teal-950/80 dark:text-teal-200"
							: "border-slate-200/90 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
							}`}
					>
						<FileText className={`size-3.5 ${envBuilderOpen ? "text-teal-700 dark:text-teal-300" : "text-teal-600 dark:text-teal-400"}`} />
						<span className="hidden xs:inline sm:inline">{envBuilderOpen ? "Hide .env" : ".env Helper"}</span>
						<span className="xs:hidden sm:hidden">{envBuilderOpen ? "Hide" : ".env"}</span>
					</button>
				</div>
			</section>

			{/* Interactive .env Config Helper (Collapsible) */}
			{envBuilderOpen && (
				<section className="border-b border-teal-100 bg-linear-to-b from-teal-50/50 to-white px-3 sm:px-4 py-4 sm:py-6 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950">
					<div className="mx-auto max-w-4xl">
						<div className="rounded-2xl border border-teal-200 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
								<div>
									<div className="flex items-center gap-2">
										<span className="rounded-lg bg-teal-100 p-1 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
											<Key className="size-4" />
										</span>
										<h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
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
									className="palette-action-button w-full sm:w-auto justify-center inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95"
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

							<div className="mt-4 rounded-xl border border-slate-200 bg-slate-900 p-3 sm:p-3.5 text-slate-200 dark:border-slate-800 min-w-0">
								<div className="flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400 border-b border-slate-800">
									<span>Preview (.env & .env.local)</span>
									<span className="text-teal-400">100% synchronized</span>
								</div>
								<pre className="mt-2.5 max-h-48 overflow-x-auto text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300 selection:bg-teal-600">
									{fullEnvTemplate}
								</pre>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Main Step Flow Content */}
			<main className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-10">
				{activeTab === "developer" ? (
					<div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
						{/* Developer Quickstart Banner */}
						<div className="rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-[#0c1f2d] to-slate-900 p-4 sm:p-7 text-white shadow-xl dark:border-slate-800">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="flex items-start gap-3 sm:gap-3.5">
									<div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/30">
										<Terminal className="size-5 sm:size-6" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
											<span className="rounded-full bg-teal-500/20 px-2 sm:px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/30">
												Terminal Quickstart
											</span>
											<span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
												CLI &amp; VPS Guide
											</span>
										</div>
										<h2 className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-white">
											Developer &amp; CLI Quickstart
										</h2>
										<p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
											Condensed setup commands, environment variables specification, and production deployment scripts for engineers.
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={() => setActiveTab("all")}
									className="w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
								>
									← Beginner Guide
								</button>
							</div>

							<div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-white/10 pt-3.5 sm:pt-4 text-[10px] sm:text-[11px] text-slate-300">
								<span className="font-semibold text-teal-400">Tech Stack:</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">Next.js 16 (Turbopack)</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">React 19</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">TypeScript</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">Prisma ORM 8</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">PostgreSQL 15+</span>
								<span className="rounded-md bg-white/5 px-2 py-0.5">Tailwind CSS 4</span>
							</div>
						</div>

						{/* 1. Requirements & Local Quick Setup */}
						<div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
								<div>
									<div className="flex items-center gap-2">
										<span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs font-bold shrink-0">1</span>
										<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
											Local Setup (60 seconds)
										</h3>
									</div>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										Requires Node.js 18.18+, npm, and PostgreSQL 15+ (local or cloud like Prisma Postgres, Supabase, Neon).
									</p>
								</div>

								<button
									type="button"
									onClick={() =>
										copyToClipboard(
											`git clone https://github.com/kyooowe/kyohub.git\ncd kyohub\nnpm install\ncp .env.example .env\ncp .env.example .env.local\nnpx prisma db init\nnpm run dev`,
											"dev-quickstart-cmds"
										)
									}
									className="palette-action-button w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
								>
									{copiedKey === "dev-quickstart-cmds" ? (
										<>
											<Check className="size-3.5 text-teal-600 dark:text-teal-400" />
											<span>Copied Snippet!</span>
										</>
									) : (
										<>
											<Copy className="size-3.5" />
											<span>Copy All Setup Commands</span>
										</>
									)}
								</button>
							</div>

							<div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-100 overflow-x-auto min-w-0 leading-relaxed">
								<p className="text-slate-500"># 1. Clone repository &amp; install dependencies</p>
								<p><span className="text-teal-400 select-none">$ </span>git clone https://github.com/kyooowe/kyohub.git</p>
								<p><span className="text-teal-400 select-none">$ </span>cd kyohub</p>
								<p><span className="text-teal-400 select-none">$ </span>npm install</p>
								<p className="mt-3 text-slate-500"># 2. Copy environment templates (.env and .env.local must be synchronized)</p>
								<p><span className="text-teal-400 select-none">$ </span>cp .env.example .env</p>
								<p><span className="text-teal-400 select-none">$ </span>cp .env.example .env.local</p>
								<p className="mt-3 text-slate-500"># 3. Create tables in your PostgreSQL database</p>
								<p><span className="text-teal-400 select-none">$ </span>npx prisma db init</p>
								<p className="mt-3 text-slate-500"># 4. Start Next.js development server</p>
								<p><span className="text-teal-400 select-none">$ </span>npm run dev</p>
							</div>

							<p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
								Open <strong className="text-slate-900 dark:text-white">http://localhost:3000</strong> to run KyoHub. <code className="font-mono text-teal-700 dark:text-teal-300">npx prisma db init</code> applies the schema and creates all tables in the database pointed to by your <code className="font-mono text-teal-700 dark:text-teal-300">DATABASE_URL</code>.
							</p>
						</div>

						{/* 2. Environment Variables Specification */}
						<div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
								<div>
									<div className="flex items-center gap-2">
										<span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs font-bold shrink-0">2</span>
										<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
											Environment Variables Reference
										</h3>
									</div>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										Required keys for <code className="font-mono text-teal-700 dark:text-teal-300">.env</code> and <code className="font-mono text-teal-700 dark:text-teal-300">.env.local</code>.
									</p>
								</div>

								<button
									type="button"
									onClick={() => setEnvBuilderOpen(true)}
									className="palette-action-button w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
								>
									<FileText className="size-3.5" />
									<span>Open Interactive .env Builder</span>
								</button>
							</div>

							{/* Mobile swipe helper */}
							<div className="mt-3 sm:hidden text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between px-0.5">
								<span>← Swipe table horizontally to view full details →</span>
							</div>

							<div className="mt-2 sm:mt-4 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 min-w-0">
								<table className="w-full min-w-[560px] sm:min-w-full text-left text-xs">
									<thead className="bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
										<tr>
											<th className="py-2.5 px-3.5">Variable</th>
											<th className="py-2.5 px-3.5">Purpose</th>
											<th className="py-2.5 px-3.5">How to Generate / Format</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
										{devEnvVariables.map((item) => (
											<tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
												<td className="py-2.5 px-3.5 font-mono font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap">
													{item.key}
												</td>
												<td className="py-2.5 px-3.5">
													{item.purpose}
												</td>
												<td className="py-2.5 px-3.5">
													{item.isCommand ? (
														<div className="flex items-center gap-2">
															<code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-900 dark:text-slate-200">
																{item.how}
															</code>
															<button
																type="button"
																onClick={() => copyToClipboard(item.how, `dev-gen-${item.key}`)}
																className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
																title="Copy generation command"
															>
																{copiedKey === `dev-gen-${item.key}` ? (
																	<Check className="size-3 text-teal-600 dark:text-teal-400" />
																) : (
																	<Copy className="size-3" />
																)}
															</button>
														</div>
													) : (
														<span className="text-slate-500 dark:text-slate-400">{item.how}</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* 3. Cloud Deployment (Vercel CLI) */}
						<div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
								<span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs font-bold shrink-0">3</span>
								<div>
									<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
										Cloud Deployment (Vercel CLI)
									</h3>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										Free global hosting on Vercel with automatic HTTPS.
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-3">
								<div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-100 overflow-x-auto min-w-0 leading-relaxed">
									<p className="text-slate-500"># Install Vercel CLI &amp; authenticate</p>
									<p><span className="text-teal-400 select-none">$ </span>npm install -g vercel</p>
									<p><span className="text-teal-400 select-none">$ </span>vercel login</p>
									<p className="mt-3 text-slate-500"># Run initial deployment (select smart defaults)</p>
									<p><span className="text-teal-400 select-none">$ </span>vercel --prod</p>
								</div>

								<div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 sm:p-3.5 text-xs text-teal-950 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200">
									<p className="font-semibold flex items-center gap-1.5">
										<Sparkles className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" /> Vercel Framework Preset Note
									</p>
									<p className="mt-1 text-teal-800 dark:text-teal-300 leading-relaxed">
										If your deployed live URL shows a 404 error, navigate to <strong>vercel.com</strong> &gt; your project &gt; <strong>Settings</strong> &gt; <strong>Build and Deployment</strong> &gt; set <strong>Framework Preset</strong> to <strong>&ldquo;Next.js&rdquo;</strong>, then redeploy.
									</p>
								</div>
							</div>
						</div>

						{/* 4. Self-Hosted VPS / Docker / PM2 Production Server */}
						<div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
								<span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs font-bold shrink-0">4</span>
								<div>
									<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
										Self-Hosted Production Server (VPS / PM2)
									</h3>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										Run on Ubuntu, Debian, Alpine, or any Linux VPS.
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-3">
								<div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-100 overflow-x-auto min-w-0 leading-relaxed">
									<p className="text-slate-500"># Build production Next.js bundle &amp; start</p>
									<p><span className="text-teal-400 select-none">$ </span>npm run build</p>
									<p><span className="text-teal-400 select-none">$ </span>npm run start</p>
									<p className="mt-3 text-slate-500"># Or run continuously in background via PM2</p>
									<p><span className="text-teal-400 select-none">$ </span>npm install -g pm2</p>
									<p><span className="text-teal-400 select-none">$ </span>pm2 start npm --name &quot;kyohub&quot; -- run start</p>
									<p><span className="text-teal-400 select-none">$ </span>pm2 save &amp;&amp; pm2 startup</p>
								</div>
							</div>
						</div>

						{/* 5. Push Reminders Cron Setup */}
						<div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
							<div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
								<span className="flex size-6 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400 font-mono text-xs font-bold shrink-0">5</span>
								<div>
									<h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
										Scheduled Push Reminders Cron Endpoint
									</h3>
									<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										Automated notifications for baby vaccinations, milestones, and family reminders.
									</p>
								</div>
							</div>

							<div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
								<p>
									KyoHub sends a daily notification about the next day&apos;s appointments and vaccinations at 9:00 PM Philippine Time (13:00 UTC). The endpoint requires your <code className="font-mono text-teal-700 dark:text-teal-300">CRON_SECRET</code> sent in the <code className="font-mono text-teal-700 dark:text-teal-300">Authorization</code> header:
								</p>

								<div className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-100 overflow-x-auto min-w-0 leading-relaxed">
									<p className="text-slate-500"># Scheduled Endpoint</p>
									<p>GET /api/cron/baby-reminders</p>
									<p className="mt-3 text-slate-500"># Crontab entry (Runs daily at 13:00 UTC / 21:00 PHT)</p>
									<p><span className="text-teal-400 select-none">$ </span>0 13 * * * curl -X GET https://your-domain.com/api/cron/baby-reminders -H &quot;Authorization: Bearer YOUR_CRON_SECRET&quot;</p>
								</div>
							</div>
						</div>

						{/* Quick Link back to Beginner */}
						<div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
							<button
								type="button"
								onClick={() => setActiveTab("all")}
								className="palette-action-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
							>
								<span>View Beginner Step-by-Step Guide</span>
								<ArrowRight className="size-3.5" />
							</button>
							<a
								href="https://github.com/kyooowe/kyohub"
								target="_blank"
								rel="noopener noreferrer"
								className="palette-action-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
							>
								<span>Star on GitHub</span>
								<ExternalLink className="size-3.5" />
							</a>
						</div>
					</div>
				) : (
					<div className="space-y-8 sm:space-y-12">
						{phases
							.filter((phase) => activeTab === "all" || activeTab === phase.id)
							.map((phase) => {
								const PhaseIcon = phase.icon;
								return (
									<section key={phase.id} className="scroll-mt-24" id={phase.id}>
										{/* Phase Header */}
										<div className={`rounded-2xl border p-4 sm:p-6 bg-linear-to-r ${phase.accentBg} ${phase.accentBorder} shadow-xs`}>
											<div className="flex items-start sm:items-center gap-3">
												<div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-slate-900">
													<PhaseIcon className={`size-5 sm:size-6 ${phase.color}`} />
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-300">
															{phase.badge}
														</span>
														<h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white truncate">
															{phase.title}
														</h2>
													</div>
													<p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
														{phase.subtitle}
													</p>
												</div>
											</div>
										</div>

										{/* Step Cards List */}
										<div className="mt-3.5 sm:mt-4 space-y-3 sm:space-y-3.5">
											{phase.steps.map((step) => {
												const isDone = !!completedSteps[step.id];
												return (
													<div
														key={step.id}
														id={`step-card-${step.id}`}
														className={`group relative scroll-mt-28 rounded-xl border transition-all duration-300 min-w-0 ${isDone
															? "border-teal-300/80 bg-teal-50/20 dark:border-teal-900/40 dark:bg-teal-950/10"
															: step.highlight
																? "border-teal-300 bg-white shadow-xs dark:border-teal-800/80 dark:bg-slate-900"
																: "border-slate-200 bg-white shadow-2xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
															} p-3.5 sm:p-5`}
													>
														<div className="flex items-start justify-between gap-2.5 sm:gap-3 min-w-0">
															<div className="flex items-start gap-2.5 sm:gap-4 flex-1 min-w-0">
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

																<div className="space-y-1.5 flex-1 min-w-0">
																	<div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
																					<span className="leading-relaxed">{sub}</span>
																				</li>
																			))}
																		</ul>
																	)}

																	{/* Step 15 specific callout pointing to the All Vercel Environment Variable Commands card */}
																	{step.id === "ver-15" && (
																		<div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-teal-300 bg-teal-50/90 p-3 sm:p-3.5 text-xs text-teal-950 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200 min-w-0">
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
																				className="palette-action-button w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
																			>
																				<span>View Commands Card</span>
																				<ArrowRight className="size-3.5" />
																			</button>
																		</div>
																	)}

																	{/* Single Command Box */}
																	{step.command && (
																		<div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 sm:px-3.5 sm:py-2.5 font-mono text-xs text-slate-100 min-w-0">
																			<div className="flex items-center gap-2 overflow-x-auto min-w-0 pr-1 scrollbar-none">
																				<span className="text-teal-400 select-none">$</span>
																				<span className="selection:bg-teal-700 whitespace-nowrap">{step.command}</span>
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
																		<div className="mt-3 relative rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 min-w-0">
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
																			<pre className="overflow-x-auto leading-relaxed text-[10px] sm:text-xs">{step.code}</pre>
																		</div>
																	)}

																	{/* Tip callout */}
																	{step.tip && (
																		<div className="mt-2.5 flex items-start gap-2 rounded-lg bg-teal-500/10 p-2.5 text-xs text-teal-900 dark:bg-teal-950/20 dark:text-teal-200">
																			<Info className="size-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
																			<span className="leading-relaxed">{step.tip}</span>
																		</div>
																	)}

																	{/* Step 16 specific callout: 404 error troubleshooting */}
																	{step.id === "ver-16" && (
																		<div className="mt-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/70 p-3.5 sm:p-4 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 min-w-0">
																			<div className="flex items-start gap-2.5 sm:gap-3">
																				<div className="rounded-xl bg-amber-100 p-1.5 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
																					<AlertTriangle className="size-4.5" />
																				</div>
																				<div className="w-full space-y-2 leading-relaxed min-w-0">
																					<div>
																						<p className="font-bold text-amber-900 dark:text-amber-100 text-xs sm:text-sm">
																							Encountering a 404 error on your Vercel &ldquo;Aliased&rdquo; URL?
																						</p>
																						<p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
																							If your live link returns a 404 Not Found error, Vercel needs to be set to the Next.js framework preset:
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
																								Click <strong>Save</strong>, then redeploy by running <code className="rounded bg-amber-200/80 px-1.5 py-0.5 font-mono text-[11px] text-amber-950 dark:bg-amber-900 dark:text-amber-100">vercel --prod</code> again in your terminal.
																							</span>
																						</div>
																					</div>
																				</div>
																			</div>
																		</div>
																	)}

																	{/* Step Card Bottom Action Bar - Stacked & thumb-friendly on mobile */}
																	<div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
																		<div className="flex items-center gap-2 w-full sm:w-auto">
																			{step.actionUrl && (
																				<a
																					href={step.actionUrl}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="palette-action-button w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
																				>
																					<span>{step.actionLabel || "Open website"}</span>
																					<ExternalLink className="size-3" />
																				</a>
																			)}
																		</div>

																		<button
																			type="button"
																			onClick={() => completeAndNext(step.id)}
																			className="palette-action-button w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
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
												className="mt-6 scroll-mt-28 rounded-2xl border border-teal-200/80 bg-linear-to-b from-teal-50/50 to-white p-4 sm:p-6 shadow-sm dark:border-teal-950/60 dark:from-teal-950/20 dark:to-slate-900"
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
														className="palette-action-button w-full sm:w-auto justify-center inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95"
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
															className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/70 bg-white px-2.5 sm:px-3 py-2 text-xs font-mono dark:border-slate-800 dark:bg-slate-950 min-w-0"
														>
															<div className="flex items-center gap-2 overflow-x-auto text-slate-800 dark:text-slate-200 min-w-0 pr-1 scrollbar-none">
																<span className="text-teal-600 dark:text-teal-400 font-bold select-none">{idx + 1}.</span>
																<span className="whitespace-nowrap">{cmd}</span>
															</div>
															<button
																type="button"
																onClick={() => copyToClipboard(cmd, `vcmd-${idx}`)}
																className="shrink-0 ml-1 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
												<div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/70 p-3 sm:p-3.5 text-xs text-teal-950 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-200">
													<p className="font-semibold flex items-center gap-1.5">
														<Sparkles className="size-3.5 text-teal-700 dark:text-teal-400 shrink-0" /> Prefer clicking on a website instead of terminal?
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
				)}

				{/* 404 Troubleshooting & Success Banner (Available on Vercel Deploy and All Steps) */}
				{(activeTab === "vercel" || activeTab === "all") && (
					<>
						{/* 404 Troubleshooting Callout at the very bottom after Step 16 */}
						<div className="mt-8 rounded-2xl border border-amber-300/80 bg-linear-to-b from-amber-50/90 to-white p-4 sm:p-6 text-xs text-amber-950 shadow-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:to-slate-900 dark:text-amber-200">
							<div className="flex items-start gap-3">
								<div className="rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 shrink-0">
									<AlertTriangle className="size-5" />
								</div>
								<div className="w-full space-y-2.5 leading-relaxed min-w-0">
									<div>
										<h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
											Troubleshooting: Encountering a 404 error on your Vercel &ldquo;Aliased&rdquo; URL?
										</h3>
										<p className="mt-0.5 text-amber-900/90 dark:text-amber-300/90">
											If your live URL opens to a 404 Not Found page, Vercel needs to be configured with the Next.js framework preset:
										</p>
									</div>

									<div className="grid gap-2 pt-1 sm:grid-cols-2">
										<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2 sm:p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
												1
											</span>
											<span className="text-amber-950 dark:text-amber-200">
												Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 dark:hover:text-white">vercel.com</a> and select your project.
											</span>
										</div>

										<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2 sm:p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
												2
											</span>
											<span className="text-amber-950 dark:text-amber-200">
												In the left navigation tab, click <strong>Settings</strong>.
											</span>
										</div>

										<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2 sm:p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
												3
											</span>
											<span className="text-amber-950 dark:text-amber-200">
												In the left sidebar menu, click <strong>Build and Deployment</strong>.
											</span>
										</div>

										<div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2 sm:p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
												4
											</span>
											<span className="text-amber-950 dark:text-amber-200">
												Under <strong>Framework Settings</strong>, change the preset to <strong>&ldquo;Next.js&rdquo;</strong>.
											</span>
										</div>

										<div className="sm:col-span-2 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-100/40 p-2 sm:p-2.5 dark:border-amber-900/50 dark:bg-amber-950/30">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
												5
											</span>
											<span className="text-amber-950 dark:text-amber-200">
												Click <strong>Save</strong>, then redeploy by running <code className="rounded bg-amber-200/80 px-1.5 py-0.5 font-mono text-[11px] text-amber-950 dark:bg-amber-900 dark:text-amber-100">vercel --prod</code> again in your terminal.
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Success Banner / Summary */}
						<div
							id="deployment-success-banner"
							className="mt-10 sm:mt-14 scroll-mt-28 rounded-3xl border border-teal-700/30 bg-linear-to-br from-[#0c2340] via-[#17756D] to-[#0E5E57] p-6 sm:p-8 text-center text-white shadow-xl shadow-teal-950/20"
						>
							<div className="mx-auto flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
								<Sparkles className="size-6 sm:size-7 text-teal-200" />
							</div>
							<h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight">Congratulations on Your Deployment!</h2>
							<p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-teal-100">
								You now have a fully private, autonomous household hub for grocery lists, baby appointments, household passwords, and family budgets.
							</p>

							<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
								<a
									href="https://github.com/kyooowe/kyohub"
									target="_blank"
									rel="noopener noreferrer"
									className="palette-action-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
								>
									<span>Star on GitHub</span>
									<ExternalLink className="size-3.5" />
								</a>
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
