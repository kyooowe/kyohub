"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Baby,
  Calendar,
  CalendarDays,
  ChartNoAxesColumn,
  Key,
  Loader2,
  LockKeyhole,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/features/auth/actions/auth-actions";
import type { AuthUser } from "@/features/auth/lib/session";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  DashboardNavigationProgress,
  DashboardNavigationReadyProvider,
} from "@/components/layout/dashboard-navigation-progress";
import {
  SettingsProvider,
  useAppSettings,
} from "@/components/settings/settings-context";
import {
  defaultPagePalettes,
  navigationItems,
  type AppSettings,
  type NavigationHref,
} from "@/components/settings/settings-model";
import { getPagePaletteStyles } from "@/components/settings/page-palettes";

export default function Dashboard({
  children,
  user,
  initialSettings,
  migrateLocalSettings,
}: {
  children: ReactNode;
  user: AuthUser;
  initialSettings: AppSettings;
  migrateLocalSettings: boolean;
}) {
  return (
    <SettingsProvider
      initialSettings={initialSettings}
      migrateLocalSettings={migrateLocalSettings}
    >
      <DashboardShell user={user}>{children}</DashboardShell>
    </SettingsProvider>
  );
}

function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [locking, setLocking] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ targetPath: string } | null>(null);
  const [showNavigationProgress, setShowNavigationProgress] = useState(false);
  const [displayedPathname, setDisplayedPathname] = useState(pathname);
  const shouldShowNavigationProgress = showNavigationProgress;
  const icons = {
    "/passwords": Key,
    "/grocery": ShoppingCart,
    "/family-calendar": CalendarDays,
    "/budget": ChartNoAxesColumn,
    "/baby-tracker": Baby,
  } satisfies Record<NavigationHref, typeof Key>;
  const navigation = settings.navigationOrder.map((href) => {
    const item = navigationItems.find((entry) => entry.href === href)!;
    return { ...item, icon: icons[href] };
  });
  const activeIndex = Math.max(
    0,
    navigation.findIndex((item) => displayedPathname.startsWith(item.href)),
  );
  const current = navigation[activeIndex];
  const pagePalette = settings.pagePalettes[current.href];
  const backgroundPalette = pagePalette === "default" ? defaultPagePalettes[current.href] : pagePalette;
  const paletteAccent = getPagePaletteStyles(backgroundPalette).accent;
  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      href === pathname
    ) {
      return;
    }
    setShowNavigationProgress(false);
    setPendingNavigation({ targetPath: href });
  }

  const handleRouteReady = useCallback((href: string) => {
    if (href !== pathname) return;
    setDisplayedPathname(href);
    if (pendingNavigation?.targetPath !== href) return;
    setPendingNavigation(null);
    setShowNavigationProgress(false);
  }, [pathname, pendingNavigation]);

  async function lockApp() {
    if (locking) return;
    setLocking(true);
    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? `Could not lock the app: ${error.message}` : "Could not lock the app.");
      setLocking(false);
    }
  }

  useEffect(() => {
    if (!pendingNavigation) return;
    const timeout = window.setTimeout(() => setShowNavigationProgress(true), 150);
    return () => window.clearTimeout(timeout);
  }, [pendingNavigation]);

  useEffect(() => {
    function clearPendingNavigation() {
      setShowNavigationProgress(false);
      setPendingNavigation({
        targetPath: window.location.pathname,
      });
    }
    window.addEventListener("popstate", clearPendingNavigation);
    return () => window.removeEventListener("popstate", clearPendingNavigation);
  }, []);

  return (
    <main
      data-page-palette={pagePalette === "default" ? undefined : pagePalette}
      data-dashboard-page
      style={{ "--page-accent-base": paletteAccent } as CSSProperties}
      className="min-h-screen text-slate-800 dark:text-slate-100 md:flex"
    >
      <aside
        data-page-palette-preserve
        className={`${settings.desktopNavigation === "sidebar" ? "md:flex" : "md:hidden"} hidden flex-col border-b border-violet-950/40 bg-linear-to-b from-[#211a3e] via-[#241d43] to-[#18152e] px-2 py-3 text-white md:static md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-5`}
      >
        <Link
          href="/"
          onClick={(event) => handleNavigationClick(event, "/")}
          className="mb-5 flex items-center gap-3 px-2 text-xl font-bold tracking-tight text-white md:mb-12"
        >
          <span className="grid size-8 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-lg shadow-emerald-500/20">
            <i className="rounded-sm bg-white" />
            <i className="rounded-sm bg-white/65" />
            <i className="rounded-sm bg-white/65" />
            <i className="rounded-sm bg-white" />
          </span>
          Kyohub<span className="-ml-3 text-emerald-400">.</span>
        </Link>
        <p className="mb-2 hidden px-3 text-[10px] font-semibold tracking-[0.18em] text-violet-200/50 md:block">
          YOUR SPACE
        </p>
        <nav
          aria-label="Main navigation"
          className="grid grid-cols-4 gap-1.5 md:flex md:flex-col md:gap-2"
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = current.href === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onClick={(event) => handleNavigationClick(event, href)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-14 min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[10px] leading-tight transition-all md:min-h-11 md:flex-row md:justify-start md:gap-3 md:rounded-md md:px-3 md:py-0 md:text-left md:text-sm ${active ? "bg-linear-to-r from-violet-500/25 to-fuchsia-500/10 text-white shadow-inner shadow-white/5" : "text-violet-100/65 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={19} className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 border-t border-white/10 pt-3">
          <SettingsPanel trigger="sidebar" />
        </div>
        <LockButton onLock={lockApp} disabled={locking} label="Lock app" className="mt-3 text-violet-100/65 hover:bg-white/5 hover:text-white" />
        <div className="mt-auto hidden md:block">
          <div className="mb-4 rounded-xl border border-violet-300/10 bg-linear-to-br from-violet-400/10 to-fuchsia-400/5 p-4 text-sm leading-relaxed text-violet-100/70">
            A little more organized, a little less to remember.
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <div className="grid size-9 place-items-center rounded-full bg-linear-to-br from-[#0c2340] via-[#17756D] to-[#26A69A] text-xs font-bold text-white shadow-md shadow-[#17756D]/25 ring-2 ring-[#26A69A]/30">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-teal-200/60">Personal space</p>
            </div>
          </div>
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <header data-page-palette-preserve className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-teal-100/70 bg-white/80 px-5 shadow-[0_1px_8px_rgba(23,117,109,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              data-page-palette-preserve
              href="/"
              onClick={(event) => handleNavigationClick(event, "/")}
              className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-900 sm:hidden dark:text-white"
            >
              <span className="grid size-7 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-500/20">
                <i className="rounded-sm bg-white" />
                <i className="rounded-sm bg-white/65" />
                <i className="rounded-sm bg-white/65" />
                <i className="rounded-sm bg-white" />
              </span>
              Kyohub<span className="-ml-2 text-emerald-500">.</span>
            </Link>
            {settings.desktopNavigation === "floating" && (
              <Link
                data-page-palette-preserve
                href="/"
                onClick={(event) => handleNavigationClick(event, "/")}
                className="hidden shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-900 sm:flex dark:text-white"
              >
                <span className="grid size-7 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-md shadow-emerald-500/20">
                  <i className="rounded-sm bg-white" />
                  <i className="rounded-sm bg-white/65" />
                  <i className="rounded-sm bg-white/65" />
                  <i className="rounded-sm bg-white" />
                </span>
                Kyohub<span className="-ml-2 text-emerald-500">.</span>
              </Link>
            )}
            {settings.desktopNavigation === "floating" && (
              <span
                aria-hidden="true"
                className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block dark:bg-slate-700"
              />
            )}
            <div className="hidden truncate text-sm text-slate-400 dark:text-slate-300 sm:block">
              My space{" "}
              <span className="mx-2 text-teal-200/80 dark:text-teal-800">
                /
              </span>
              <strong className="font-medium text-slate-700 dark:text-slate-100">
                {current.label}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300 sm:gap-3">
            <div className="hidden h-8 items-center gap-2 rounded-xl border border-[#26A69A]/25 bg-linear-to-r from-[#26A69A]/10 via-[#17756D]/5 to-[#26A69A]/10 px-3 text-xs font-medium text-[#0c2340] shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-[#26A69A]/45 hover:bg-[#26A69A]/15 hover:shadow-sm sm:inline-flex dark:border-[#26A69A]/30 dark:from-[#0c2340]/40 dark:via-[#17756D]/20 dark:to-[#26A69A]/10 dark:text-[#E0F2F1]">
              <Calendar size={13} strokeWidth={2.2} className="shrink-0 text-[#17756D] dark:text-[#4DB6AC]" />
              <span className="font-semibold tracking-tight">
                {new Intl.DateTimeFormat("en", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }).format(new Date())}
              </span>
            </div>
            <LockButton onLock={lockApp} disabled={locking} compact />
            <SettingsPanel trigger="header" />
            <div
              className="relative flex shrink-0 items-center justify-center"
              title={`${user.name} (${user.initials})`}
            >
              <span
                data-page-palette-preserve
                className="grid size-8 place-items-center rounded-full bg-linear-to-br from-[#0c2340] via-[#17756D] to-[#26A69A] text-xs font-bold text-white shadow-md shadow-[#17756D]/25 ring-2 ring-[#26A69A]/30 transition-all duration-200 hover:scale-105 hover:ring-[#26A69A]/50 dark:shadow-[#0c2340]/50 dark:ring-[#26A69A]/40"
              >
                {user.initials}
              </span>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#26A69A] ring-2 ring-white dark:ring-slate-950"
              />
            </div>
          </div>
        </header>
        {shouldShowNavigationProgress && <DashboardNavigationProgress />}
        <DashboardNavigationReadyProvider onRouteReady={handleRouteReady}>
          <div
            inert={shouldShowNavigationProgress}
            aria-busy={shouldShowNavigationProgress}
            className={`mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col animate-in space-y-6 p-4 pb-[5.375rem] fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none md:px-8 md:pt-8 ${settings.desktopNavigation === "floating" ? "md:pb-[6.875rem]" : "md:pb-8"}`}
          >
            {children}
          </div>
        </DashboardNavigationReadyProvider>
      </section>
      <nav
        data-page-palette-preserve
        aria-label="Main navigation"
        className="floating-navigation-bar fixed bottom-3 left-1/2 z-50 grid h-[3.875rem] w-[min(calc(100%_-_1.5rem),28rem)] -translate-x-1/2 items-center gap-0.5 rounded-2xl border p-1 backdrop-blur-xl md:hidden"
        style={{
          gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))`,
        }}
      >
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = current.href === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              onClick={(event) => handleNavigationClick(event, href)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              className="floating-navigation-link relative z-10 flex h-12 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent px-0.5 py-1 text-center text-[9px] font-medium leading-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-accent-base)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Icon size={18} className="shrink-0" />
            </Link>
          );
        })}
      </nav>
      {settings.desktopNavigation === "floating" && (
        <nav
          data-page-palette-preserve
          aria-label="Main navigation"
          className="desktop-floating-navigation-bar fixed bottom-6 left-1/2 z-50 hidden h-[3.875rem] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-2xl border p-2.5 backdrop-blur-xl md:flex"
        >
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 px-2 text-[10px] font-semibold tracking-[0.14em] text-slate-500 dark:text-slate-400">
              WORKSPACE
            </span>
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = current.href === href;
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  onClick={(event) => handleNavigationClick(event, href)}
                  aria-current={active ? "page" : undefined}
                  title={label}
                  className="desktop-floating-navigation-link inline-flex h-10 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-2 text-xs font-medium transition-colors motion-reduce:transition-none md:text-[11px] lg:gap-2 lg:px-2.5 lg:text-xs"
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="max-w-16 truncate lg:max-w-none">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </main>
  );
}

function LockButton({
  onLock,
  disabled,
  label,
  compact = false,
  className = "",
}: {
  onLock: () => Promise<void>;
  disabled: boolean;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const timer = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);

  function cancelHold() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setHolding(false);
  }

  function startHold() {
    if (disabled || timer.current !== null) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setHolding(false);
      void onLock();
    }, 2000);
  }

  useEffect(() => cancelHold, []);

  return (
    <>
      {holding && (
        createPortal(
          <div aria-hidden="true" className="fixed inset-x-0 top-14 z-[60] h-0.5 bg-slate-200/70 dark:bg-slate-700/70">
            <div style={{ backgroundImage: "linear-gradient(to right, #fda4af, #f87171, #fecaca)" }} className="relative h-full w-0 overflow-hidden rounded-full animate-lock-progress after:absolute after:inset-y-0 after:-left-1/3 after:w-1/3 after:bg-linear-to-r after:from-transparent after:via-white/45 after:to-transparent after:content-[''] after:animate-lock-progress-shimmer" />
          </div>,
          document.body,
        )
      )}
      <button
        type="button"
        disabled={disabled}
        aria-label="Hold for 2 seconds to lock the app"
        title={holding ? "Keep holding to lock" : "Hold for 2 seconds to lock"}
        onPointerDown={(event) => {
          if (event.button === 0) startHold();
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") startHold();
        }}
        onKeyUp={cancelHold}
        onContextMenu={(event) => event.preventDefault()}
        className={`inline-flex ${label ? "min-h-11 w-full justify-start gap-3 rounded-md px-3 text-sm" : compact ? "size-9 justify-center rounded-full" : "size-11 justify-center rounded-full"} shrink-0 touch-none items-center text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
      >
        {disabled ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
        {label && (disabled ? "Locking…" : holding ? "Keep holding…" : label)}
      </button>
    </>
  );
}
