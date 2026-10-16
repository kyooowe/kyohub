"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { DeleteIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { login } from "@/features/auth/actions/auth-actions";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const keyClass =
    "size-[68px] rounded-full border-0 bg-slate-50 text-xl font-medium text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all hover:bg-slate-100 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] active:scale-95 active:bg-slate-100 disabled:opacity-50";

export function PinGate() {
    const router = useRouter();

    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [pending, startTransition] = useTransition();

    const submit = useCallback(
        (value: string) => {
            startTransition(async () => {
                const result = await login(value);

                if (result.error) {
                    setError(result.error);
                    setPin("");
                    return;
                }

                router.refresh();
            });
        },
        [router],
    );

    const press = useCallback(
        (digit: string) => {
            if (pending) return;

            setError("");

            const next = (pin + digit).slice(0, PIN_LENGTH);

            setPin(next);

            if (next.length === PIN_LENGTH) {
                submit(next);
            }
        },
        [pin, pending, submit],
    );

    const erase = useCallback(() => {
        if (pending) return;

        setError("");
        setPin((current) => current.slice(0, -1));
    }, [pending]);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (/^\d$/.test(event.key)) {
                press(event.key);
            } else if (event.key === "Backspace") {
                erase();
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [press, erase]);

    return (
        <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-white">
            <div className="w-full max-w-sm px-6 py-10 sm:px-8">
                <div className="flex flex-col items-center">
                    {/* Brand */}
                    <div className="mb-12 flex flex-col items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="grid size-10 grid-cols-2 gap-1 rounded-[11px] bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 p-1.5 shadow-sm shadow-emerald-500/25">
                                <span className="rounded-[3px] bg-white" />
                                <span className="rounded-[3px] bg-white/60" />
                                <span className="rounded-[3px] bg-white/60" />
                                <span className="rounded-[3px] bg-white" />
                            </div>

                            <span className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
                                Kyohub.
                            </span>
                        </div>

                        <p className="mt-1 text-[13px] text-slate-400">
                            Your family space
                        </p>
                    </div>

                    {/* Heading */}
                    <div className="mb-7 text-center">
                        <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-slate-950">
                            Enter your PIN
                        </h1>

                        <p className="mt-1.5 text-sm text-slate-500">
                            Enter your 6-digit PIN to continue
                        </p>
                    </div>

                    {/* PIN indicator */}
                    <div
                        className="mb-3 flex h-7 items-center justify-center gap-3"
                        aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}
                    >
                        {Array.from({ length: PIN_LENGTH }, (_, index) => {
                            const filled = index < pin.length;

                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        "size-3 rounded-full border-2 transition-all duration-150",
                                        error
                                            ? "border-red-400 bg-red-400"
                                            : filled
                                              ? "scale-105 border-blue-600 bg-blue-600"
                                              : "border-slate-300 bg-white",
                                    )}
                                />
                            );
                        })}
                    </div>

                    {/* Status */}
                    <div className="mb-8 flex h-5 items-center justify-center">
                        {pending ? (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Unlocking...</span>
                            </div>
                        ) : error ? (
                            <p
                                role="alert"
                                className="text-sm font-medium text-red-500"
                            >
                                {error}
                            </p>
                        ) : (
                            <span className="text-sm text-transparent">
                                Enter your PIN
                            </span>
                        )}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                        {KEYS.map((key) => (
                            <Button
                                key={key}
                                type="button"
                                variant="ghost"
                                className={keyClass}
                                disabled={pending}
                                onClick={() => press(key)}
                            >
                                {key}
                            </Button>
                        ))}

                        {/* Empty */}
                        <span aria-hidden="true" />

                        {/* Zero */}
                        <Button
                            type="button"
                            variant="ghost"
                            className={keyClass}
                            disabled={pending}
                            onClick={() => press("0")}
                        >
                            0
                        </Button>

                        {/* Delete */}
                        <Button
                            type="button"
                            variant="ghost"
                            aria-label="Delete"
                            className={cn(
                                keyClass,
                                "text-slate-500 hover:text-slate-900",
                            )}
                            disabled={pending}
                            onClick={erase}
                        >
                            <DeleteIcon className="size-[21px]" strokeWidth={1.8} />
                        </Button>
                    </div>

                    {/* Tutorial link for new deployers */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/deploy"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400"
                        >
                            <span>Self-hosting KyoHub? View deployment guide</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
