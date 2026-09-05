import { prisma } from "../db/prisma";
import { DEFAULT_SITE_SETTINGS, PUBLIC_SETTINGS_KEYS } from "@shared/constants";
import type { SiteSettings } from "@shared/types";

/**
 * Returns strictly public website metadata.
 * Strips all internal SMTP credentials, Brevo keys, and sensitive tokens.
 */
export async function getPublicSettings(): Promise<SiteSettings> {
  const allSettings = await getSettings();
  const publicSettings: SiteSettings = {};

  for (const key of PUBLIC_SETTINGS_KEYS) {
    if (allSettings[key] !== undefined) {
      publicSettings[key] = allSettings[key];
    }
  }

  return publicSettings;
}

/**
 * Internal helper to get all settings from PostgreSQL
 */
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

/**
 * Returns settings for Admin Control Centre
 */
export async function getAdminSettings(): Promise<Record<string, string | boolean>> {
  const settings = await getSettings();
  const hasKey = Boolean(settings.brevo_smtp_key && settings.brevo_smtp_key.trim().length > 0);
  const { brevo_smtp_key, ...safeSettings } = settings;
  return {
    ...safeSettings,
    has_brevo_smtp_key: hasKey,
  };
}

/**
 * Persists settings to PostgreSQL with secret preservation
 */
export async function saveSettings(settings: SiteSettings): Promise<void> {
  const currentSettings = await getSettings();
  const entries = Object.entries(settings);

  for (const [key, rawValue] of entries) {
    let value = String(rawValue ?? "").trim();

    // Preserve existing secret key if submitted as empty/masked placeholder
    if (key === "brevo_smtp_key") {
      if ((value === "" || value === "••••••••") && currentSettings.brevo_smtp_key) {
        value = currentSettings.brevo_smtp_key;
      }
    }

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
