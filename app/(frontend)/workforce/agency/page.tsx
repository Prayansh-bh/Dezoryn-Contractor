import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { AgencyRegisterForm } from "@frontend/components/workforce/agency-form";
import { getSettings } from "@backend/services/settings.service";

export const dynamic = "force-dynamic";

export default async function AgencyRegisterPage() {
  const settings = await getSettings();

  return (
    <SiteShell settings={settings}>
      <PageHero
        eyebrow="MANPOWER CONTRACTORS & SUBCONTRACTORS"
        breadcrumbCurrent="Agency Registration"
        title="Register Your Labour Agency & Crew Pool."
        text="Join the Dezoryn network as an approved manpower supply partner. Gain direct access to long-term staffing packages on national highways, bridges, and industrial development sites across India."
      />

      <section className="py-20 bg-[#f8fafc] text-[#0f172a]">
        <div className="container max-w-4xl">
          <AgencyRegisterForm />
        </div>
      </section>
    </SiteShell>
  );
}
