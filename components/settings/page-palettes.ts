const pagePaletteStyles = {
  kyohub: {
    label: "KyoHub",
    swatch: "bg-[#26A69A]",
    accent: "#17756D",
    iconGradient: "from-[#0c2340] via-[#17756D] to-[#26A69A]",
    pageHeading:
      "from-[#0c2340] via-[#17756D] to-[#26A69A] dark:from-[#E0F2F1] dark:via-[#80CBC4] dark:to-[#4DB6AC]",
    featureHeader: {
      gradient: "from-[#0c2340] via-[#17756D] to-[#26A69A]",
      shadow: "shadow-[#26A69A]/25",
      darkShadow: "dark:shadow-[#0c2340]/40",
      description: "text-white/95",
      glow: "bg-[#E0F2F1]/20",
    },
  },

  violet: {
    label: "Pastel Purple",
    swatch: "bg-[#C9B8D9]",
    accent: "#8D73A8",
    iconGradient: "from-[#59416D] via-[#76578F] to-[#9A7AB0]",
    pageHeading:
      "from-[#59416D] via-[#76578F] to-[#9A7AB0] dark:from-[#E8DDF0] dark:via-[#D5C2E5] dark:to-[#BFA3D7]",
    featureHeader: {
      gradient: "from-[#59416D] via-[#76578F] to-[#9A7AB0]",
      shadow: "shadow-[#B59ACB]/20",
      darkShadow: "dark:shadow-[#4C365E]/30",
      description: "text-white/85",
      glow: "bg-[#E8DDF0]/15",
    },
  },

  blue: {
    label: "Pastel Blue",
    swatch: "bg-[#BFD9E8]",
    accent: "#5686A2",
    iconGradient: "from-[#315C75] via-[#426F8A] to-[#669BB9]",
    pageHeading:
      "from-[#315C75] via-[#426F8A] to-[#669BB9] dark:from-[#DCECF5] dark:via-[#BFD9E8] dark:to-[#91BED5]",
    featureHeader: {
      gradient: "from-[#315C75] via-[#426F8A] to-[#669BB9]",
      shadow: "shadow-[#8DBBD2]/20",
      darkShadow: "dark:shadow-[#203F52]/35",
      description: "text-white/90",
      glow: "bg-[#DCECF5]/15",
    },
  },

  teal: {
    label: "Muted Green",
    swatch: "bg-[#AFC2A6]",
    accent: "#466044",
    iconGradient: "from-[#354B33] via-[#466044] to-[#6F8965]",
    pageHeading:
      "from-[#354B33] via-[#466044] to-[#6F8965] dark:from-[#E1EBDD] dark:via-[#C8D8C0] dark:to-[#A9BE9D]",
    featureHeader: {
      gradient: "from-[#354B33] via-[#466044] to-[#6F8965]",
      shadow: "shadow-[#91A987]/20",
      darkShadow: "dark:shadow-[#293C28]/35",
      description: "text-white/90",
      glow: "bg-[#E1EBDD]/15",
    },
  },

  rose: {
    label: "Earthy Terracotta",
    swatch: "bg-[#E3B6A5]",
    accent: "#B66F57",
    iconGradient: "from-[#804D3D] via-[#995C49] to-[#C47F67]",
    pageHeading:
      "from-[#804D3D] via-[#995C49] to-[#C47F67] dark:from-[#F4E0D7] dark:via-[#E3B6A5] dark:to-[#D99B82]",
    featureHeader: {
      gradient: "from-[#804D3D] via-[#995C49] to-[#C47F67]",
      shadow: "shadow-[#D99B82]/20",
      darkShadow: "dark:shadow-[#593529]/35",
      description: "text-white/90",
      glow: "bg-[#F4E0D7]/15",
    },
  },

  yellow: {
    label: "Pastel Yellow",
    swatch: "bg-[#F0DFA0]",
    accent: "#9B7B2E",
    iconGradient: "from-[#80631C] via-[#9B7B2E] to-[#B99A43]",
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
    label: "Pastel Peach",
    swatch: "bg-[#F0C9A9]",
    accent: "#C07E53",
    iconGradient: "from-[#8D5735] via-[#A96D47] to-[#C8865B]",
    pageHeading:
      "from-[#8D5735] via-[#A96D47] to-[#C8865B] dark:from-[#F8E5D5] dark:via-[#F0C9A9] dark:to-[#E8B18A]",
    featureHeader: {
      gradient: "from-[#8D5735] via-[#A96D47] to-[#C8865B]",
      shadow: "shadow-[#E8B18A]/20",
      darkShadow: "dark:shadow-[#603B26]/35",
      description: "text-white/95",
      glow: "bg-[#F8E5D5]/20",
    },
  },

  gray: {
    label: "Neutral Gray",
    swatch: "bg-[#D2CEC5]",
    accent: "#817D73",
    iconGradient: "from-[#55534D] via-[#69665F] to-[#969187]",
    pageHeading:
      "from-[#55534D] via-[#69665F] to-[#969187] dark:from-[#F0EEE9] dark:via-[#D2CEC5] dark:to-[#B5B0A5]",
    featureHeader: {
      gradient: "from-[#55534D] via-[#69665F] to-[#969187]",
      shadow: "shadow-[#B5B0A5]/20",
      darkShadow: "dark:shadow-[#36342F]/35",
      description: "text-white/90",
      glow: "bg-[#F0EEE9]/15",
    },
  },
  mint: {
    label: "Pastel Mint",
    swatch: "bg-[#A8D9BB]",
    accent: "#529B72",
    iconGradient: "from-[#285D42] via-[#397B55] to-[#529B72]",
    pageHeading:
      "from-[#285D42] via-[#397B55] to-[#529B72] dark:from-[#E0F4E8] dark:via-[#BFE7CB] dark:to-[#82C99A]",
    featureHeader: {
      gradient: "from-[#285D42] via-[#397B55] to-[#529B72]",
      shadow: "shadow-[#82C99A]/25",
      darkShadow: "dark:shadow-[#183D2A]/35",
      description: "text-white",
      glow: "bg-[#E0F4E8]/20",
    },
  },
  coral: {
    label: "Warm Coral",
    swatch: "bg-[#FFAA99]",
    accent: "#E56B5D",
    iconGradient: "from-[#963F38] via-[#C65349] to-[#E56B5D]",
    pageHeading:
      "from-[#963F38] via-[#C65349] to-[#E56B5D] dark:from-[#FFE1D9] dark:via-[#FFC1B3] dark:to-[#FF9B87]",
    featureHeader: {
      gradient: "from-[#963F38] via-[#C65349] to-[#E56B5D]",
      shadow: "shadow-[#FF9B87]/25",
      darkShadow: "dark:shadow-[#552620]/35",
      description: "text-white",
      glow: "bg-[#FFE1D9]/20",
    },
  },
  berry: {
    label: "Pastel Pink",
    swatch: "bg-[#E8ADC7]",
    accent: "#C05C87",
    iconGradient: "from-[#78324F] via-[#A74770] to-[#C05C87]",
    pageHeading:
      "from-[#78324F] via-[#A74770] to-[#C05C87] dark:from-[#F9E0EB] dark:via-[#F0C6D9] dark:to-[#E18CAF]",
    featureHeader: {
      gradient: "from-[#78324F] via-[#A74770] to-[#C05C87]",
      shadow: "shadow-[#E18CAF]/25",
      darkShadow: "dark:shadow-[#482037]/35",
      description: "text-white",
      glow: "bg-[#F9E0EB]/20",
    },
  },
  ocean: {
    label: "Cool Teal",
    swatch: "bg-[#94D0CA]",
    accent: "#398F89",
    iconGradient: "from-[#205653] via-[#2C7772] to-[#398F89]",
    pageHeading:
      "from-[#205653] via-[#2C7772] to-[#398F89] dark:from-[#D7F0EE] dark:via-[#B0E2DE] dark:to-[#65B8B0]",
    featureHeader: {
      gradient: "from-[#205653] via-[#2C7772] to-[#398F89]",
      shadow: "shadow-[#65B8B0]/25",
      darkShadow: "dark:shadow-[#153D3A]/35",
      description: "text-white",
      glow: "bg-[#D7F0EE]/20",
    },
  },
  honeyGold: {
    label: "Golden Warmth",
    swatch: "bg-[#E8C77E]",
    accent: "#A87924",
    iconGradient: "from-[#71501C] via-[#A87924] to-[#D8AD50]",
    pageHeading:
      "from-[#71501C] via-[#A87924] to-[#D8AD50] dark:from-[#FFF5D9] dark:via-[#E8C77E] dark:to-[#D8AD50]",
    featureHeader: {
      gradient: "from-[#71501C] via-[#A87924] to-[#D8AD50]",
      shadow: "shadow-[#D8AD50]/25",
      darkShadow: "dark:shadow-[#493512]/35",
      description: "text-white",
      glow: "bg-[#FFF5D9]/20",
    },
  },
  berryRose: {
    label: "Dusty Rose",
    swatch: "bg-[#DDA8B8]",
    accent: "#984761",
    iconGradient: "from-[#642B40] via-[#984761] to-[#C77891]",
    pageHeading:
      "from-[#642B40] via-[#984761] to-[#C77891] dark:from-[#FFF0F4] dark:via-[#DDA8B8] dark:to-[#C77891]",
    featureHeader: {
      gradient: "from-[#642B40] via-[#984761] to-[#C77891]",
      shadow: "shadow-[#C77891]/25",
      darkShadow: "dark:shadow-[#3D1C29]/35",
      description: "text-white",
      glow: "bg-[#FFF0F4]/20",
    },
  },
  mistyBlue: {
    label: "Muted Blue",
    swatch: "bg-[#B5CDE5]",
    accent: "#416C9B",
    iconGradient: "from-[#29466B] via-[#416C9B] to-[#7FA6CE]",
    pageHeading:
      "from-[#29466B] via-[#416C9B] to-[#7FA6CE] dark:from-[#EFF6FF] dark:via-[#B5CDE5] dark:to-[#7FA6CE]",
    featureHeader: {
      gradient: "from-[#29466B] via-[#416C9B] to-[#7FA6CE]",
      shadow: "shadow-[#7FA6CE]/25",
      darkShadow: "dark:shadow-[#1B2F48]/35",
      description: "text-white",
      glow: "bg-[#EFF6FF]/20",
    },
  },
  warmSand: {
    label: "Earth Tone",
    swatch: "bg-[#DCC6A5]",
    accent: "#8A6744",
    iconGradient: "from-[#59402D] via-[#8A6744] to-[#BE9B70]",
    pageHeading:
      "from-[#59402D] via-[#8A6744] to-[#BE9B70] dark:from-[#FFF5E8] dark:via-[#DCC6A5] dark:to-[#BE9B70]",
    featureHeader: {
      gradient: "from-[#59402D] via-[#8A6744] to-[#BE9B70]",
      shadow: "shadow-[#BE9B70]/25",
      darkShadow: "dark:shadow-[#382719]/35",
      description: "text-white",
      glow: "bg-[#FFF5E8]/20",
    },
  },
  dustyLavender: {
    label: "Muted Purple",
    swatch: "bg-[#C5B8DE]",
    accent: "#76619F",
    iconGradient: "from-[#49365F] via-[#76619F] to-[#A99ACB]",
    pageHeading:
      "from-[#49365F] via-[#76619F] to-[#A99ACB] dark:from-[#F5F0FF] dark:via-[#C5B8DE] dark:to-[#A99ACB]",
    featureHeader: {
      gradient: "from-[#49365F] via-[#76619F] to-[#A99ACB]",
      shadow: "shadow-[#A99ACB]/25",
      darkShadow: "dark:shadow-[#2A203B]/35",
      description: "text-white",
      glow: "bg-[#F5F0FF]/20",
    },
  },
  oliveCream: {
    label: "Olive Earth Tone",
    swatch: "bg-[#C9D0A1]",
    accent: "#69743B",
    iconGradient: "from-[#3F4927] via-[#69743B] to-[#A2AD67]",
    pageHeading:
      "from-[#3F4927] via-[#69743B] to-[#A2AD67] dark:from-[#F5F6E5] dark:via-[#C9D0A1] dark:to-[#A2AD67]",
    featureHeader: {
      gradient: "from-[#3F4927] via-[#69743B] to-[#A2AD67]",
      shadow: "shadow-[#A2AD67]/25",
      darkShadow: "dark:shadow-[#292F19]/35",
      description: "text-white",
      glow: "bg-[#F5F6E5]/20",
    },
  },
  buttercream: {
    label: "Butter Pastel",
    swatch: "bg-[#F4DFA6]",
    accent: "#B58A35",
    iconGradient: "from-[#74551F] via-[#B58A35] to-[#DDB75F]",
    pageHeading:
      "from-[#74551F] via-[#B58A35] to-[#DDB75F] dark:from-[#FFF9E9] dark:via-[#F4DFA6] dark:to-[#E2BD69]",
    featureHeader: {
      gradient: "from-[#74551F] via-[#B58A35] to-[#DDB75F]",
      shadow: "shadow-[#E2BD69]/25",
      darkShadow: "dark:shadow-[#493614]/35",
      description: "text-white",
      glow: "bg-[#FFF9E9]/25",
    },
  },
  powderLilac: {
    label: "Lilac Pastel",
    swatch: "bg-[#D8CCF0]",
    accent: "#8066B0",
    iconGradient: "from-[#4D3A70] via-[#8066B0] to-[#B2A0D8]",
    pageHeading:
      "from-[#4D3A70] via-[#8066B0] to-[#B2A0D8] dark:from-[#F7F2FF] dark:via-[#D8CCF0] dark:to-[#B2A0D8]",
    featureHeader: {
      gradient: "from-[#4D3A70] via-[#8066B0] to-[#B2A0D8]",
      shadow: "shadow-[#B2A0D8]/25",
      darkShadow: "dark:shadow-[#302343]/35",
      description: "text-white",
      glow: "bg-[#F7F2FF]/25",
    },
  },
  mintCloud: {
    label: "Mint Pastel",
    swatch: "bg-[#C6E8D8]",
    accent: "#43876B",
    iconGradient: "from-[#285743] via-[#43876B] to-[#83C4A6]",
    pageHeading:
      "from-[#285743] via-[#43876B] to-[#83C4A6] dark:from-[#EFFBF4] dark:via-[#C6E8D8] dark:to-[#83C4A6]",
    featureHeader: {
      gradient: "from-[#285743] via-[#43876B] to-[#83C4A6]",
      shadow: "shadow-[#83C4A6]/25",
      darkShadow: "dark:shadow-[#193B2B]/35",
      description: "text-white",
      glow: "bg-[#EFFBF4]/25",
    },
  },
  pinkCloud: {
    label: "Pink Pastel",
    swatch: "bg-[#F4C9D6]",
    accent: "#B85275",
    iconGradient: "from-[#713047] via-[#B85275] to-[#E59BB4]",
    pageHeading:
      "from-[#713047] via-[#B85275] to-[#E59BB4] dark:from-[#FFF2F6] dark:via-[#F4C9D6] dark:to-[#E59BB4]",
    featureHeader: {
      gradient: "from-[#713047] via-[#B85275] to-[#E59BB4]",
      shadow: "shadow-[#E59BB4]/25",
      darkShadow: "dark:shadow-[#421B2A]/35",
      description: "text-white",
      glow: "bg-[#FFF2F6]/25",
    },
  },
  babyBlue: {
    label: "Baby Blue Pastel",
    swatch: "bg-[#C7DFF5]",
    accent: "#4D7FAE",
    iconGradient: "from-[#2F5278] via-[#4D7FAE] to-[#91BDE5]",
    pageHeading:
      "from-[#2F5278] via-[#4D7FAE] to-[#91BDE5] dark:from-[#F1F8FF] dark:via-[#C7DFF5] dark:to-[#91BDE5]",
    featureHeader: {
      gradient: "from-[#2F5278] via-[#4D7FAE] to-[#91BDE5]",
      shadow: "shadow-[#91BDE5]/25",
      darkShadow: "dark:shadow-[#1D354C]/35",
      description: "text-white",
      glow: "bg-[#F1F8FF]/25",
    },
  },
  apricotCream: {
    label: "Apricot Pastel",
    swatch: "bg-[#F6D0B5]",
    accent: "#BC754A",
    iconGradient: "from-[#77452C] via-[#BC754A] to-[#E8AB7F]",
    pageHeading:
      "from-[#77452C] via-[#BC754A] to-[#E8AB7F] dark:from-[#FFF5EC] dark:via-[#F6D0B5] dark:to-[#E8AB7F]",
    featureHeader: {
      gradient: "from-[#77452C] via-[#BC754A] to-[#E8AB7F]",
      shadow: "shadow-[#E8AB7F]/25",
      darkShadow: "dark:shadow-[#47291A]/35",
      description: "text-white",
      glow: "bg-[#FFF5EC]/25",
    },
  },
  warmCoral: {
    label: "Warm Coral",
    swatch: "bg-[#F2B3A6]",
    accent: "#B85D4D",
    iconGradient: "from-[#7C342D] via-[#A94F42] to-[#D98472]",
    pageHeading:
      "from-[#7C342D] via-[#A94F42] to-[#D98472] dark:from-[#FBE8E2] dark:via-[#F2B3A6] dark:to-[#D98472]",
    featureHeader: {
      gradient: "from-[#7C342D] via-[#A94F42] to-[#D98472]",
      shadow: "shadow-[#D98472]/25",
      darkShadow: "dark:shadow-[#7C342D]/35",
      description: "text-white",
      glow: "bg-[#FBE8E2]/20",
    },
  },
  warmAmber: {
    label: "Warm Amber",
    swatch: "bg-[#F0CF8B]",
    accent: "#A87924",
    iconGradient: "from-[#71501C] via-[#A87924] to-[#D8AD50]",
    pageHeading:
      "from-[#71501C] via-[#A87924] to-[#D8AD50] dark:from-[#FFF3D3] dark:via-[#F0CF8B] dark:to-[#D8AD50]",
    featureHeader: {
      gradient: "from-[#71501C] via-[#A87924] to-[#D8AD50]",
      shadow: "shadow-[#D8AD50]/25",
      darkShadow: "dark:shadow-[#71501C]/35",
      description: "text-white",
      glow: "bg-[#FFF3D3]/20",
    },
  },
  warmTerracotta: {
    label: "Warm Terracotta",
    swatch: "bg-[#E2B19A]",
    accent: "#A95F46",
    iconGradient: "from-[#743D2D] via-[#A95F46] to-[#CF896A]",
    pageHeading:
      "from-[#743D2D] via-[#A95F46] to-[#CF896A] dark:from-[#F8E4D9] dark:via-[#E2B19A] dark:to-[#CF896A]",
    featureHeader: {
      gradient: "from-[#743D2D] via-[#A95F46] to-[#CF896A]",
      shadow: "shadow-[#CF896A]/25",
      darkShadow: "dark:shadow-[#743D2D]/35",
      description: "text-white",
      glow: "bg-[#F8E4D9]/20",
    },
  },
  coolIceBlue: {
    label: "Cool Ice Blue",
    swatch: "bg-[#C7E3F2]",
    accent: "#4D87A8",
    iconGradient: "from-[#28516B] via-[#4D87A8] to-[#78B1CF]",
    pageHeading:
      "from-[#28516B] via-[#4D87A8] to-[#78B1CF] dark:from-[#EDF8FE] dark:via-[#C7E3F2] dark:to-[#78B1CF]",
    featureHeader: {
      gradient: "from-[#28516B] via-[#4D87A8] to-[#78B1CF]",
      shadow: "shadow-[#78B1CF]/25",
      darkShadow: "dark:shadow-[#28516B]/35",
      description: "text-white",
      glow: "bg-[#EDF8FE]/20",
    },
  },
  coolSeafoam: {
    label: "Cool Seafoam",
    swatch: "bg-[#B9E0D8]",
    accent: "#39877D",
    iconGradient: "from-[#20554F] via-[#39877D] to-[#70B9AD]",
    pageHeading:
      "from-[#20554F] via-[#39877D] to-[#70B9AD] dark:from-[#E7F7F3] dark:via-[#B9E0D8] dark:to-[#70B9AD]",
    featureHeader: {
      gradient: "from-[#20554F] via-[#39877D] to-[#70B9AD]",
      shadow: "shadow-[#70B9AD]/25",
      darkShadow: "dark:shadow-[#20554F]/35",
      description: "text-white",
      glow: "bg-[#E7F7F3]/20",
    },
  },
  coolPeriwinkle: {
    label: "Cool Periwinkle",
    swatch: "bg-[#C8D0F0]",
    accent: "#6979B8",
    iconGradient: "from-[#384577] via-[#6979B8] to-[#929FE0]",
    pageHeading:
      "from-[#384577] via-[#6979B8] to-[#929FE0] dark:from-[#F0F2FF] dark:via-[#C8D0F0] dark:to-[#929FE0]",
    featureHeader: {
      gradient: "from-[#384577] via-[#6979B8] to-[#929FE0]",
      shadow: "shadow-[#929FE0]/25",
      darkShadow: "dark:shadow-[#384577]/35",
      description: "text-white",
      glow: "bg-[#F0F2FF]/20",
    },
  },
  neutralStone: {
    label: "Neutral Stone",
    swatch: "bg-[#D7D2C8]",
    accent: "#77736A",
    iconGradient: "from-[#4D4A43] via-[#77736A] to-[#A6A095]",
    pageHeading:
      "from-[#4D4A43] via-[#77736A] to-[#A6A095] dark:from-[#F2F0EA] dark:via-[#D7D2C8] dark:to-[#A6A095]",
    featureHeader: {
      gradient: "from-[#4D4A43] via-[#77736A] to-[#A6A095]",
      shadow: "shadow-[#A6A095]/25",
      darkShadow: "dark:shadow-[#4D4A43]/35",
      description: "text-white",
      glow: "bg-[#F2F0EA]/20",
    },
  },
  neutralSlate: {
    label: "Neutral Slate",
    swatch: "bg-[#C9D0D8]",
    accent: "#5F7184",
    iconGradient: "from-[#344454] via-[#5F7184] to-[#8EA0B3]",
    pageHeading:
      "from-[#344454] via-[#5F7184] to-[#8EA0B3] dark:from-[#EEF2F6] dark:via-[#C9D0D8] dark:to-[#8EA0B3]",
    featureHeader: {
      gradient: "from-[#344454] via-[#5F7184] to-[#8EA0B3]",
      shadow: "shadow-[#8EA0B3]/25",
      darkShadow: "dark:shadow-[#344454]/35",
      description: "text-white",
      glow: "bg-[#EEF2F6]/20",
    },
  },
  neutralTaupe: {
    label: "Neutral Taupe",
    swatch: "bg-[#D8C8B8]",
    accent: "#8B7461",
    iconGradient: "from-[#584535] via-[#8B7461] to-[#B29A84]",
    pageHeading:
      "from-[#584535] via-[#8B7461] to-[#B29A84] dark:from-[#F5EEE7] dark:via-[#D8C8B8] dark:to-[#B29A84]",
    featureHeader: {
      gradient: "from-[#584535] via-[#8B7461] to-[#B29A84]",
      shadow: "shadow-[#B29A84]/25",
      darkShadow: "dark:shadow-[#584535]/35",
      description: "text-white",
      glow: "bg-[#F5EEE7]/20",
    },
  },
  pastelPink: {
    label: "Pastel Pink",
    swatch: "bg-[#F5C9D7]",
    accent: "#B95D7C",
    iconGradient: "from-[#743047] via-[#B95D7C] to-[#E49BB4]",
    pageHeading:
      "from-[#743047] via-[#B95D7C] to-[#E49BB4] dark:from-[#FFF0F5] dark:via-[#F5C9D7] dark:to-[#E49BB4]",
    featureHeader: {
      gradient: "from-[#743047] via-[#B95D7C] to-[#E49BB4]",
      shadow: "shadow-[#E49BB4]/25",
      darkShadow: "dark:shadow-[#743047]/35",
      description: "text-white",
      glow: "bg-[#FFF0F5]/20",
    },
  },
  pastelMint: {
    label: "Pastel Mint",
    swatch: "bg-[#C6E8D8]",
    accent: "#4D9275",
    iconGradient: "from-[#285743] via-[#4D9275] to-[#83C4A6]",
    pageHeading:
      "from-[#285743] via-[#4D9275] to-[#83C4A6] dark:from-[#EFFBF4] dark:via-[#C6E8D8] dark:to-[#83C4A6]",
    featureHeader: {
      gradient: "from-[#285743] via-[#4D9275] to-[#83C4A6]",
      shadow: "shadow-[#83C4A6]/25",
      darkShadow: "dark:shadow-[#285743]/35",
      description: "text-white",
      glow: "bg-[#EFFBF4]/20",
    },
  },
  pastelLilac: {
    label: "Pastel Lilac",
    swatch: "bg-[#DCCFF0]",
    accent: "#8870B4",
    iconGradient: "from-[#49365F] via-[#8870B4] to-[#B3A0D8]",
    pageHeading:
      "from-[#49365F] via-[#8870B4] to-[#B3A0D8] dark:from-[#F6F1FF] dark:via-[#DCCFF0] dark:to-[#B3A0D8]",
    featureHeader: {
      gradient: "from-[#49365F] via-[#8870B4] to-[#B3A0D8]",
      shadow: "shadow-[#B3A0D8]/25",
      darkShadow: "dark:shadow-[#49365F]/35",
      description: "text-white",
      glow: "bg-[#F6F1FF]/20",
    },
  },
  earthyOlive: {
    label: "Earthy Olive",
    swatch: "bg-[#CDD2A5]",
    accent: "#6D783F",
    iconGradient: "from-[#414A27] via-[#6D783F] to-[#A3AE68]",
    pageHeading:
      "from-[#414A27] via-[#6D783F] to-[#A3AE68] dark:from-[#F4F5E4] dark:via-[#CDD2A5] dark:to-[#A3AE68]",
    featureHeader: {
      gradient: "from-[#414A27] via-[#6D783F] to-[#A3AE68]",
      shadow: "shadow-[#A3AE68]/25",
      darkShadow: "dark:shadow-[#414A27]/35",
      description: "text-white",
      glow: "bg-[#F4F5E4]/20",
    },
  },
  earthyClay: {
    label: "Earthy Clay",
    swatch: "bg-[#DDB6A0]",
    accent: "#A66B50",
    iconGradient: "from-[#693D2C] via-[#A66B50] to-[#C68A6C]",
    pageHeading:
      "from-[#693D2C] via-[#A66B50] to-[#C68A6C] dark:from-[#F6E7DE] dark:via-[#DDB6A0] dark:to-[#C68A6C]",
    featureHeader: {
      gradient: "from-[#693D2C] via-[#A66B50] to-[#C68A6C]",
      shadow: "shadow-[#C68A6C]/25",
      darkShadow: "dark:shadow-[#693D2C]/35",
      description: "text-white",
      glow: "bg-[#F6E7DE]/20",
    },
  },
  earthySand: {
    label: "Earthy Sand",
    swatch: "bg-[#E0CBA9]",
    accent: "#8D704C",
    iconGradient: "from-[#59412D] via-[#8D704C] to-[#B99A70]",
    pageHeading:
      "from-[#59412D] via-[#8D704C] to-[#B99A70] dark:from-[#FFF5E7] dark:via-[#E0CBA9] dark:to-[#B99A70]",
    featureHeader: {
      gradient: "from-[#59412D] via-[#8D704C] to-[#B99A70]",
      shadow: "shadow-[#B99A70]/25",
      darkShadow: "dark:shadow-[#59412D]/35",
      description: "text-white",
      glow: "bg-[#FFF5E7]/20",
    },
  },
  vibrantCobalt: {
    label: "Vibrant Cobalt",
    swatch: "bg-[#AFC9F5]",
    accent: "#315FC0",
    iconGradient: "from-[#193777] via-[#315FC0] to-[#6E95E8]",
    pageHeading:
      "from-[#193777] via-[#315FC0] to-[#6E95E8] dark:from-[#EAF1FF] dark:via-[#AFC9F5] dark:to-[#6E95E8]",
    featureHeader: {
      gradient: "from-[#193777] via-[#315FC0] to-[#6E95E8]",
      shadow: "shadow-[#6E95E8]/25",
      darkShadow: "dark:shadow-[#193777]/35",
      description: "text-white",
      glow: "bg-[#EAF1FF]/20",
    },
  },
  vibrantMagenta: {
    label: "Vibrant Magenta",
    swatch: "bg-[#F0B3D7]",
    accent: "#B52D83",
    iconGradient: "from-[#671749] via-[#B52D83] to-[#DE69B0]",
    pageHeading:
      "from-[#671749] via-[#B52D83] to-[#DE69B0] dark:from-[#FDEAF5] dark:via-[#F0B3D7] dark:to-[#DE69B0]",
    featureHeader: {
      gradient: "from-[#671749] via-[#B52D83] to-[#DE69B0]",
      shadow: "shadow-[#DE69B0]/25",
      darkShadow: "dark:shadow-[#671749]/35",
      description: "text-white",
      glow: "bg-[#FDEAF5]/20",
    },
  },
  vibrantTangerine: {
    label: "Vibrant Tangerine",
    swatch: "bg-[#F6C09A]",
    accent: "#C7652D",
    iconGradient: "from-[#733416] via-[#C7652D] to-[#E9945A]",
    pageHeading:
      "from-[#733416] via-[#C7652D] to-[#E9945A] dark:from-[#FFF0E3] dark:via-[#F6C09A] dark:to-[#E9945A]",
    featureHeader: {
      gradient: "from-[#733416] via-[#C7652D] to-[#E9945A]",
      shadow: "shadow-[#E9945A]/25",
      darkShadow: "dark:shadow-[#733416]/35",
      description: "text-white",
      glow: "bg-[#FFF0E3]/20",
    },
  },
  dopaminePop: {
    label: "Dopamine Pop",
    swatch: "bg-[#FFB3D9]",
    accent: "#D92D91",
    iconGradient: "from-[#7A1554] via-[#D92D91] to-[#FF66B3]",
    pageHeading:
      "from-[#7A1554] via-[#D92D91] to-[#FF66B3] dark:from-[#FFF0F8] dark:via-[#FFB3D9] dark:to-[#FF66B3]",
    featureHeader: {
      gradient: "from-[#7A1554] via-[#D92D91] to-[#FF66B3]",
      shadow: "shadow-[#FF66B3]/25",
      darkShadow: "dark:shadow-[#4A1035]/35",
      description: "text-white",
      glow: "bg-[#FFF0F8]/20",
    },
  },
  dopamineCandy: {
    label: "Dopamine Candy",
    swatch: "bg-[#FFE08A]",
    accent: "#E67E22",
    iconGradient: "from-[#804015] via-[#E67E22] to-[#FFB347]",
    pageHeading:
      "from-[#804015] via-[#E67E22] to-[#FFB347] dark:from-[#FFF4D6] dark:via-[#FFE08A] dark:to-[#FFB347]",
    featureHeader: {
      gradient: "from-[#804015] via-[#E67E22] to-[#FFB347]",
      shadow: "shadow-[#FFB347]/25",
      darkShadow: "dark:shadow-[#4A260D]/35",
      description: "text-white",
      glow: "bg-[#FFF4D6]/20",
    },
  },
  dopamineElectric: {
    label: "Dopamine Electric",
    swatch: "bg-[#B8F3FF]",
    accent: "#007FA8",
    iconGradient: "from-[#064B70] via-[#007FA8] to-[#35C9E8]",
    pageHeading:
      "from-[#064B70] via-[#007FA8] to-[#35C9E8] dark:from-[#E5FAFF] dark:via-[#B8F3FF] dark:to-[#35C9E8]",
    featureHeader: {
      gradient: "from-[#064B70] via-[#007FA8] to-[#35C9E8]",
      shadow: "shadow-[#35C9E8]/25",
      darkShadow: "dark:shadow-[#032D45]/35",
      description: "text-white",
      glow: "bg-[#E5FAFF]/20",
    },
  },
  metallicSilver: {
    label: "Metallic Silver",
    swatch: "bg-[#D5D9E0]",
    accent: "#717985",
    iconGradient: "from-[#353B45] via-[#717985] to-[#B8C0CC]",
    pageHeading:
      "from-[#353B45] via-[#717985] to-[#B8C0CC] dark:from-[#F3F5F8] dark:via-[#D5D9E0] dark:to-[#B8C0CC]",
    featureHeader: {
      gradient: "from-[#353B45] via-[#717985] to-[#B8C0CC]",
      shadow: "shadow-[#B8C0CC]/25",
      darkShadow: "dark:shadow-[#222831]/35",
      description: "text-white",
      glow: "bg-[#F3F5F8]/20",
    },
  },
  metallicGold: {
    label: "Metallic Gold",
    swatch: "bg-[#E8CB83]",
    accent: "#A87924",
    iconGradient: "from-[#65430E] via-[#A87924] to-[#D8AD50]",
    pageHeading:
      "from-[#65430E] via-[#A87924] to-[#D8AD50] dark:from-[#FFF5D9] dark:via-[#E8CB83] dark:to-[#D8AD50]",
    featureHeader: {
      gradient: "from-[#65430E] via-[#A87924] to-[#D8AD50]",
      shadow: "shadow-[#D8AD50]/25",
      darkShadow: "dark:shadow-[#493512]/35",
      description: "text-white",
      glow: "bg-[#FFF5D9]/20",
    },
  },
  metallicRoseGold: {
    label: "Metallic Rose Gold",
    swatch: "bg-[#E5B6AC]",
    accent: "#A85D57",
    iconGradient: "from-[#713A3B] via-[#A85D57] to-[#D99A91]",
    pageHeading:
      "from-[#713A3B] via-[#A85D57] to-[#D99A91] dark:from-[#FFF0ED] dark:via-[#E5B6AC] dark:to-[#D99A91]",
    featureHeader: {
      gradient: "from-[#713A3B] via-[#A85D57] to-[#D99A91]",
      shadow: "shadow-[#D99A91]/25",
      darkShadow: "dark:shadow-[#4C2427]/35",
      description: "text-white",
      glow: "bg-[#FFF0ED]/20",
    },
  },
  moodyMidnight: {
    label: "Dark Moody Midnight",
    swatch: "bg-[#65718E]",
    accent: "#283653",
    iconGradient: "from-[#111827] via-[#283653] to-[#65718E]",
    pageHeading:
      "from-[#111827] via-[#283653] to-[#65718E] dark:from-[#E7ECF7] dark:via-[#65718E] dark:to-[#65718E]",
    featureHeader: {
      gradient: "from-[#111827] via-[#283653] to-[#65718E]",
      shadow: "shadow-[#65718E]/25",
      darkShadow: "dark:shadow-[#0B1020]/35",
      description: "text-white",
      glow: "bg-[#E7ECF7]/20",
    },
  },
  moodyForest: {
    label: "Dark Moody Forest",
    swatch: "bg-[#71866C]",
    accent: "#304A36",
    iconGradient: "from-[#14251B] via-[#304A36] to-[#71866C]",
    pageHeading:
      "from-[#14251B] via-[#304A36] to-[#71866C] dark:from-[#E6EFE3] dark:via-[#71866C] dark:to-[#71866C]",
    featureHeader: {
      gradient: "from-[#14251B] via-[#304A36] to-[#71866C]",
      shadow: "shadow-[#71866C]/25",
      darkShadow: "dark:shadow-[#0B1A10]/35",
      description: "text-white",
      glow: "bg-[#E6EFE3]/20",
    },
  },
  moodyAubergine: {
    label: "Dark Moody Aubergine",
    swatch: "bg-[#92708F]",
    accent: "#543653",
    iconGradient: "from-[#28182C] via-[#543653] to-[#92708F]",
    pageHeading:
      "from-[#28182C] via-[#543653] to-[#92708F] dark:from-[#F0E5F0] dark:via-[#92708F] dark:to-[#92708F]",
    featureHeader: {
      gradient: "from-[#28182C] via-[#543653] to-[#92708F]",
      shadow: "shadow-[#92708F]/25",
      darkShadow: "dark:shadow-[#1A0F1D]/35",
      description: "text-white",
      glow: "bg-[#F0E5F0]/20",
    },
  },
  palePorcelain: {
    label: "Pale Porcelain",
    swatch: "bg-[#E6E8E5]",
    accent: "#929B96",
    iconGradient: "from-[#59615C] via-[#929B96] to-[#C9D0CC]",
    pageHeading:
      "from-[#59615C] via-[#929B96] to-[#C9D0CC] dark:from-[#FAFBF9] dark:via-[#E6E8E5] dark:to-[#C9D0CC]",
    featureHeader: {
      gradient: "from-[#59615C] via-[#929B96] to-[#C9D0CC]",
      shadow: "shadow-[#C9D0CC]/25",
      darkShadow: "dark:shadow-[#3B413D]/35",
      description: "text-white",
      glow: "bg-[#FAFBF9]/20",
    },
  },
  paleBlush: {
    label: "Pale Blush",
    swatch: "bg-[#F4DDE3]",
    accent: "#C58D9B",
    iconGradient: "from-[#875663] via-[#C58D9B] to-[#E5BFC9]",
    pageHeading:
      "from-[#875663] via-[#C58D9B] to-[#E5BFC9] dark:from-[#FFF5F7] dark:via-[#F4DDE3] dark:to-[#E5BFC9]",
    featureHeader: {
      gradient: "from-[#875663] via-[#C58D9B] to-[#E5BFC9]",
      shadow: "shadow-[#E5BFC9]/25",
      darkShadow: "dark:shadow-[#5C3440]/35",
      description: "text-white",
      glow: "bg-[#FFF5F7]/20",
    },
  },
  paleSage: {
    label: "Pale Sage",
    swatch: "bg-[#DCE7D5]",
    accent: "#91A783",
    iconGradient: "from-[#526A49] via-[#91A783] to-[#B8C9AC]",
    pageHeading:
      "from-[#526A49] via-[#91A783] to-[#B8C9AC] dark:from-[#F4F8F0] dark:via-[#DCE7D5] dark:to-[#B8C9AC]",
    featureHeader: {
      gradient: "from-[#526A49] via-[#91A783] to-[#B8C9AC]",
      shadow: "shadow-[#B8C9AC]/25",
      darkShadow: "dark:shadow-[#34442D]/35",
      description: "text-white",
      glow: "bg-[#F4F8F0]/20",
    },
  },
  brightCitrus: {
    label: "Bright Citrus",
    swatch: "bg-[#E8F66A]",
    accent: "#8AA500",
    iconGradient: "from-[#526600] via-[#8AA500] to-[#C8E52E]",
    pageHeading:
      "from-[#526600] via-[#8AA500] to-[#C8E52E] dark:from-[#F8FFD9] dark:via-[#E8F66A] dark:to-[#C8E52E]",
    featureHeader: {
      gradient: "from-[#526600] via-[#8AA500] to-[#C8E52E]",
      shadow: "shadow-[#C8E52E]/25",
      darkShadow: "dark:shadow-[#354200]/35",
      description: "text-white",
      glow: "bg-[#F8FFD9]/20",
    },
  },
  brightAqua: {
    label: "Bright Aqua",
    swatch: "bg-[#7CEBDD]",
    accent: "#008F91",
    iconGradient: "from-[#00585D] via-[#008F91] to-[#37CDBD]",
    pageHeading:
      "from-[#00585D] via-[#008F91] to-[#37CDBD] dark:from-[#DFFFFA] dark:via-[#7CEBDD] dark:to-[#37CDBD]",
    featureHeader: {
      gradient: "from-[#00585D] via-[#008F91] to-[#37CDBD]",
      shadow: "shadow-[#37CDBD]/25",
      darkShadow: "dark:shadow-[#00383B]/35",
      description: "text-white",
      glow: "bg-[#DFFFFA]/20",
    },
  },
  brightFuchsia: {
    label: "Bright Fuchsia",
    swatch: "bg-[#F49AE1]",
    accent: "#C21891",
    iconGradient: "from-[#78105B] via-[#C21891] to-[#E852BE]",
    pageHeading:
      "from-[#78105B] via-[#C21891] to-[#E852BE] dark:from-[#FFF0FB] dark:via-[#F49AE1] dark:to-[#E852BE]",
    featureHeader: {
      gradient: "from-[#78105B] via-[#C21891] to-[#E852BE]",
      shadow: "shadow-[#E852BE]/25",
      darkShadow: "dark:shadow-[#4A0A38]/35",
      description: "text-white",
      glow: "bg-[#FFF0FB]/20",
    },
  },
  richEmerald: {
    label: "Rich Emerald",
    swatch: "bg-[#75B89A]",
    accent: "#176B4D",
    iconGradient: "from-[#0B3E2C] via-[#176B4D] to-[#3F9973]",
    pageHeading:
      "from-[#0B3E2C] via-[#176B4D] to-[#3F9973] dark:from-[#DDF3E8] dark:via-[#75B89A] dark:to-[#3F9973]",
    featureHeader: {
      gradient: "from-[#0B3E2C] via-[#176B4D] to-[#3F9973]",
      shadow: "shadow-[#3F9973]/25",
      darkShadow: "dark:shadow-[#082D20]/35",
      description: "text-white",
      glow: "bg-[#DDF3E8]/20",
    },
  },
  richBurgundy: {
    label: "Rich Burgundy",
    swatch: "bg-[#C47A8C]",
    accent: "#76263E",
    iconGradient: "from-[#421322] via-[#76263E] to-[#A94761]",
    pageHeading:
      "from-[#421322] via-[#76263E] to-[#A94761] dark:from-[#F7E2E8] dark:via-[#C47A8C] dark:to-[#A94761]",
    featureHeader: {
      gradient: "from-[#421322] via-[#76263E] to-[#A94761]",
      shadow: "shadow-[#A94761]/25",
      darkShadow: "dark:shadow-[#2B0C15]/35",
      description: "text-white",
      glow: "bg-[#F7E2E8]/20",
    },
  },
  richSapphire: {
    label: "Rich Sapphire",
    swatch: "bg-[#779FE3]",
    accent: "#234EAA",
    iconGradient: "from-[#132C66] via-[#234EAA] to-[#4F7DD0]",
    pageHeading:
      "from-[#132C66] via-[#234EAA] to-[#4F7DD0] dark:from-[#E2EBFF] dark:via-[#779FE3] dark:to-[#4F7DD0]",
    featureHeader: {
      gradient: "from-[#132C66] via-[#234EAA] to-[#4F7DD0]",
      shadow: "shadow-[#4F7DD0]/25",
      darkShadow: "dark:shadow-[#0D1D48]/35",
      description: "text-white",
      glow: "bg-[#E2EBFF]/20",
    },
  },
} as const;

export type NamedPagePalette = keyof typeof pagePaletteStyles;
export type PagePalette = "default" | NamedPagePalette;

export const pagePaletteOptions: {
  value: NamedPagePalette;
  label: string;
  swatch: string;
}[] = (Object.keys(pagePaletteStyles) as NamedPagePalette[]).map((value) => ({
  value,
  label: pagePaletteStyles[value].label,
  swatch: pagePaletteStyles[value].swatch,
}));

export function isPagePalette(value: unknown): value is PagePalette {
  return (
    value === "default" ||
    (typeof value === "string" &&
      Object.prototype.hasOwnProperty.call(pagePaletteStyles, value))
  );
}

export function getPagePaletteStyles(palette: NamedPagePalette) {
  return pagePaletteStyles[palette];
}
