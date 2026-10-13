import Image from "next/image";
import { socialMediaIconUrl } from "@/features/passwords/lib/password-utils";
import type { Category } from "@/features/passwords/types";

const otherAvatarLook = {
	background: "#ede9fe",
	skin: "#d79a70",
	hair: "#7c2d12",
	clothing: "#d97706",
	detail: "#fde68a",
};

export function PasswordAvatar({ category, className }: { category: Category; className: string; website?: string; url?: string }) {
	if (category === "Social media") {
		return <Image src={socialMediaIconUrl} width={96} height={96} alt="" className={`${className} object-contain`} />;
	}
	if (category === "Banking") {
		return <Image src="/icon/bank-type-v2.png" width={512} height={512} alt="" className={`${className} object-contain`} />;
	}
	if (category === "Games") {
		return <span className={`relative block overflow-hidden ${className}`}>
			<Image src="/icon/steam.png" width={96} height={96} alt="" className="absolute inset-0 z-10 size-full scale-105 object-contain" />
		</span>;
	}

	if (category !== "Other") {
		return <svg viewBox="0 0 80 80" className={className} aria-hidden="true" focusable="false">
			{category === "Work" && <>
				<g transform="translate(1 1) scale(3.25)" className="fill-[#24292f] dark:fill-[#f0f6fc]">
					<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
				</g>
			</>}
		</svg>;
	}

	const look = otherAvatarLook;

	return <svg viewBox="0 0 80 80" className={className} aria-hidden="true" focusable="false">
		<circle cx="40" cy="40" r="39" fill={look.background} />
		<path d="M11 80c2-15 12-24 29-24s27 9 29 24" fill={look.clothing} />
		<path d="m29 58 11 9 11-9 5 6-8 16H32l-8-16z" fill={look.detail} />
		<path d="M34 48h12v13c0 4-12 4-12 0z" fill={look.skin} />
		<path d="M22 36c-2-17 6-27 18-27 14 0 21 11 18 29l-5 11H27z" fill={look.hair} />
		<path d="M24 34c2-12 8-18 17-18 8 0 13 4 16 11-8 1-17-1-23-6-2 5-5 10-10 13z" fill={look.hair} />
		<circle cx="27" cy="22" r="7" fill={look.hair} />
		<circle cx="38" cy="15" r="7" fill={look.hair} />
		<circle cx="50" cy="18" r="7" fill={look.hair} />
		<path d="M24 34c0-11 7-18 16-18s16 7 16 18v10c0 12-7 19-16 19s-16-7-16-19z" fill={look.skin} />
		<path d="M24 34c2-12 8-18 17-18 8 0 13 4 16 11-8 1-17-1-23-6-2 5-5 10-10 13z" fill={look.hair} />
		<path d="M31 39h3m12 0h3" stroke="#34231d" strokeWidth="2" strokeLinecap="round" />
		<path d="M40 40v6" stroke="#bd785e" strokeWidth="1.5" strokeLinecap="round" />
		<path d="M36 51c2 2 6 2 8 0" fill="none" stroke="#9f4f51" strokeWidth="1.5" strokeLinecap="round" />
	</svg>;
}
