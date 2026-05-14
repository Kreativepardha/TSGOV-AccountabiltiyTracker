export const PROMISE_STATUSES = [
  "Fulfilled",
  "Partially Fulfilled",
  "In Progress",
  "Delayed",
  "Abandoned",
  "Contradicted",
  "Unverifiable",
] as const

export const EVIDENCE_GRADES = [
  "Official Record",
  "Primary Evidence",
  "Multiple Sources",
  "Single Source",
  "Allegation",
] as const

export const EVIDENCE_GRADE_COLORS: Record<string, string> = {
  "Official Record":   "bg-green-100 text-green-800 border-green-200",
  "Primary Evidence":  "bg-blue-100 text-blue-800 border-blue-200",
  "Multiple Sources":  "bg-sky-100 text-sky-800 border-sky-200",
  "Single Source":     "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Allegation":        "bg-red-100 text-red-800 border-red-200",
}

export const STATUS_COLORS: Record<string, string> = {
  "Fulfilled":           "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Partially Fulfilled": "bg-teal-100 text-teal-800 border-teal-200",
  "In Progress":         "bg-blue-100 text-blue-800 border-blue-200",
  "Delayed":             "bg-amber-100 text-amber-800 border-amber-200",
  "Abandoned":           "bg-red-100 text-red-800 border-red-200",
  "Contradicted":        "bg-rose-100 text-rose-800 border-rose-200",
  "Unverifiable":        "bg-gray-100 text-gray-600 border-gray-200",
}

export const INCIDENT_CATEGORIES = [
  "Welfare Delivery Failure",
  "Infrastructure Failure",
  "Flood / Disaster Management",
  "Law & Order",
  "Education",
  "Farmer Issues",
  "Financial / Fiscal",
  "Environment",
  "Health",
  "Communal / Social",
  "Scam / Corruption Allegation",
  "Minister Controversy",
] as const

export const ELECTION_CYCLES = [
  "2023-Congress",
  "2018-BRS",
  "2014-TRS",
] as const

export const STATUS_SCORE_WEIGHT: Record<string, number> = {
  "Fulfilled":           100,
  "Partially Fulfilled":  60,
  "In Progress":          40,
  "Delayed":              20,
  "Abandoned":             0,
  "Contradicted":          0,
  "Unverifiable":         50,
}

export const TELANGANA_DISTRICTS = [
  "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
  "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
  "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar",
  "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool",
  "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli",
  "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet",
  "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri",
] as const

// ─── Politicians & crime tracking ───────────────────────────────────────────

export const PARTIES = [
  "INC",
  "BRS",
  "BJP",
  "AIMIM",
  "CPI",
  "CPI-M",
  "Independent",
] as const

export const PARTY_COLORS: Record<string, string> = {
  "INC":          "bg-sky-100 text-sky-800 border-sky-200",
  "BRS":          "bg-pink-100 text-pink-800 border-pink-200",
  "BJP":          "bg-orange-100 text-orange-800 border-orange-200",
  "AIMIM":        "bg-emerald-100 text-emerald-800 border-emerald-200",
  "CPI":          "bg-red-100 text-red-800 border-red-200",
  "CPI-M":        "bg-red-100 text-red-800 border-red-200",
  "Independent":  "bg-gray-100 text-gray-700 border-gray-200",
}

export const POSITIONS = [
  "MLA",
  "MP",
  "Minister",
  "CM",
  "Deputy CM",
] as const

export const CASE_TYPES = [
  "IPC",
  "POCSO",
  "Corruption",
  "Defamation",
  "Communal",
  "Economic Offence",
] as const

export const CASE_STATUS_COLORS: Record<string, string> = {
  "pending":    "bg-amber-100 text-amber-800 border-amber-200",
  "convicted":  "bg-red-100 text-red-800 border-red-200",
  "acquitted":  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "withdrawn":  "bg-gray-100 text-gray-700 border-gray-200",
  "stayed":     "bg-sky-100 text-sky-800 border-sky-200",
}

export const CRIME_CATEGORIES = [
  "rape",
  "POCSO",
  "dowry_death",
  "domestic_violence",
  "molestation",
  "trafficking",
  "acid_attack",
  "stalking",
] as const

export const CRIME_CATEGORY_LABELS: Record<string, string> = {
  "rape":              "Rape",
  "POCSO":             "POCSO (Child Sexual Offences)",
  "dowry_death":       "Dowry Death",
  "domestic_violence": "Domestic Violence",
  "molestation":       "Molestation / Outraging Modesty",
  "trafficking":       "Trafficking",
  "acid_attack":       "Acid Attack",
  "stalking":          "Stalking",
}

export const DEMOGRAPHICS = [
  "women",
  "SC/ST",
  "minor",
  "minority",
  "general",
] as const

export const DEMOGRAPHIC_LABELS: Record<string, string> = {
  "women":    "Women",
  "SC/ST":    "SC / ST",
  "minor":    "Minor",
  "minority": "Religious / Linguistic Minority",
  "general":  "General",
}
