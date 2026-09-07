import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { HireLabourForm } from "@frontend/components/workforce/hire-form";
import { getSettings } from "@backend/services/settings.service";

export const dynamic = "force-dynamic";

export default async function HireLabourPage() {
  const settings = await getSettings();
  const companyName = settings.company_name || "Dezoryn Contractor";

  return (
    <SiteShell settings={settings}>
      <PageHero
        eyebrow="EPC & MAIN CONTRACTOR REQUISITIONS"
        breadcrumbCurrent="Post Labour Requirement"
        title="Source Certified Highway & Infrastructure Labour."
        text={`Submit your project staffing requisitions for bar benders, paver operators, crash barrier crews, and general civil manpower. ${companyName} pairs you with pre-vetted agencies for fast on-site mobilization.`}
      />

      <section className="py-20 bg-[#f8fafc] text-[#0f172a]">
        <div className="container max-w-4xl">
          <HireLabourForm />
        </div>
      </section>
    </SiteShell>
  );
}
