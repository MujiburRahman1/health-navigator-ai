import { useState } from "react";
import { HealthcareHeader } from "@/components/HealthcareHeader";
import { DatasetUpload } from "@/components/DatasetUpload";
import { QuestionInput } from "@/components/QuestionInput";
import { ResponseDisplay } from "@/components/ResponseDisplay";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [facilitiesCount, setFacilitiesCount] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [facilitiesAnalyzed, setFacilitiesAnalyzed] = useState(0);
  const [isVoiceResponse, setIsVoiceResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"chat" | "voice" | null>(null);
  const { toast } = useToast();

  const handleUploadComplete = (count: number) => {
    setFacilitiesCount(count);
  };

  const handleChatSubmit = async (question: string) => {
    setIsLoading(true);
    setLoadingType("chat");
    setResponse(null);
    setAudioBase64(null);
    setIsVoiceResponse(false);

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

      if (data.error && !data.audio) {
        toast({
          title: "Voice generation issue",
          description: data.error,
          variant: "default",
        });
      }
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-4xl mx-auto pb-16">
        <HealthcareHeader facilitiesCount={facilitiesCount} />

        <main className="px-4 space-y-6">
          {/* Dataset Upload Section */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                1
              </span>
              Upload Dataset
            </h2>
            <DatasetUpload onUploadComplete={handleUploadComplete} />
          </section>

          {/* Question Input Section */}
          <section>
            <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                2
              </span>
              Ask Your Question
            </h2>
            <QuestionInput
              onChatSubmit={handleChatSubmit}
              onVoiceSubmit={handleVoiceSubmit}
              isLoading={isLoading}
              loadingType={loadingType}
            />
          </section>

          {/* Response Section */}
          {(response || isLoading) && (
            <section>
              <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  3
                </span>
                AI Response
              </h2>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-hero opacity-20 animate-ping" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-hero animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {loadingType === "voice" 
                      ? "Analyzing data and generating voice response..." 
                      : "Analyzing healthcare data..."}
                  </p>
                </div>
              ) : (
                <ResponseDisplay
                  response={response}
                  audioBase64={audioBase64}
                  facilitiesAnalyzed={facilitiesAnalyzed}
                  isVoiceResponse={isVoiceResponse}
                />
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground px-4">
          <p>Built for healthcare equity and explainable AI</p>
          <p className="mt-1 text-xs">
            Powered by Lovable AI • ElevenLabs Voice
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
