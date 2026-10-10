import Image from "next/image";
import type { Category } from "@/features/passwords/types";

const avatarImages: Partial<Record<Category, string>> = {
	"Social media": "/icon/social-media.png",
	Banking: "/icon/bank.png",
	Games: "/icon/gaming.png",
	Work: "/icon/work.png",
};

const avatarLooks: Record<Category, { background: string; skin: string; hair: string; clothing: string; detail: string }> = {
	"Social media": { background: "#dbeafe", skin: "#d99a78", hair: "#312e81", clothing: "#2563eb", detail: "#22d3ee" },
	Banking: { background: "#d1fae5", skin: "#a96d4a", hair: "#1f2937", clothing: "#047857", detail: "#f8fafc" },
	Games: { background: "#fae8ff", skin: "#e5b08e", hair: "#1e1b4b", clothing: "#7c3aed", detail: "#c4b5fd" },
	Work: { background: "#fef3c7", skin: "#f1c7a5", hair: "#6b442e", clothing: "#0f766e", detail: "#99f6e4" },
	Other: { background: "#ede9fe", skin: "#d79a70", hair: "#7c2d12", clothing: "#d97706", detail: "#fde68a" },
};

export function PasswordAvatar({ category, className }: { category: Category; className: string }) {
	const avatarImage = avatarImages[category];
	if (avatarImage) {
		return <span className={`relative block shrink-0 overflow-hidden ${className}`}>
			<Image
				src={avatarImage}
				width={512}
				height={512}
				alt=""
				unoptimized
				className="block size-full object-fill"
			/>
		</span>;
	}

	const look = avatarLooks[category];
	const isGamer = category === "Games";
	const hasGlasses = category === "Banking" || category === "Work";
	const hasCurls = category === "Other";

	return <svg viewBox="0 0 80 80" className={className} aria-hidden="true" focusable="false">
		<circle cx="40" cy="40" r="39" fill={look.background} />
		{isGamer && <path d="M18 40c0-17 9-27 22-27s22 10 22 27" fill="none" stroke="#312e81" strokeWidth="5" strokeLinecap="round" />}
		<path d="M11 80c2-15 12-24 29-24s27 9 29 24" fill={look.clothing} />
		<path d="m29 58 11 9 11-9 5 6-8 16H32l-8-16z" fill={look.detail} />
		<path d="M34 48h12v13c0 4-12 4-12 0z" fill={look.skin} />
		<path d="M22 36c-2-17 6-27 18-27 14 0 21 11 18 29l-5 11H27z" fill={look.hair} />
		<path d="M24 34c2-12 8-18 17-18 8 0 13 4 16 11-8 1-17-1-23-6-2 5-5 10-10 13z" fill={look.hair} />
		{hasCurls && <>
			<circle cx="27" cy="22" r="7" fill={look.hair} />
			<circle cx="38" cy="15" r="7" fill={look.hair} />
			<circle cx="50" cy="18" r="7" fill={look.hair} />
		</>}
		<path d="M24 34c0-11 7-18 16-18s16 7 16 18v10c0 12-7 19-16 19s-16-7-16-19z" fill={look.skin} />
		<path d="M24 34c2-12 8-18 17-18 8 0 13 4 16 11-8 1-17-1-23-6-2 5-5 10-10 13z" fill={look.hair} />
		<path d="M31 39h3m12 0h3" stroke="#34231d" strokeWidth="2" strokeLinecap="round" />
		<path d="M40 40v6" stroke="#bd785e" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M36 51c2 2 6 2 8 0" fill="none" stroke="#9f4f51" strokeWidth="1.5" strokeLinecap="round" />
		{hasGlasses && <g fill="none" stroke="#334155" strokeWidth="1.7">
			<rect x="27" y="34" width="11" height="8" rx="3" />
			<rect x="42" y="34" width="11" height="8" rx="3" />
			<path d="M38 37h4" />
		</g>}
		{isGamer && <>
			<rect x="17" y="34" width="7" height="14" rx="3.5" fill="#312e81" />
			<rect x="56" y="34" width="7" height="14" rx="3.5" fill="#312e81" />
			<path d="M59 49c0 5-4 7-9 7" fill="none" stroke="#312e81" strokeWidth="2" strokeLinecap="round" />
			<circle cx="49" cy="56" r="2" fill="#312e81" />
		</>}
		{category === "Banking" && <path d="m36 66 4 4 4-4-2-4h-4z" fill="#0f172a" />}
		{category === "Work" && <path d="M31 65h18l-9 8z" fill={look.detail} />}
	</svg>;
}
