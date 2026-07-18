import { Link } from "react-router-dom";
import { MapPin, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

export default function ReportCard({ report }) {
  const image = report.images?.[0];
  return (
    <Link
      to={`/reports/${report.id}`}
      className="card group relative flex overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* perforated ticket-stub edge */}
      <div className="relative w-2 shrink-0 bg-civic-paper">
        <div className="absolute inset-0 text-civic-line bg-perforation" />
      </div>

      <div className="flex flex-1 flex-col">
        {image ? (
          <div className="h-36 w-full overflow-hidden bg-civic-line">
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-civic-navy/5 font-mono text-xs text-civic-mist">
            No photo attached
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold leading-snug text-civic-ink line-clamp-2">
              {report.title}
            </h3>
            <PriorityBadge priority={report.priority} />
          </div>

          <p className="text-sm text-civic-mist line-clamp-2">{report.description}</p>

          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-civic-mist">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} /> {report.address || report.category?.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={13} /> {report._count?.comments ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-civic-line pt-2">
            <StatusBadge status={report.status} />
            <span className="font-mono text-[11px] text-civic-mist">
              {report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
