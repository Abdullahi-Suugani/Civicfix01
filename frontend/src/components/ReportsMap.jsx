import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MAP_MARKER_COLORS } from "../constants";
import StatusBadge from "./StatusBadge";

function coloredIcon(color) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:16px;height:16px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function ReportsMap({
  reports = [],
  center = [2.0469, 45.3182], // Mogadishu, default civic center
  zoom = 13,
  height = "500px",
  onMarkerClick,
  pickable = false,
  onPick,
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-civic-line">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {pickable && <MapClickHandler onPick={onPick} />}
        {reports.map((r) => (
          <Marker
            key={r.id}
            position={[r.latitude, r.longitude]}
            icon={coloredIcon(MAP_MARKER_COLORS[r.status] || "#6B7686")}
            eventHandlers={{ click: () => onMarkerClick?.(r) }}
          >
            <Popup>
              <div className="max-w-[200px] space-y-1">
                <p className="font-display text-sm font-semibold">{r.title}</p>
                <StatusBadge status={r.status} />
                <Link to={`/reports/${r.id}`} className="block pt-1 text-xs font-semibold text-civic-teal">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng);
    },
  });
  return null;
}
