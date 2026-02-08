import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Bot, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ResponseDisplayProps {
  response: string | null;
  audioBase64: string | null;
  facilitiesAnalyzed: number;
  isVoiceResponse: boolean;
}

export function ResponseDisplay({
  response,
  audioBase64,
  facilitiesAnalyzed,
  isVoiceResponse,
}: ResponseDisplayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioBase64]);

  useEffect(() => {
    // Auto-play when voice response arrives
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

  if (!response) return null;

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
              AI Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              {facilitiesAnalyzed > 0
                ? `Based on ${facilitiesAnalyzed} facilities`
                : "General healthcare intelligence"}
            </p>
          </div>
        </div>
        {isVoiceResponse && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Volume2 className="h-3 w-3" />
            Voice
          </div>
        )}
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
                <span>
                  {formatTime((progress / 100) * duration)}
                </span>
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

      {/* Text Response */}
      <div className="prose prose-sm max-w-none">
        <div className="flex items-start gap-2 mb-2">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium">Response</span>
        </div>
        <div className="text-foreground leading-relaxed whitespace-pre-wrap pl-6">
          {response}
        </div>
      </div>
    </Card>
  );
}
