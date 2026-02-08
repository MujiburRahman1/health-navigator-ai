import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Filter, Layers, ZoomIn, ZoomOut, Locate, Tag, Tags } from "lucide-react";
import type { MapMarker } from "@/types/healthcare";
import "leaflet/dist/leaflet.css";

interface HealthcareMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  selectedRegion?: string;
  className?: string;
}

// Create custom marker icons with optional name labels
const createMarkerIcon = (status: MapMarker["status"], type: MapMarker["type"], name: string, showLabel: boolean) => {
  const colors = {
    operational: "#22c55e",
    limited: "#f59e0b",
    suspicious: "#ef4444",
    incomplete: "#94a3b8",
  };

  const bgColor = colors[status];
  const size = type === "hospital" ? 32 : 24;
  
  // Truncate name for display
  const displayName = name.length > 20 ? name.substring(0, 18) + "..." : name;

  const labelHtml = showLabel ? `
    <div style="
      background: rgba(0, 0, 0, 0.75);
      color: white;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 4px;
      white-space: nowrap;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    ">${displayName}</div>
  ` : '';

  return new DivIcon({
    className: "custom-marker-with-label",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; position: relative;">
        <div style="
          background: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
          </svg>
        </div>
        ${labelHtml}
      </div>
    `,
    iconSize: [150, size + (showLabel ? 24 : 0)],
    iconAnchor: [75, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Medical desert circle marker
function MedicalDesertArea({ center, radius }: { center: [number, number]; radius: number }) {
  return (
    <Circle
      center={center}
      radius={radius}
      pathOptions={{
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.1,
        dashArray: "5, 10",
        weight: 2,
      }}
    />
  );
}

// Map controls component
function MapControls() {
  const map = useMap();

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9 bg-card shadow-md"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9 bg-card shadow-md"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-9 w-9 bg-card shadow-md"
        onClick={() => map.setView([7.9, -1.05], 7)}
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function HealthcareMap({ markers, onMarkerClick, selectedRegion, className }: HealthcareMapProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showLabels, setShowLabels] = useState(true);

  const filteredMarkers = markers.filter((marker) => {
    if (filterStatus !== "all" && marker.status !== filterStatus) return false;
    if (filterType !== "all" && marker.type !== filterType) return false;
    if (selectedRegion && marker.region !== selectedRegion) return false;
    return true;
  });

  // Ghana center coordinates
  const center: [number, number] = [7.9, -1.05];

  return (
    <Card className={className}>
      {/* Filter controls */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters:</span>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="suspicious">Suspicious</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hospital">Hospitals</SelectItem>
            <SelectItem value="clinic">Clinics</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showLabels ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? <Tags className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
          {showLabels ? "Labels On" : "Labels Off"}
        </Button>

        <Badge variant="secondary" className="ml-auto">
          {filteredMarkers.length} facilities
        </Badge>
      </div>

      {/* Map container */}
      <div className="relative h-[500px]">
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapControls />

          {/* Medical desert indicator for regions with few facilities */}
          <MedicalDesertArea center={[10.5, -0.85]} radius={50000} />

          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createMarkerIcon(marker.status, marker.type, marker.name, showLabels)}
              eventHandlers={{
                click: () => onMarkerClick?.(marker),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-foreground mb-1">{marker.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        marker.status === "operational"
                          ? "default"
                          : marker.status === "suspicious"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {marker.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{marker.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    📍 {marker.region}
                  </p>
                  {marker.specialties.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      🏥 {marker.specialties.slice(0, 3).join(", ")}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onMarkerClick?.(marker)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Suspicious</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted-foreground" />
              <span className="text-xs text-muted-foreground">Incomplete</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
              <div className="h-3 w-3 rounded-full border-2 border-dashed border-destructive/50" />
              <span className="text-xs text-muted-foreground">Medical Desert</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
