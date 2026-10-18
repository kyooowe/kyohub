"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { cn } from "cn";
import { getPagePaletteStyles, type NamedPagePalette } from "@/components/settings/page-palettes";
import { getActivePagePalette, useAppSettings, type PagePalette } from "@/components/settings/settings-context";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;
const DialogClose = DialogPrimitive.Close;

type DialogContentProps = DialogPrimitive.Popup.Props & {
  pagePalette?: PagePalette | null;
};

function DialogContent({
  className,
  children,
  pagePalette: paletteOverride,
  ...props
}: DialogContentProps) {
  const pathname = usePathname();
  const { settings } = useAppSettings();
  const resolvedPalette: NamedPagePalette | null = paletteOverride === null
    ? null
    : paletteOverride !== undefined
      ? (paletteOverride === "default" ? getActivePagePalette(pathname, settings) : paletteOverride)
      : getActivePagePalette(pathname, settings);
  const paletteAccent = resolvedPalette
    ? getPagePaletteStyles(resolvedPalette).accent
    : undefined;

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
        <DialogPrimitive.Popup
          className={cn(
            "relative w-full border bg-white p-6 text-slate-900 shadow-2xl shadow-slate-950/20 outline-none transition-all data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-slate-900 dark:text-slate-100",
            "max-w-md rounded-xl data-ending-style:scale-95 data-starting-style:scale-95",
            className,
          )}
          {...props}
          data-page-palette={resolvedPalette ?? undefined}
          style={{
            ...(props.style ?? {}),
            ...(paletteAccent ? { "--page-accent-base": paletteAccent, "--action-accent": paletteAccent } as CSSProperties : {}),
          }}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
};
