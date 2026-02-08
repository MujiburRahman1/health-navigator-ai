import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Bot, FileText, MapPin, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface Citation {
  id: string;
  name: string;
  region: string | null;
  specialties: string | null;
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
                      <Badge key={idx} variant="outline" className="text-xs border-destructive/50 text-destructive">
                        <MapPin className="h-3 w-3 mr-1" />
                        {spot}
                      </Badge>
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
              {citations.map((citation, idx) => (
                <div
                  key={citation.id}
                  className="p-2 rounded bg-muted/30 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      FAC-{citation.id.slice(0, 8)}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">{citation.name}</p>
                      <p className="text-muted-foreground">
                        {citation.region || 'Unknown region'}
                        {citation.specialties && ` • ${citation.specialties.slice(0, 50)}${citation.specialties.length > 50 ? '...' : ''}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
