import { Activity, Database, Sparkles } from "lucide-react";

interface HealthcareHeaderProps {
  facilitiesCount: number;
}

export function HealthcareHeader({ facilitiesCount }: HealthcareHeaderProps) {
  return (
    <header className="relative py-12 px-4 text-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-hero shadow-glow">
              <Activity className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute -right-1 -top-1 flex items-center justify-center h-7 w-7 rounded-full bg-accent border-2 border-background">
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-gradient">Healthcare Intelligence</span>
          <br />
          <span className="text-foreground">AI System</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          Analyze healthcare facility data, detect access gaps, identify equipment mismatches, 
          and get AI-powered recommendations via chat or voice.
        </p>

        {/* Stats badge */}
        {facilitiesCount > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium animate-scale-in">
            <Database className="h-4 w-4" />
            <span>{facilitiesCount} facilities loaded</span>
          </div>
        )}
      </div>
    </header>
  );
}
