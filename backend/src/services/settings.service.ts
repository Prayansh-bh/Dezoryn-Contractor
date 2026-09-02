import { prisma } from "../db/prisma";
import { DEFAULT_SITE_SETTINGS } from "@shared/constants";
import type { SiteSettings } from "@shared/types";

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    if (rows.length === 0) {
      return DEFAULT_SITE_SETTINGS;
    }
    const settingsMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SITE_SETTINGS, ...settingsMap };
  } catch (error) {
    console.warn("⚠️ [SettingsService] Error fetching settings, returning defaults:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const entries = Object.entries(settings);
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
}
