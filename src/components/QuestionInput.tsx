import { useState } from "react";
import { MessageSquare, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface QuestionInputProps {
  onChatSubmit: (question: string) => void;
  onVoiceSubmit: (question: string) => void;
  isLoading: boolean;
  loadingType: "chat" | "voice" | null;
}

const EXAMPLE_PROMPTS = [
  "What regions have the least access to cardiac care?",
  "Which facilities claim surgical capabilities but lack operating rooms?",
  "Identify any suspicious patterns in the equipment claims",
  "What specialties are underrepresented in rural areas?",
];

export function QuestionInput({
  onChatSubmit,
  onVoiceSubmit,
  isLoading,
  loadingType,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");

  const handleChatClick = () => {
    if (question.trim()) {
      onChatSubmit(question);
    }
  };

  const handleVoiceClick = () => {
    if (question.trim()) {
      onVoiceSubmit(question);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setQuestion(prompt);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Ask a Question
        </label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about healthcare access gaps, equipment mismatches, or facility analysis..."
          className="min-h-[120px] resize-none text-base"
          disabled={isLoading}
        />
      </div>

      {/* Example prompts */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {prompt.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleChatClick}
          disabled={!question.trim() || isLoading}
          className="flex-1 h-12 text-base font-medium bg-gradient-hero hover:opacity-90 transition-opacity"
        >
          {isLoading && loadingType === "chat" ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-5 w-5 mr-2" />
          )}
          Chat Recommendation
        </Button>

        <Button
          onClick={handleVoiceClick}
          disabled={!question.trim() || isLoading}
          variant="outline"
          className="flex-1 h-12 text-base font-medium border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
        >
          {isLoading && loadingType === "voice" ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Volume2 className="h-5 w-5 mr-2" />
          )}
          Voice Recommendation
        </Button>
      </div>
    </Card>
  );
}
