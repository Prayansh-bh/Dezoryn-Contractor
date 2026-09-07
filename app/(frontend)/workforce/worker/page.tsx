import { SiteShell, PageHero } from "@frontend/components/site-shell";
import { WorkerRegisterForm } from "@frontend/components/workforce/worker-form";
import { getSettings } from "@backend/services/settings.service";

export const dynamic = "force-dynamic";

export default async function WorkerRegisterPage() {
  const settings = await getSettings();

  return (
    <SiteShell settings={settings}>
      <PageHero
        eyebrow="DIRECT ARTISAN & OPERATOR ENROLLMENT"
        breadcrumbCurrent="Join as Worker"
        title="Register in the Dezoryn Construction Skill Registry."
        text="Free registration for heavy machine operators, bar benders, shuttering carpenters, masons, and highway workers. Get direct job placements with regular wages, safe site camps, and lodging."
      />

      <section className="py-20 bg-[#f8fafc] text-[#0f172a]">
        <div className="container max-w-4xl">
          <WorkerRegisterForm />
        </div>
      </section>
    </SiteShell>
  );
}
