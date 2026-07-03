import type { IProfile } from "@/models/Profile";

const BRAND_FIELDS: (keyof IProfile)[] = [
  "companyName",
  "logo",
  "bio",
  "industry",
  "location",
  "website",
  "targetAudience",
  "marketingBudget",
];

export interface ProfileCompletenessResult {
  percent: number;
  missing: string[];
}

const FIELD_LABELS: Partial<Record<keyof IProfile, string>> = {
  companyName: "Add company name",
  logo: "Upload brand logo",
  bio: "Add brand description",
  industry: "Set your industry",
  location: "Add location",
  website: "Add website URL",
  targetAudience: "Define target audience",
  marketingBudget: "Set marketing budget",
};

export function calculateProfileCompleteness(
  profile: Partial<IProfile> | null,
  role: string,
): ProfileCompletenessResult {
  if (!profile) {
    return {
      percent: 0,
      missing: ["Complete your profile to get started"],
    };
  }

  const fields: (keyof IProfile)[] =
    role === "brand"
      ? BRAND_FIELDS
      : (["companyName", "bio", "industry", "targetAudience"] as (keyof IProfile)[]);

  const missing: string[] = [];
  let filled = 0;

  for (const field of fields) {
    const val = profile[field as keyof IProfile];
    if (val != null && val !== "") {
      filled++;
    } else {
      missing.push(FIELD_LABELS[field] ?? `Add ${String(field)}`);
    }
  }

  const percent = Math.round((filled / fields.length) * 100);
  return { percent, missing };
}
