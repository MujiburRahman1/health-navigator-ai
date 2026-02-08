import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { RegionOverview } from "@/components/dashboard/RegionOverview";
import { QuestionInput } from "@/components/QuestionInput";
import { ResponseDisplay } from "@/components/ResponseDisplay";
import { useFacilities } from "@/hooks/useFacilities";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  MapPinOff,
  FileWarning,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Citation {
  id: string;
  name: string;
  region: string | null;
  specialties: string | null;
}

const Dashboard = () => {
  const { facilities, loading, stats, regionStats } = useFacilities();
  const [response, setResponse] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [facilitiesAnalyzed, setFacilitiesAnalyzed] = useState(0);
  const [isVoiceResponse, setIsVoiceResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"chat" | "voice" | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [anomaliesDetected, setAnomaliesDetected] = useState(0);
  const [coldSpots, setColdSpots] = useState<string[]>([]);
  const [regionalSummary, setRegionalSummary] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleChatSubmit = async (question: string) => {
    setIsLoading(true);
    setLoadingType("chat");
    setResponse(null);
    setAudioBase64(null);
    setIsVoiceResponse(false);
    setCitations([]);
    setAnomaliesDetected(0);
    setColdSpots([]);
    setRegionalSummary({});

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/healthcare-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setResponse(data.answer);
      setFacilitiesAnalyzed(data.facilities_analyzed || 0);
      setCitations(data.citations || []);
      setAnomaliesDetected(data.anomalies_detected || 0);
      setColdSpots(data.cold_spots || []);
      setRegionalSummary(data.regional_summary || {});
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleVoiceSubmit = async (question: string) => {
    setIsLoading(true);
    setLoadingType("voice");
    setResponse(null);
    setAudioBase64(null);
    setIsVoiceResponse(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/healthcare-voice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ question }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setResponse(data.answer);
      setAudioBase64(data.audio || null);
      setFacilitiesAnalyzed(data.facilities_analyzed || 0);
    } catch (error) {
      console.error("Voice error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
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
        {/* Page header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time healthcare infrastructure analysis across all regions
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Facilities"
            value={stats.totalFacilities}
            subtitle="Healthcare providers"
            icon={<Building2 className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Medical Deserts"
            value={stats.medicalDeserts}
            subtitle="Underserved regions"
            icon={<MapPinOff className="h-6 w-6" />}
            variant="danger"
          />
          <StatCard
            title="Incomplete Records"
            value={stats.incompleteRecords}
            subtitle="Missing data"
            icon={<FileWarning className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Suspicious Claims"
            value={stats.suspiciousClaims}
            subtitle="Require review"
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="danger"
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - AI Query */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold mb-4">
                AI Healthcare Assistant
              </h2>
              <QuestionInput
                onChatSubmit={handleChatSubmit}
                onVoiceSubmit={handleVoiceSubmit}
                isLoading={isLoading}
                loadingType={loadingType}
              />
            </Card>

            {/* AI Response */}
            {(response || isLoading) && (
              <div>
                {isLoading ? (
                  <Card className="p-8">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-gradient-hero opacity-20 animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-hero animate-pulse" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {loadingType === "voice"
                          ? "Generating voice response..."
                          : "Analyzing healthcare data..."}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <ResponseDisplay
                    response={response}
                    audioBase64={audioBase64}
                    facilitiesAnalyzed={facilitiesAnalyzed}
                    isVoiceResponse={isVoiceResponse}
                    citations={citations}
                    anomaliesDetected={anomaliesDetected}
                    coldSpots={coldSpots}
                    regionalSummary={regionalSummary}
                  />
                )}
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/map">View Map</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/facilities">Browse Facilities</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/analytics">View Analytics</Link>
              </Button>
            </div>
          </div>

          {/* Right column - Alerts & Regions */}
          <div className="space-y-6">
            <AlertsList
              alerts={stats.criticalAlerts}
              maxHeight="280px"
            />
            <RegionOverview regions={regionStats} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
