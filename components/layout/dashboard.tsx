"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
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
  SettingsProvider,
  useAppSettings,
} from "@/components/settings/settings-context";
import {
  navigationItems,
  type AppSettings,
  type NavigationHref,
} from "@/components/settings/settings-model";

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
  const icons = {
    "/passwords": Key,
    "/grocery": ShoppingCart,
    "/baby-needs": CalendarDays,
    "/budget": ChartNoAxesColumn,
  } satisfies Record<NavigationHref, typeof Key>;
  const navigation = settings.navigationOrder.map((href) => {
    const item = navigationItems.find((entry) => entry.href === href)!;
    return { ...item, icon: icons[href] };
  });
  const activeIndex = Math.max(
    0,
    navigation.findIndex((item) => pathname.startsWith(item.href)),
  );
  const current = navigation[activeIndex];
  const pagePalette = settings.pagePalettes[current.href];
  const floatingNavRef = useRef<HTMLElement | null>(null);
  const [floatingIndicator, setFloatingIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

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

  useLayoutEffect(() => {
    const nav = floatingNavRef.current;
    const activeLink = nav?.querySelector<HTMLElement>("[data-active='true']");
    if (!nav || !activeLink) return;
    const navElement = nav;
    const activeElement = activeLink;

    function updateIndicator() {
      const navBounds = navElement.getBoundingClientRect();
      const linkBounds = activeElement.getBoundingClientRect();
      setFloatingIndicator({
        left: linkBounds.left - navBounds.left - navElement.clientLeft,
        top: linkBounds.top - navBounds.top - navElement.clientTop,
        width: linkBounds.width,
        height: linkBounds.height,
      });
    }

    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(navElement);
    observer.observe(activeElement);
    return () => observer.disconnect();
  }, [activeIndex, settings.desktopNavigation]);

  return (
    <main
      data-page-palette={pagePalette === "default" ? undefined : pagePalette}
      className="min-h-screen bg-[#f5f4fb] text-slate-800 dark:bg-[#13111f] dark:text-slate-100 md:flex"
    >
      <aside
        data-page-palette-preserve
        className={`${settings.desktopNavigation === "sidebar" ? "md:flex" : "md:hidden"} hidden flex-col border-b border-violet-950/40 bg-linear-to-b from-[#211a3e] via-[#241d43] to-[#18152e] px-2 py-3 text-white md:static md:min-h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-5`}
      >
        <Link
          href="/"
          className="mb-5 flex items-center gap-3 px-2 text-xl font-bold tracking-tight text-white md:mb-12"
        >
          <span className="grid size-8 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-fuchsia-400 to-violet-400 p-1.5 shadow-lg shadow-fuchsia-500/20">
            <i className="rounded-sm bg-white" />
            <i className="rounded-sm bg-white/65" />
            <i className="rounded-sm bg-white/65" />
            <i className="rounded-sm bg-white" />
          </span>
          Kyohub<span className="-ml-3 text-fuchsia-300">.</span>
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
            <div className="grid size-9 place-items-center rounded-full bg-linear-to-br from-fuchsia-300 to-violet-400 text-xs font-bold text-violet-950 ring-2 ring-white/10">
              {user.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-violet-200/50">Personal space</p>
            </div>
          </div>
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <header data-page-palette-preserve className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-violet-100 bg-white/80 px-5 shadow-[0_1px_8px_rgba(68,48,125,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              data-page-palette-preserve
              href="/"
              className="flex shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-900 sm:hidden dark:text-white"
            >
              <span className="grid size-7 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-fuchsia-400 to-violet-400 p-1.5 shadow-md shadow-fuchsia-500/20">
                <i className="rounded-sm bg-white" />
                <i className="rounded-sm bg-white/65" />
                <i className="rounded-sm bg-white/65" />
                <i className="rounded-sm bg-white" />
              </span>
              Kyohub<span className="-ml-2 text-fuchsia-500">.</span>
            </Link>
            {settings.desktopNavigation === "floating" && (
              <Link
                data-page-palette-preserve
                href="/"
                className="hidden shrink-0 items-center gap-2 text-base font-bold tracking-tight text-slate-900 sm:flex dark:text-white"
              >
                <span className="grid size-7 grid-cols-2 gap-1 rounded-lg bg-linear-to-br from-fuchsia-400 to-violet-400 p-1.5 shadow-md shadow-fuchsia-500/20">
                  <i className="rounded-sm bg-white" />
                  <i className="rounded-sm bg-white/65" />
                  <i className="rounded-sm bg-white/65" />
                  <i className="rounded-sm bg-white" />
                </span>
                Kyohub<span className="-ml-2 text-fuchsia-500">.</span>
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
              <span className="mx-2 text-violet-200 dark:text-violet-400">
                /
              </span>
              <strong className="font-medium text-slate-700 dark:text-slate-100">
                {current.label}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
            <SettingsPanel trigger="header" />
            <span className="hidden h-8 items-center rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 font-medium text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </span>
            <span data-page-palette-preserve className="grid size-8 place-items-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 font-semibold text-white shadow-md shadow-violet-300/40 ring-2 ring-violet-100 dark:shadow-violet-950/50 dark:ring-violet-400/20">
              {user.initials}
            </span>
          </div>
        </header>
        <div
          key={pathname}
          className={`mx-auto max-w-6xl animate-in space-y-6 p-4 pb-24 fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none md:px-8 md:pt-8 ${settings.desktopNavigation === "floating" ? "md:pb-28" : "md:pb-8"}`}
        >
          {children}
        </div>
      </section>
      <nav
        data-page-palette-preserve
        aria-label="Main navigation"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/80 bg-white/85 p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/90 md:hidden"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1.5 top-1.5 size-11 rounded-full bg-linear-to-br from-[#7f22fe] to-[#c026d3] shadow-md shadow-violet-500/30 transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(${activeIndex * 50}px)` }}
        />
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = current.href === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`relative z-10 grid size-11 shrink-0 place-items-center rounded-full transition-[color,transform] duration-300 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${active ? "scale-110 text-white" : "scale-100 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
        <span
          aria-hidden="true"
          className="mx-1 h-7 w-px shrink-0 bg-slate-300/80 dark:bg-slate-600"
        />
        <LockButton onLock={lockApp} disabled={locking} />
        <SettingsPanel trigger="floating" />
      </nav>
      {settings.desktopNavigation === "floating" && (
        <nav
          ref={floatingNavRef}
          data-page-palette-preserve
          aria-label="Main navigation"
          className="fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-white/90 p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.22)] backdrop-blur-xl md:flex dark:border-slate-700/80 dark:bg-slate-900/90"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-0 rounded-full bg-linear-to-r from-[#7f22fe] to-[#c026d3] shadow-md shadow-violet-500/30 transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none"
            style={{
              width: floatingIndicator.width,
              height: floatingIndicator.height,
              transform: `translate3d(${floatingIndicator.left}px, ${floatingIndicator.top}px, 0)`,
            }}
          />
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = current.href === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
                className={`group relative z-10 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-[color,background-color,translate,scale] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.02] motion-reduce:transition-none ${active ? "text-white" : "text-slate-600 hover:bg-violet-500/10 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-400/10 dark:hover:text-violet-200"}`}
              >
                <Icon size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none" />
                {label}
              </Link>
            );
          })}
          <span
            aria-hidden="true"
            className="mx-1 h-6 w-px shrink-0 bg-slate-300/80 dark:bg-slate-600"
          />
          <LockButton onLock={lockApp} disabled={locking} compact />
          <SettingsPanel trigger="floating" compact />
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
            <div className="relative h-full w-0 overflow-hidden rounded-full bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-400 animate-lock-progress after:absolute after:inset-y-0 after:-left-1/3 after:w-1/3 after:bg-linear-to-r after:from-transparent after:via-white/45 after:to-transparent after:content-[''] after:animate-lock-progress-shimmer" />
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
