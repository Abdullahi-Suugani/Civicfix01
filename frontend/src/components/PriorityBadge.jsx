import { priorityMeta } from "../constants";

export default function PriorityBadge({ priority }) {
  const meta = priorityMeta(priority);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  );
}
