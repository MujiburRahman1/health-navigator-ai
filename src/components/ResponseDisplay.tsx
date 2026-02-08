import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Bot, FileText, MapPin, AlertTriangle, ChevronDown, ChevronUp, Building2, Phone, Globe, Stethoscope, Wrench, Scissors, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Citation {
  id: string;
  name: string;
  region: string | null;
  specialties: string | null;
  equipment?: string | null;
  procedures?: string | null;
  phone?: string | null;
  website?: string | null;
  source_url?: string | null;
  capability?: string | null;
}

interface ResponseDisplayProps {
  response: string | null;
  audioBase64: string | null;
  facilitiesAnalyzed: number;
  isVoiceResponse: boolean;
  citations?: Citation[];
  anomaliesDetected?: number;
  coldSpots?: string[];
  regionalSummary?: Record<string, number>;
}

export function ResponseDisplay({
  response,
  audioBase64,
  facilitiesAnalyzed,
  isVoiceResponse,
  citations = [],
  anomaliesDetected = 0,
  coldSpots = [],
  regionalSummary = {},
}: ResponseDisplayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCitations, setShowCitations] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isCitationDetailOpen, setIsCitationDetailOpen] = useState(false);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioBase64]);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [audioBase64]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(value[0]);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Clean markdown formatting from response
  const cleanResponse = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*\*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/^\s*\*\s+/gm, "• ")
      .replace(/---+/g, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
  };

  if (!response) return null;

  const formattedResponse = cleanResponse(response);
  const hasCitations = citations.length > 0;
  const hasInsights = coldSpots.length > 0 || anomaliesDetected > 0;

  return (
    <Card className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-hero">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              VF Agent Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              {facilitiesAnalyzed > 0
                ? `Analyzed ${facilitiesAnalyzed} facilities`
                : "General healthcare intelligence"}
              {anomaliesDetected > 0 && ` • ${anomaliesDetected} anomalies detected`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasCitations && (
            <Badge variant="secondary" className="text-xs">
              {citations.length} citations
            </Badge>
          )}
          {isVoiceResponse && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              <Volume2 className="h-3 w-3" />
              Voice
            </div>
          )}
        </div>
      </div>

      {/* Audio Player */}
      {audioBase64 && (
        <div className="mb-4 p-4 rounded-lg bg-muted/50">
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <div className="flex-1 space-y-1">
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime((progress / 100) * duration)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Insights Panel */}
      {hasInsights && (
        <div className="mb-4">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-foreground">
                Key Insights
              </span>
              {coldSpots.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {coldSpots.length} cold spots
                </Badge>
              )}
            </div>
            {showInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showInsights && (
            <div className="mt-2 p-3 rounded-lg bg-muted/30 space-y-2">
              {coldSpots.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Cardiac Care Cold Spots:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {coldSpots.map((spot, idx) => (
                      <a
                        key={idx}
                        href={`/map?region=${encodeURIComponent(spot)}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-destructive/50 text-destructive bg-destructive/5 hover:bg-destructive/15 hover:border-destructive transition-colors cursor-pointer"
                      >
                        <MapPin className="h-3 w-3" />
                        {spot}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(regionalSummary).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Regional Distribution:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(regionalSummary)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([region, count]) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}: {count}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Text Response */}
      <div className="prose prose-sm max-w-none">
        <div className="flex items-start gap-2 mb-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium">Response</span>
        </div>
        <div className="text-foreground leading-relaxed whitespace-pre-wrap pl-6">
          {formattedResponse}
        </div>
      </div>

      {/* Citations Panel */}
      {hasCitations && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">
              📋 Facility Citations ({citations.length})
            </span>
            {showCitations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showCitations && (
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {citations.map((citation) => (
                <button
                  key={citation.id}
                  onClick={() => {
                    setSelectedCitation(citation);
                    setIsCitationDetailOpen(true);
                  }}
                  className="w-full p-3 rounded-lg bg-muted/30 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0 text-[10px] group-hover:border-primary group-hover:text-primary">
                      FAC-{citation.id.slice(0, 8)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {citation.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {citation.region || 'Unknown region'}
                        {citation.specialties && ` • ${citation.specialties.slice(0, 40)}${citation.specialties.length > 40 ? '...' : ''}`}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Citation Detail Sheet */}
      <Sheet open={isCitationDetailOpen} onOpenChange={setIsCitationDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedCitation && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-left">{selectedCitation.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedCitation.region || "Unknown Region"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit mt-2 text-xs">
                  FAC-{selectedCitation.id.slice(0, 8)}
                </Badge>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-6">
                  {/* Contact info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-foreground">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {selectedCitation.region || "Location not specified"}
                        </span>
                      </div>
                      {selectedCitation.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{selectedCitation.phone}</span>
                        </div>
                      )}
                      {selectedCitation.website && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={selectedCitation.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {selectedCitation.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Specialties */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm text-foreground">Specialties</h4>
                    </div>
                    {selectedCitation.specialties ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCitation.specialties.split(",").map((s, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {s.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No specialties listed
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Procedures */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm text-foreground">Procedures</h4>
                    </div>
                    {selectedCitation.procedures ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCitation.procedures.split(",").map((p, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {p.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No procedures listed
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Equipment */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm text-foreground">Equipment</h4>
                      {(!selectedCitation.equipment || selectedCitation.equipment === "None") && (
                        <Badge variant="destructive" className="text-xs">Missing</Badge>
                      )}
                    </div>
                    {selectedCitation.equipment && selectedCitation.equipment !== "None" ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCitation.equipment.split(",").map((eq, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {eq.trim()}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No equipment reported
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Capability */}
                  {selectedCitation.capability && (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-foreground">Capability</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedCitation.capability}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Data source */}
                  {selectedCitation.source_url && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-foreground">Data Source</h4>
                      <Card className="bg-muted/50">
                        <div className="p-3">
                          <a
                            href={selectedCitation.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            View original document
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* ID Reference */}
                  <div className="text-xs text-muted-foreground">
                    <p>Citation ID: {selectedCitation.id}</p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
