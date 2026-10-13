
const pagePaletteStyles = {
  violet: {
    label: "Lavender",
    swatch: "bg-[#C9B8D9]",
    accent: "#8D73A8",
    iconGradient: "from-[#8D73A8] to-[#B59ACB]",
    pageHeading:
      "from-[#59416D] via-[#76578F] to-[#9A7AB0] dark:from-[#E8DDF0] dark:via-[#D5C2E5] dark:to-[#BFA3D7]",
    featureHeader: {
      gradient: "from-[#76578F] via-[#8D73A8] to-[#A78ABC]",
      shadow: "shadow-[#B59ACB]/20",
      darkShadow: "dark:shadow-[#4C365E]/30",
      description: "text-white/85",
      glow: "bg-[#E8DDF0]/15",
    },
  },

  blue: {
    label: "Sky",
    swatch: "bg-[#BFD9E8]",
    accent: "#5686A2",
    iconGradient: "from-[#669BB9] to-[#8DBBD2]",
    pageHeading:
      "from-[#315C75] via-[#426F8A] to-[#669BB9] dark:from-[#DCECF5] dark:via-[#BFD9E8] dark:to-[#91BED5]",
    featureHeader: {
      gradient: "from-[#426F8A] via-[#5686A2] to-[#669BB9]",
      shadow: "shadow-[#8DBBD2]/20",
      darkShadow: "dark:shadow-[#203F52]/35",
      description: "text-white/90",
      glow: "bg-[#DCECF5]/15",
    },
  },

  teal: {
    label: "Sage",
    swatch: "bg-[#C8D8C0]",
    accent: "#587451",
    iconGradient: "from-[#829D77] to-[#A9BE9D]",
    pageHeading:
      "from-[#466044] via-[#587451] to-[#829D77] dark:from-[#E1EBDD] dark:via-[#C8D8C0] dark:to-[#A9BE9D]",
    featureHeader: {
      gradient: "from-[#466044] via-[#587451] to-[#829D77]",
      shadow: "shadow-[#A9BE9D]/20",
      darkShadow: "dark:shadow-[#293C28]/35",
      description: "text-white/90",
      glow: "bg-[#E1EBDD]/15",
    },
  },

  rose: {
    label: "Terracotta",
    swatch: "bg-[#E3B6A5]",
    accent: "#B66F57",
    iconGradient: "from-[#C47F67] to-[#D99B82]",
    pageHeading:
      "from-[#804D3D] via-[#995C49] to-[#C47F67] dark:from-[#F4E0D7] dark:via-[#E3B6A5] dark:to-[#D99B82]",
    featureHeader: {
      gradient: "from-[#995C49] via-[#B66F57] to-[#C47F67]",
      shadow: "shadow-[#D99B82]/20",
      darkShadow: "dark:shadow-[#593529]/35",
      description: "text-white/90",
      glow: "bg-[#F4E0D7]/15",
    },
  },

  yellow: {
    label: "Butter",
    swatch: "bg-[#F0DFA0]",
    accent: "#9B7B2E",
    iconGradient: "from-[#B99A43] to-[#D4B95E]",
    pageHeading:
      "from-[#80631C] via-[#9B7B2E] to-[#B99A43] dark:from-[#F8EDC8] dark:via-[#F0DFA0] dark:to-[#DCC775]",
    featureHeader: {
      gradient: "from-[#80631C] via-[#9B7B2E] to-[#B99A43]",
      shadow: "shadow-[#DCC775]/20",
      darkShadow: "dark:shadow-[#514015]/35",
      description: "text-white/95",
      glow: "bg-[#F8EDC8]/20",
    },
  },

  orange: {
    label: "Peach",
    swatch: "bg-[#F0C9A9]",
    accent: "#C07E53",
    iconGradient: "from-[#D99B72] to-[#E8B18A]",
    pageHeading:
      "from-[#8D5735] via-[#A96D47] to-[#C8865B] dark:from-[#F8E5D5] dark:via-[#F0C9A9] dark:to-[#E8B18A]",
    featureHeader: {
      gradient: "from-[#A96D47] via-[#C07E53] to-[#D99B72]",
      shadow: "shadow-[#E8B18A]/20",
      darkShadow: "dark:shadow-[#603B26]/35",
      description: "text-white/95",
      glow: "bg-[#F8E5D5]/20",
    },
  },

  gray: {
    label: "Stone",
    swatch: "bg-[#D2CEC5]",
    accent: "#817D73",
    iconGradient: "from-[#969187] to-[#B5B0A5]",
    pageHeading:
      "from-[#55534D] via-[#69665F] to-[#969187] dark:from-[#F0EEE9] dark:via-[#D2CEC5] dark:to-[#B5B0A5]",
    featureHeader: {
      gradient: "from-[#69665F] via-[#817D73] to-[#969187]",
      shadow: "shadow-[#B5B0A5]/20",
      darkShadow: "dark:shadow-[#36342F]/35",
      description: "text-white/90",
      glow: "bg-[#F0EEE9]/15",
    },
  },
} as const;


export type NamedPagePalette = keyof typeof pagePaletteStyles;
export type PagePalette = "default" | NamedPagePalette;

export const pagePaletteOptions: { value: NamedPagePalette; label: string; swatch: string }[] = [
	{ value: "violet", label: pagePaletteStyles.violet.label, swatch: pagePaletteStyles.violet.swatch },
	{ value: "blue", label: pagePaletteStyles.blue.label, swatch: pagePaletteStyles.blue.swatch },
	{ value: "teal", label: pagePaletteStyles.teal.label, swatch: pagePaletteStyles.teal.swatch },
	{ value: "rose", label: pagePaletteStyles.rose.label, swatch: pagePaletteStyles.rose.swatch },
	{ value: "yellow", label: pagePaletteStyles.yellow.label, swatch: pagePaletteStyles.yellow.swatch },
	{ value: "orange", label: pagePaletteStyles.orange.label, swatch: pagePaletteStyles.orange.swatch },
	{ value: "gray", label: pagePaletteStyles.gray.label, swatch: pagePaletteStyles.gray.swatch },
];

export function isPagePalette(value: unknown): value is PagePalette {
	return value === "default" || (typeof value === "string" && Object.prototype.hasOwnProperty.call(pagePaletteStyles, value));
}

export function getPagePaletteStyles(palette: NamedPagePalette) {
	return pagePaletteStyles[palette];
}
