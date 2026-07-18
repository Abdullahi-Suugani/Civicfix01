import { statusMeta } from "../constants";

export default function StatusBadge({ status, size = "sm" }) {
  const meta = statusMeta(status);
  const sizes = size === "lg" ? "text-xs px-3 py-1.5" : "text-[10px] px-2 py-1";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-semibold uppercase tracking-wider ${sizes}`}
      style={{ color: meta.color, border: `1.5px solid ${meta.color}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
