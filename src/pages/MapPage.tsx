import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HealthcareMap } from "@/components/map/HealthcareMap";
import { FacilityDetail } from "@/components/facilities/FacilityDetail";
import { useFacilities } from "@/hooks/useFacilities";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Facility, MapMarker } from "@/types/healthcare";

const MapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { facilities, loading, mapMarkers, stats } = useFacilities();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Get region filter from URL
  const regionFilter = searchParams.get("region");

  // Get unique regions from markers
  const availableRegions = useMemo(() => {
    const regions = new Set(mapMarkers.map((m) => m.region));
    return Array.from(regions).sort();
  }, [mapMarkers]);

  const handleMarkerClick = (marker: MapMarker) => {
    const facility = facilities.find((f) => f.id === marker.id);
    if (facility) {
      setSelectedFacility(facility);
      setIsDetailOpen(true);
    }
  };

  const clearRegionFilter = () => {
    searchParams.delete("region");
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout alertCount={stats.criticalAlerts.length}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Interactive Map
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize healthcare facilities, gaps, and medical deserts
            </p>
          </div>

          {/* Active region filter indicator */}
          {regionFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering by:</span>
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                📍 {regionFilter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={clearRegionFilter}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        <HealthcareMap
          markers={mapMarkers}
          onMarkerClick={handleMarkerClick}
          selectedRegion={regionFilter || undefined}
          className="rounded-xl overflow-hidden"
        />

        <FacilityDetail
          facility={selectedFacility}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default MapPage;
