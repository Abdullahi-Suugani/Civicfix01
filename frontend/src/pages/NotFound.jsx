import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <MapPinOff size={40} className="mb-4 text-civic-mist" />
      <h1 className="font-display text-2xl font-bold text-civic-ink">Page not found</h1>
      <p className="mt-2 text-sm text-civic-mist">
        That page doesn't exist — it may have been moved, or the link might be off.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
