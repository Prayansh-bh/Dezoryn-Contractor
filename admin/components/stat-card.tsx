import { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="stat-card">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <Icon />
    </div>
  );
}
