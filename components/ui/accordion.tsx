"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cn } from "cn";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
	return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b border-violet-100 dark:border-slate-800", className)} {...props} />;
}

function AccordionHeader({ className, ...props }: AccordionPrimitive.Header.Props) {
	return <AccordionPrimitive.Header data-slot="accordion-header" className={cn("m-0", className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
	return (
		<AccordionPrimitive.Trigger
			data-slot="accordion-trigger"
			className={cn("group flex w-full items-center justify-between gap-4 rounded-xl py-2 text-left outline-none transition-colors hover:bg-violet-50/70 focus-visible:ring-2 focus-visible:ring-violet-400 dark:hover:bg-slate-900/70", className)}
			{...props}
		>
			{children}
		</AccordionPrimitive.Trigger>
	);
}

function AccordionPanel({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
	return (
		<AccordionPrimitive.Panel
			data-slot="accordion-panel"
			className={cn("h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0", className)}
			{...props}
		>
			<div className="pb-4 pt-2">{children}</div>
		</AccordionPrimitive.Panel>
	);
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger };
