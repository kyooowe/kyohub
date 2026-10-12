"use client";

import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";

type OnDashboardRouteReady = (href: string) => void;

const DashboardRouteReadyContext = createContext<OnDashboardRouteReady | null>(null);

export function DashboardNavigationReadyProvider({
	children,
	onRouteReady,
}: {
	children: ReactNode;
	onRouteReady: OnDashboardRouteReady;
}) {
	return (
		<DashboardRouteReadyContext.Provider value={onRouteReady}>
			{children}
		</DashboardRouteReadyContext.Provider>
	);
}

export function DashboardNavigationReady({ href }: { href: string }) {
	const onRouteReady = useContext(DashboardRouteReadyContext);
	if (!onRouteReady) {
		throw new Error("DashboardNavigationReady must be rendered inside its provider.");
	}

	useLayoutEffect(() => {
		onRouteReady(href);
	}, [href, onRouteReady]);

	return null;
}

export function DashboardNavigationProgress() {
	return (
		<div role="status" aria-label="Loading page" className="fixed inset-x-0 top-14 z-[60] h-0.5 bg-slate-200/70 dark:bg-slate-700/70">
			<div style={{ backgroundImage: "linear-gradient(to right, #7dd3fc, #60a5fa, #a5f3fc)" }} className="relative h-full w-1/3 overflow-hidden rounded-full animate-navigation-progress motion-reduce:animate-none after:absolute after:inset-y-0 after:-left-1/3 after:w-1/3 after:bg-linear-to-r after:from-transparent after:via-white/45 after:to-transparent after:content-[''] after:animate-lock-progress-shimmer motion-reduce:after:animate-none" />
		</div>
	);
}
